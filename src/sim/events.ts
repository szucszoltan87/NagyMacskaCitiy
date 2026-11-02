import { BUILDING_IDS, BUILDINGS, CITY_STREETS, isHome, STREETS } from '../data/buildings';
import { EVENT_COINS, RESCUE_DISTANCE } from './balance';
import { findCat, isCityCat, say } from './cats';
import { earn, hasWorker } from './economy';
import { addNeed } from './needs';
import { addStars, buildingOpen, notify } from './progress';
import { dayOf, hourOf } from './time';
import type { BuildingId, Cat, World } from './types';

type Rng = () => number;
const pick = <T>(list: T[], rng: Rng): T => list[Math.floor(rng() * list.length)];

export function maybeStartEvent(world: World, rng: Rng): void {
  const day = dayOf(world.minute);
  const hour = hourOf(world.minute);
  if (world.event || world.eventDay >= day || hour < 10 || hour > 16) return;
  world.eventDay = day;
  if (rng() >= 0.6) return;
  const kinds: Array<'fa' | 'macko'> = [];
  if (buildingOpen(world, 'tuzoltosag')) kinds.push('fa');
  if (buildingOpen(world, 'rendorseg')) kinds.push('macko');
  if (kinds.length === 0) return;
  const kind = pick(kinds, rng);
  const kids = world.cats.filter((c) => isCityCat(c) && c.age !== 'felnott' && CITY_STREETS.includes(c.street));
  if (kind === 'fa') {
    const outside = kids.filter((c) => c.place === 'utca' && c.age === 'gyerek' && c.activity !== 'alszik');
    if (outside.length === 0) return;
    const cat = pick(outside, rng);
    cat.stuck = true;
    cat.targetX = null;
    cat.goal = null;
    cat.dest = null;
    cat.activity = 'all';
    say(world, cat, 'Segítség! Fent ragadtam a fán! 🌳');
    world.event = { kind: 'fa', catId: cat.id };
    notify(world, `🚨 ${cat.name} fennragadt egy fán (${STREETS[cat.street].name})! Húzz mellé egy tűzoltót! 🚒`);
    return;
  }
  if (kids.length === 0) return;
  const owner = pick(kids, rng);
  const places = BUILDING_IDS.filter((id) => CITY_STREETS.includes(BUILDINGS[id].street) && BUILDINGS[id].wander && !isHome(id) && buildingOpen(world, id));
  if (places.length === 0) return;
  const building: BuildingId = pick(places, rng);
  world.event = { kind: 'macko', ownerId: owner.id, building };
  say(world, owner, 'Hol a mackóm? 😢🧸');
  notify(world, `🧸 ${owner.name} elvesztette a mackóját! Keresd meg valamelyik épületben!`);
}

/** A HUD-ban megjelenő esemény-leírás (a rendőr segít). */
export function eventText(world: World): string | null {
  const ev = world.event;
  if (!ev) return null;
  if (ev.kind === 'fa') {
    const cat = findCat(world, ev.catId);
    return `🌳 ${cat?.name ?? 'Egy kölyök'} fent ragadt a fán! Húzz mellé egy tűzoltót. ${hasWorker(world, 'tuzolto') ? '🚒' : '(Előbb építs tűzoltót!)'}`;
  }
  const owner = findCat(world, ev.ownerId);
  const b = BUILDINGS[ev.building];
  return hasWorker(world, 'rendor')
    ? `🧸 ${owner?.name ?? 'Valaki'} mackója elveszett. A rendőr szerint itt lehet: ${b.emoji} ${b.name} (${STREETS[b.street].name})! 🔍`
    : `🧸 ${owner?.name ?? 'Valaki'} mackója elveszett valamelyik épületben. Egy rendőr segítene megtalálni! 🚓`;
}

/** Egy macskát letettek az utcán: ha tűzoltó a fán ragadt kölyök mellett, megmenti. */
export function tryRescue(world: World, helper: Cat): string | null {
  const ev = world.event;
  if (ev?.kind !== 'fa') return null;
  const stuck = findCat(world, ev.catId);
  if (!stuck || stuck === helper || stuck.street !== helper.street || stuck.place !== 'utca') return null;
  if (Math.abs(stuck.x - helper.x) > RESCUE_DISTANCE) return null;
  if (helper.job !== 'tuzolto' || helper.age !== 'felnott') return 'Ehhez tűzoltó kell! 🚒';
  stuck.stuck = false;
  addNeed(stuck, 'jokedv', 30);
  say(world, stuck, 'Köszönöm, hős tűzoltó! 💖');
  say(world, helper, 'Megvagy! 🚒');
  world.event = null;
  earn(world, EVENT_COINS);
  addStars(world, 1);
  return `🚒 ${helper.name} megmentette: ${stuck.name}! +1 ⭐ +${EVENT_COINS} 🐾`;
}

export function findTeddy(world: World): string | null {
  const ev = world.event;
  if (ev?.kind !== 'macko') return null;
  const owner = findCat(world, ev.ownerId);
  world.event = null;
  earn(world, EVENT_COINS);
  addStars(world, 1);
  if (owner) {
    addNeed(owner, 'jokedv', 40);
    say(world, owner, 'A mackóm! 🧸💖');
  }
  return `🧸 Megvan a mackó! ${owner?.name ?? ''} nagyon boldog! +1 ⭐ +${EVENT_COINS} 🐾`;
}
