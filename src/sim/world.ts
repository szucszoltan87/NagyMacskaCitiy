import { BUILDINGS, isDestination, STREETS } from '../data/buildings';
import { CLIMATE_TEXT } from '../data/clothes';
import { defaultHomes, START_PAINTS } from '../data/furniture';
import { lexiconKey } from '../data/species';
import {
  CLIMATE_EXTRA_DECAY, DECAY_PER_MIN, PLAY_JOY_PER_MIN, SALARY_HOUR, SLEEP_RESTORE_PER_MIN, START_COINS, START_MINUTE, WORLD_VERSION,
} from './balance';
import { updateCatAi, type Rng } from './ai';
import { buildCat, defaultLooks, say, type CatDraft } from './cats';
import { climateOf, protectedFrom } from './clothes';
import { paySalaries } from './economy';
import { maybeStartEvent } from './events';
import { births, growUp, tickBonds } from './family';
import { updateHealth } from './health';
import { bedX } from './homes';
import { addNeed, decayNeeds } from './needs';
import { notify } from './progress';
import { checkStateQuests, startDay } from './quests';
import { dayOf, hourOf } from './time';
import { runTransport } from './travel';
import type { Cat, GameEvent, StreetId, World } from './types';
import { checkWishState } from './wishes';

type Starter = Omit<CatDraft, 'looks'> & { x: number; street?: StreetId };

const STARTERS: Starter[] = [
  { name: 'Mira', species: 'jaguar', sex: 'lany', age: 'felnott', diet: 'vega', job: 'orvos', homeId: 'otthon1', x: 320 },
  { name: 'Pötty', species: 'jaguar', sex: 'lany', age: 'gyerek', diet: 'vega', job: null, homeId: 'otthon1', x: 420 },
  { name: 'Bruno', species: 'tigris', sex: 'fiu', age: 'felnott', diet: 'husevo', job: 'szakacs', homeId: 'otthon2', x: 1300 },
  { name: 'Leó', species: 'oroszlan', sex: 'fiu', age: 'felnott', diet: 'husevo', job: 'elado', homeId: 'otthon2', x: 800 },
  { name: 'Hópihe', species: 'hoparduc', sex: 'lany', age: 'gyerek', diet: 'husevo', job: null, homeId: 'otthon2', x: 2350 },
];

/** Rokonok a nagymacskák igazi otthonaiban. */
export const RELATIVES: Starter[] = [
  { name: 'Hóvirág nagyi', species: 'hoparduc', sex: 'lany', age: 'felnott', diet: 'husevo', job: null, homeId: 'kunyho', x: 1000, street: 'hoshegy' },
  { name: 'Bojtos', species: 'hiuz', sex: 'fiu', age: 'gyerek', diet: 'husevo', job: null, homeId: 'kunyho', x: 1800, street: 'hoshegy' },
  { name: 'Simba nagypapa', species: 'oroszlan', sex: 'fiu', age: 'felnott', diet: 'husevo', job: null, homeId: 'szafaritabor', x: 1000, street: 'szavanna' },
  { name: 'Villám', species: 'gepard', sex: 'fiu', age: 'gyerek', diet: 'husevo', job: null, homeId: 'szafaritabor', x: 1800, street: 'szavanna' },
  { name: 'Jaga néni', species: 'jaguar', sex: 'lany', age: 'felnott', diet: 'vega', job: null, homeId: 'fakunyho', x: 1000, street: 'oserdo' },
  { name: 'Csíkos bácsi', species: 'tigris', sex: 'fiu', age: 'felnott', diet: 'husevo', job: null, homeId: 'fakunyho', x: 1800, street: 'oserdo' },
];

export function makeStarter(world: World, s: Starter): Cat {
  const { x, street, ...draft } = s;
  const looks = defaultLooks(draft.species, draft.sex, draft.age);
  return buildCat(`c${world.nextId++}`, { ...draft, looks }, 'utca', x, world.minute, street ?? 'belvaros');
}

export function emptyWorld(): World {
  return {
    version: WORLD_VERSION,
    minute: START_MINUTE,
    coins: START_COINS,
    stars: 0,
    paused: false,
    pantry: { repa: 2, alma: 1, hal: 2, kenyer: 2, tej: 2 },
    cats: [],
    nextId: 1,
    lastSalaryDay: 0,
    questDay: 0,
    quests: [],
    today: { shopSpent: 0, foodsBought: [] },
    ownedClothes: ['masni'],
    recipes: [],
    homes: defaultHomes(),
    furnitureStock: [],
    paints: [...START_PAINTS],
    event: null,
    eventDay: 0,
    localDone: {},
    snowman: 0,
    sandcastle: 0,
    lexicon: [],
    namingQueue: [],
    sound: true,
    inbox: [],
  };
}

export function createInitialWorld(rng: Rng = Math.random): World {
  const world = emptyWorld();
  for (const s of [...STARTERS, ...RELATIVES]) world.cats.push(makeStarter(world, s));
  for (const c of world.cats) {
    const key = lexiconKey(c.species, c.hybrid);
    if (key && !world.lexicon.includes(key) && !isDestination(c.street)) world.lexicon.push(key);
  }
  startDay(world, rng);
  return world;
}

function extraEffects(world: World, cat: Cat, minutes: number): void {
  if (cat.activity === 'alszik' && bedX(world, cat) === null) {
    addNeed(cat, 'alvas', -SLEEP_RESTORE_PER_MIN * minutes * 0.5);
  }
  if (cat.activity === 'jatszik') addNeed(cat, 'jokedv', PLAY_JOY_PER_MIN * minutes);
  if (cat.activity === 'uszik') {
    const lover = cat.species === 'jaguar' || cat.species === 'tigris' || cat.species === 'ocelot';
    addNeed(cat, 'jokedv', (lover ? 0.8 : 0.3) * minutes);
  }
  if (cat.place === 'ovoda' && cat.age === 'baba' && world.cats.some((c) => c.job === 'ovono' && c.age === 'felnott')) {
    cat.needs.etel = Math.max(cat.needs.etel, 50);
    cat.needs.ital = Math.max(cat.needs.ital, 50);
    addNeed(cat, 'jokedv', 0.1 * minutes);
  }
  if (cat.activity === 'tanul') addNeed(cat, 'jokedv', 0.05 * minutes);
  const climate = climateOf(cat);
  if (climate && !protectedFrom(cat, climate)) {
    addNeed(cat, 'jokedv', -DECAY_PER_MIN.jokedv * CLIMATE_EXTRA_DECAY * minutes);
    if (!cat.bubble && cat.activity !== 'alszik' && Math.floor(world.minute / 30) !== Math.floor((world.minute - minutes) / 30)) {
      say(world, cat, CLIMATE_TEXT[climate].complaint);
    }
  }
}

/** Lépteti a világot. Az üzenetek a world.inbox-ba kerülnek; az utazásokat visszaadja. */
export function tickWorld(world: World, minutes: number, rng: Rng, heldCatId: string | null = null): GameEvent[] {
  const events: GameEvent[] = [];
  if (world.paused || minutes <= 0) return events;

  const prev = world.minute;
  world.minute += minutes;
  if (dayOf(world.minute) > world.questDay) startDay(world, rng);

  for (const cat of world.cats) {
    decayNeeds(cat, minutes);
    extraEffects(world, cat, minutes);
  }

  const patient = updateHealth(world, minutes);
  if (patient) notify(world, `${patient.name} beteg lett! Vidd a kórházba. 🏥`);

  const day = dayOf(world.minute);
  if (hourOf(world.minute) >= SALARY_HOUR && world.lastSalaryDay < day) {
    world.lastSalaryDay = day;
    const paid = paySalaries(world);
    if (paid > 0) notify(world, `💰 Fizetés! +${paid} 🐾`);
  }

  growUp(world);
  births(world, rng);
  tickBonds(world, minutes);
  runTransport(world, prev, events);
  maybeStartEvent(world, rng);

  for (const cat of world.cats) {
    if (cat.id !== heldCatId) updateCatAi(world, cat, minutes, rng);
    if (cat.bubble && world.minute >= cat.bubbleUntil) cat.bubble = null;
    checkWishState(world, cat);
  }
  checkStateQuests(world);
  return events;
}

export function streetLabel(street: StreetId): string {
  return `${STREETS[street].emoji} ${STREETS[street].name}`;
}

export function buildingLabel(id: keyof typeof BUILDINGS): string {
  return `${BUILDINGS[id].emoji} ${BUILDINGS[id].name}`;
}
