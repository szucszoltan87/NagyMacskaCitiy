import {
  BUILDING_IDS, BUILDINGS, BUS_STOP, isDestination, isHome, LODGE_OF, ROOM_DOOR_X, ROOM_WIDTH, STREETS, WORKPLACE,
} from '../data/buildings';
import { SCHOOL_END_HOUR, WALK_SPEED, WORK_END_HOUR, WORK_START_HOUR } from './balance';
import { say } from './cats';
import { hasWorker } from './economy';
import { bedX } from './homes';
import { buildingOpen } from './progress';
import { dayOf, hourOf, isNight } from './time';
import { busRuns } from './travel';
import { makeWish, wishText } from './wishes';
import type { BuildingId, Cat, SleepId, World } from './types';

export type Rng = () => number;

export function walkTowards(cat: Cat, targetX: number, minutes: number): boolean {
  const step = WALK_SPEED * (cat.age === 'baba' ? 0.6 : 1) * minutes;
  const dx = targetX - cat.x;
  if (Math.abs(dx) <= step) {
    cat.x = targetX;
    return true;
  }
  cat.facing = dx > 0 ? 1 : -1;
  cat.x += cat.facing * step;
  cat.activity = 'setal';
  return false;
}

function leaveBuilding(cat: Cat): void {
  if (cat.place === 'utca') return;
  cat.x = BUILDINGS[cat.place].doorX;
  cat.place = 'utca';
  cat.targetX = null;
  cat.spot = null;
  cat.activity = 'all';
}

function enterBuilding(cat: Cat, id: BuildingId, x: number): void {
  cat.place = id;
  cat.street = BUILDINGS[id].street;
  cat.x = x;
  cat.targetX = null;
  cat.goal = null;
  cat.activity = 'all';
  cat.spot = null;
}

type GoStatus = 'bent' | 'uton' | 'nem';

/** Egy épület felé indul (más utcára busszal). */
export function goTo(world: World, cat: Cat, id: BuildingId, minutes: number): GoStatus {
  if (cat.place === id) {
    if (cat.dest === id) cat.dest = null;
    return 'bent';
  }
  const target = BUILDINGS[id];
  if (target.street !== cat.street) {
    const stop = BUS_STOP[cat.street];
    if (!stop || !BUS_STOP[target.street] || !busRuns(world)) return 'nem';
    const h = hourOf(world.minute);
    if (h < 6 || h >= 21) return 'nem';
    cat.dest = id;
    if (cat.place === stop) {
      cat.activity = 'all';
      return 'uton';
    }
    goLocal(cat, stop, minutes);
    return 'uton';
  }
  return goLocal(cat, id, minutes) ? 'bent' : 'uton';
}

function goLocal(cat: Cat, id: BuildingId, minutes: number): boolean {
  if (cat.place !== 'utca') leaveBuilding(cat);
  if (walkTowards(cat, BUILDINGS[id].doorX, minutes)) {
    enterBuilding(cat, id, ROOM_DOOR_X + 80 + (cat.x % 7) * 20);
    return true;
  }
  return false;
}

export function sleepPlace(cat: Cat): SleepId {
  if (isDestination(cat.street)) return LODGE_OF[cat.street];
  return cat.homeId;
}

function goToSleep(world: World, cat: Cat, minutes: number): void {
  cat.goal = null;
  const target = sleepPlace(cat);
  const st = goTo(world, cat, target, minutes);
  if (st === 'nem') {
    cat.targetX = null;
    if (cat.activity !== 'alszik') say(world, cat, 'Ma itt alszom. 😴');
    cat.activity = 'alszik';
    return;
  }
  if (st !== 'bent') return;
  const bx = bedX(world, cat) ?? cat.x;
  if (walkTowards(cat, bx, minutes)) {
    cat.activity = 'alszik';
    cat.targetX = null;
  }
}

function dutyOf(world: World, cat: Cat): BuildingId | null {
  if (isDestination(cat.street) || cat.sick) return null;
  const h = hourOf(world.minute);
  if (cat.age === 'felnott' && cat.job && h >= WORK_START_HOUR && h < WORK_END_HOUR) {
    const wp = WORKPLACE[cat.job];
    if (buildingOpen(world, wp)) return wp;
  }
  if (cat.age === 'gyerek' && h >= WORK_START_HOUR && h < SCHOOL_END_HOUR && buildingOpen(world, 'iskola') && hasWorker(world, 'tanar')) {
    return 'iskola';
  }
  return null;
}

function complaint(cat: Cat): string | null {
  if (cat.sick) return 'Rosszul vagyok… vigyél a kórházba! 🤒';
  if (cat.needs.ital < 20) return 'Szomjas vagyok! 💧';
  if (cat.needs.etel < 20) return cat.age === 'baba' ? 'Cumisüveget kérek! 🍼' : 'Éhes vagyok! 🍽️';
  if (cat.needs.jokedv < 20) return 'Unatkozom… 🥺';
  return null;
}

function maybeTalk(world: World, cat: Cat, minutes: number, rng: Rng): void {
  if (cat.bubble) return;
  const text = complaint(cat);
  if (text) {
    if (rng() < 0.01 * minutes) say(world, cat, text);
    return;
  }
  if (cat.age === 'baba' || cat.sick || cat.wish || world.minute < cat.nextWishAt) return;
  cat.nextWishAt = world.minute + 480 + rng() * 480;
  const wish = makeWish(world, cat, rng);
  if (wish) {
    cat.wish = wish;
    say(world, cat, wishText(wish));
  }
}

function idleInside(cat: Cat, minutes: number, rng: Rng): void {
  if (cat.targetX !== null) {
    if (walkTowards(cat, cat.targetX, minutes)) {
      cat.targetX = null;
      cat.activity = 'all';
    }
    return;
  }
  cat.activity = 'all';
  if (rng() < 0.02 * minutes) {
    const width = cat.place === 'utca' ? STREETS[cat.street].width : ROOM_WIDTH;
    cat.targetX = cat.place === 'utca' ? Math.max(80, Math.min(width - 80, cat.x + (rng() - 0.5) * 400)) : 200 + rng() * (width - 300);
  }
}

function wander(world: World, cat: Cat, minutes: number, rng: Rng): void {
  if (cat.targetX !== null) {
    if (walkTowards(cat, cat.targetX, minutes)) {
      cat.targetX = null;
      cat.activity = 'all';
      if (cat.goal) enterBuilding(cat, cat.goal, ROOM_DOOR_X + 60 + rng() * 300);
    }
    return;
  }
  cat.activity = 'all';
  if (cat.place !== 'utca') {
    if (rng() < 0.004 * minutes) leaveBuilding(cat);
    else idleInside(cat, minutes, rng);
    return;
  }
  if (rng() < 0.003 * minutes) {
    const options = BUILDING_IDS.filter((id) => {
      const b = BUILDINGS[id];
      return b.street === cat.street && b.wander && buildingOpen(world, id) && (!isHome(id) || id === cat.homeId);
    });
    if (options.length) {
      const goal = options[Math.floor(rng() * options.length)];
      cat.goal = goal;
      cat.targetX = BUILDINGS[goal].doorX;
      return;
    }
  }
  if (rng() < 0.03 * minutes) {
    const width = STREETS[cat.street].width;
    cat.targetX = 80 + rng() * (width - 160);
  }
}

export function updateCatAi(world: World, cat: Cat, minutes: number, rng: Rng): void {
  if (cat.stuck) {
    cat.activity = 'all';
    return;
  }
  const night = isNight(world.minute);
  if (cat.activity === 'alszik') {
    if (night || cat.needs.alvas < 100) return;
    cat.activity = 'all';
    say(world, cat, 'Kipihentem magam! ☀️');
  }
  if (cat.age === 'baba') {
    if (night) {
      cat.activity = 'alszik';
      cat.targetX = null;
      return;
    }
    maybeTalk(world, cat, minutes, rng);
    idleInside(cat, minutes, rng);
    return;
  }
  if (night || cat.needs.alvas < 15) {
    cat.spot = null;
    goToSleep(world, cat, minutes);
    return;
  }
  maybeTalk(world, cat, minutes, rng);
  if (cat.sick) {
    cat.targetX = null;
    cat.goal = null;
    cat.activity = 'all';
    return;
  }
  if (cat.spot) {
    if (world.minute < cat.spotUntil) return;
    cat.spot = null;
    cat.activity = 'all';
    say(world, cat, 'Ez jó volt! 😄');
  }
  if (world.minute < cat.stayUntil) {
    idleInside(cat, minutes, rng);
    return;
  }
  const duty = dutyOf(world, cat);
  if (duty) {
    const st = goTo(world, cat, duty, minutes);
    if (st === 'bent') {
      cat.activity = cat.age === 'felnott' ? 'dolgozik' : 'tanul';
      if (cat.age === 'felnott') cat.workedDay = dayOf(world.minute);
      return;
    }
    if (st === 'uton') return;
  }
  if (cat.place !== 'utca' && ['busz', 'vasut', 'repter'].includes(BUILDINGS[cat.place].kind)) {
    cat.activity = 'all';
    return;
  }
  wander(world, cat, minutes, rng);
}
