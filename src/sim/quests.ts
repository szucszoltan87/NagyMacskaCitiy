import { BUILDING_IDS, BUILDINGS, CITY_STREETS, DESTINATIONS, isHome, STREETS } from '../data/buildings';
import { SPECIES } from '../data/species';
import { QUEST_COINS } from './balance';
import { isCityCat } from './cats';
import { earn } from './economy';
import { addStars, buildingOpen, notify, streetOpen } from './progress';
import { dayOf, hourOf } from './time';
import type { BuildingId, Diet, DestinationId, Quest, QuestKind, World } from './types';

type Rng = () => number;

export type QuestEvent =
  | { kind: 'etet'; diet: Diet }
  | { kind: 'vasarlas' }
  | { kind: 'recept' }
  | { kind: 'lecke' }
  | { kind: 'hinta' }
  | { kind: 'kivansag' };

const pick = <T>(list: T[], rng: Rng): T => list[Math.floor(rng() * list.length)];

function openDestinations(world: World): DestinationId[] {
  return DESTINATIONS.filter((d) => streetOpen(world, d));
}

function availableKinds(world: World): QuestKind[] {
  const kinds: QuestKind[] = ['etet_vega', 'etet_husevo', 'pontos_koltes', 'kulonbozo_etel', 'ora', 'jokedv', 'recept', 'kivansag'];
  if (buildingOpen(world, 'ruhabolt')) kinds.push('fejfedo');
  if (buildingOpen(world, 'iskola')) kinds.push('ora_iskola');
  if (buildingOpen(world, 'park')) kinds.push('hinta');
  if (openDestinations(world).length > 0) kinds.push('utazas', 'termeszet');
  return kinds;
}

function makeQuest(world: World, kind: QuestKind, rng: Rng): Quest | null {
  const q = (text: string, goal = 1, extra: Partial<Quest> = {}): Quest => ({ kind, text, goal, progress: 0, done: false, ...extra });
  switch (kind) {
    case 'etet_vega': return q('🥕 Etess meg 2 vega macskát!', 2);
    case 'etet_husevo': return q('🍖 Etess meg 2 húsevő macskát!', 2);
    case 'pontos_koltes': {
      const num = 6 + Math.floor(rng() * 7);
      return q(`🧮 Költs el ma pontosan ${num} 🐾-t a boltban!`, num, { num });
    }
    case 'kulonbozo_etel': return q('🛒 Vegyél ma 3 különböző ételt a boltban!', 3);
    case 'ora': {
      const cats = world.cats.filter((c) => isCityCat(c) && c.age !== 'baba');
      const places = BUILDING_IDS.filter((id) => {
        const b = BUILDINGS[id];
        return CITY_STREETS.includes(b.street) && b.wander && !isHome(id) && buildingOpen(world, id);
      });
      if (cats.length === 0 || places.length === 0) return null;
      const cat = pick(cats, rng);
      const building: BuildingId = pick(places, rng);
      const num = 10 + Math.floor(rng() * 7);
      const b = BUILDINGS[building];
      return q(`🕐 ${cat.name} legyen itt: ${b.emoji} ${b.name}, ${num}:00 és ${num + 1}:00 között!`, 1, { num, building, catId: cat.id });
    }
    case 'jokedv': return q('😊 Legyen egyszerre minden városi macska jókedve 60 fölött!');
    case 'recept': return q('🧑‍🍳 Főzz valamit az étteremben két hozzávalóból!');
    case 'kivansag': return q('💭 Teljesíts 2 kívánságot! (Figyeld a buborékokat!)', 2);
    case 'fejfedo': return q('🎩 Legyen egyszerre 2 macskán valami a fején!', 2);
    case 'ora_iskola': return q('📚 Válaszolj jól 2 kérdésre az iskolában!', 2);
    case 'hinta': return q('🌳 Játsszon 2 macska a parkban a hintán vagy a csúszdán!', 2);
    case 'utazas': {
      const street = pick(openDestinations(world), rng);
      return q(`🧳 Vigyél egy macskát ide: ${STREETS[street].emoji} ${STREETS[street].name}!`, 1, { street });
    }
    case 'termeszet': {
      const street = pick(openDestinations(world), rng);
      return q(`🌍 Vigyél ide egy macskát, aki a természetben is itt él: ${STREETS[street].emoji} ${STREETS[street].name}!`, 1, { street });
    }
  }
}

export function makeDailyQuests(world: World, rng: Rng): Quest[] {
  const kinds = availableKinds(world);
  const quests: Quest[] = [];
  while (quests.length < 3 && kinds.length > 0) {
    const kind = kinds.splice(Math.floor(rng() * kinds.length), 1)[0];
    const quest = makeQuest(world, kind, rng);
    if (quest) quests.push(quest);
  }
  return quests;
}

function complete(world: World, q: Quest): void {
  if (q.done || q.failed) return;
  q.done = true;
  q.progress = q.goal;
  earn(world, QUEST_COINS);
  addStars(world, 1);
  notify(world, `✅ Feladat kész! +1 ⭐ +${QUEST_COINS} 🐾`);
  if (world.quests.every((x) => x.done)) {
    addStars(world, 1);
    notify(world, '🌟 Mindhárom feladat kész! Bónusz: +1 ⭐');
  }
}

function bump(world: World, q: Quest, n = 1): void {
  if (q.done || q.failed) return;
  q.progress = Math.min(q.goal, q.progress + n);
  if (q.progress >= q.goal) complete(world, q);
}

export function questEvent(world: World, ev: QuestEvent): void {
  for (const q of world.quests) {
    switch (q.kind) {
      case 'etet_vega': if (ev.kind === 'etet' && ev.diet === 'vega') bump(world, q); break;
      case 'etet_husevo': if (ev.kind === 'etet' && ev.diet === 'husevo') bump(world, q); break;
      case 'pontos_koltes':
        if (ev.kind === 'vasarlas' && !q.done && !q.failed) {
          q.progress = world.today.shopSpent;
          if (q.progress === q.num) complete(world, q);
          else if (q.progress > (q.num ?? 0)) {
            q.failed = true;
            notify(world, `😅 Ez már ${q.progress} 🐾, több mint ${q.num}! Holnap újra próbálhatod.`);
          }
        }
        break;
      case 'kulonbozo_etel':
        if (ev.kind === 'vasarlas') {
          q.progress = Math.min(q.goal, new Set(world.today.foodsBought).size);
          if (q.progress >= q.goal) complete(world, q);
        }
        break;
      case 'recept': if (ev.kind === 'recept') bump(world, q); break;
      case 'ora_iskola': if (ev.kind === 'lecke') bump(world, q); break;
      case 'hinta': if (ev.kind === 'hinta') bump(world, q); break;
      case 'kivansag': if (ev.kind === 'kivansag') bump(world, q); break;
      default: break;
    }
  }
}

/** Állapot alapján teljesülő feladatok (minden lépésnél). */
export function checkStateQuests(world: World): void {
  const city = world.cats.filter(isCityCat);
  for (const q of world.quests) {
    if (q.done || q.failed) continue;
    switch (q.kind) {
      case 'ora': {
        const h = hourOf(world.minute);
        const cat = world.cats.find((c) => c.id === q.catId);
        if (cat && h === q.num && cat.place === q.building) complete(world, q);
        else if (h > (q.num ?? 24)) q.failed = true;
        break;
      }
      case 'jokedv':
        if (city.length > 0 && city.every((c) => c.needs.jokedv > 60)) complete(world, q);
        break;
      case 'fejfedo': {
        const n = world.cats.filter((c) => c.outfit.fej).length;
        q.progress = Math.min(q.goal, n);
        if (n >= q.goal) complete(world, q);
        break;
      }
      case 'utazas':
        if (city.some((c) => c.street === q.street)) complete(world, q);
        break;
      case 'termeszet':
        if (city.some((c) => c.street === q.street && SPECIES[c.species].home === q.street)) complete(world, q);
        break;
      default: break;
    }
  }
}

/** Új nap: friss feladatok, napi számlálók nullázása. */
export function startDay(world: World, rng: Rng): void {
  world.questDay = dayOf(world.minute);
  world.today = { shopSpent: 0, foodsBought: [] };
  world.snowman = 0;
  world.sandcastle = 0;
  world.quests = makeDailyQuests(world, rng);
}
