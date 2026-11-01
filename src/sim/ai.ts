import { BUILDING_IDS, BUILDINGS, HOME_BED_X, ROOM_DOOR_X, ROOM_WIDTH, STREET_WIDTH } from '../data/buildings';
import { WALK_SPEED } from './balance';
import { say } from './cats';
import { isNight } from './time';
import type { BuildingId, Cat, World } from './types';

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
}

function enterBuilding(cat: Cat, id: BuildingId, x: number): void {
  cat.place = id;
  cat.x = x;
  cat.targetX = null;
  cat.goal = null;
  cat.activity = 'all';
}

function goHomeToSleep(cat: Cat, minutes: number): void {
  cat.goal = null;
  if (cat.place === cat.homeId) {
    if (walkTowards(cat, HOME_BED_X, minutes)) {
      cat.activity = 'alszik';
      cat.targetX = null;
    }
    return;
  }
  leaveBuilding(cat);
  if (walkTowards(cat, BUILDINGS[cat.homeId].doorX, minutes)) enterBuilding(cat, cat.homeId, ROOM_DOOR_X);
}

function complaint(cat: Cat): string | null {
  if (cat.sick) return 'Rosszul vagyok… vigyél a kórházba! 🤒';
  if (cat.needs.ital < 20) return 'Szomjas vagyok! 💧';
  if (cat.needs.etel < 20) return 'Éhes vagyok! 🍽️';
  if (cat.needs.jokedv < 20) return 'Unatkozom… 🥺';
  return null;
}

function maybeComplain(world: World, cat: Cat, minutes: number, rng: Rng): void {
  if (cat.bubble) return;
  const text = complaint(cat);
  if (text && rng() < 0.01 * minutes) say(world, cat, text);
}

function wander(cat: Cat, minutes: number, rng: Rng): void {
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
    if (rng() < 0.004 * minutes) {
      leaveBuilding(cat);
      return;
    }
  } else if (rng() < 0.003 * minutes) {
    const goal = BUILDING_IDS[Math.floor(rng() * BUILDING_IDS.length)];
    cat.goal = goal;
    cat.targetX = BUILDINGS[goal].doorX;
    return;
  }
  if (rng() < 0.03 * minutes) {
    const width = cat.place === 'utca' ? STREET_WIDTH : ROOM_WIDTH;
    cat.targetX = 80 + rng() * (width - 160);
  }
}

export function updateCatAi(world: World, cat: Cat, minutes: number, rng: Rng): void {
  const night = isNight(world.minute);
  if (cat.activity === 'alszik') {
    if (night || cat.needs.alvas < 100) return;
    cat.activity = 'all';
    say(world, cat, 'Kipihentem magam! ☀️');
  }
  if (night || cat.needs.alvas < 15) {
    goHomeToSleep(cat, minutes);
    return;
  }
  maybeComplain(world, cat, minutes, rng);
  if (cat.sick) {
    cat.targetX = null;
    cat.goal = null;
    cat.activity = 'all';
    return;
  }
  wander(cat, minutes, rng);
}
