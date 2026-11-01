import { SALARY_HOUR, START_COINS, START_MINUTE, WORLD_VERSION } from './balance';
import { updateCatAi, type Rng } from './ai';
import { buildCat, defaultLooks, type CatDraft } from './cats';
import { paySalaries } from './economy';
import { updateHealth } from './health';
import { decayNeeds } from './needs';
import { dayOf, hourOf } from './time';
import type { World } from './types';

type Starter = Omit<CatDraft, 'looks'> & { x: number };

const STARTERS: Starter[] = [
  { name: 'Mira', species: 'jaguar', sex: 'lany', age: 'felnott', diet: 'vega', job: 'orvos', homeId: 'otthon1', x: 320 },
  { name: 'Pötty', species: 'jaguar', sex: 'lany', age: 'gyerek', diet: 'vega', job: null, homeId: 'otthon1', x: 420 },
  { name: 'Bruno', species: 'tigris', sex: 'fiu', age: 'felnott', diet: 'husevo', job: 'szakacs', homeId: 'otthon2', x: 1300 },
  { name: 'Leó', species: 'oroszlan', sex: 'fiu', age: 'felnott', diet: 'husevo', job: 'elado', homeId: 'otthon2', x: 800 },
  { name: 'Hópihe', species: 'hoparduc', sex: 'lany', age: 'gyerek', diet: 'husevo', job: null, homeId: 'otthon2', x: 2350 },
];

export function createInitialWorld(): World {
  const world: World = {
    version: WORLD_VERSION,
    minute: START_MINUTE,
    coins: START_COINS,
    paused: false,
    pantry: { repa: 2, alma: 1, hal: 2, kenyer: 2, tej: 2 },
    cats: [],
    nextId: 1,
    lastSalaryDay: 0,
  };
  for (const { x, ...draft } of STARTERS) {
    const looks = defaultLooks(draft.species, draft.sex, draft.age);
    world.cats.push(buildCat(`c${world.nextId++}`, { ...draft, looks }, 'utca', x));
  }
  return world;
}

/** Lépteti a világot. Visszaadja a játékosnak szóló üzeneteket. */
export function tickWorld(world: World, minutes: number, rng: Rng, heldCatId: string | null = null): string[] {
  const events: string[] = [];
  if (world.paused || minutes <= 0) return events;

  world.minute += minutes;
  for (const cat of world.cats) decayNeeds(cat, minutes);

  const patient = updateHealth(world, minutes);
  if (patient) events.push(`${patient.name} beteg lett! Vidd a kórházba. 🏥`);

  const day = dayOf(world.minute);
  if (hourOf(world.minute) >= SALARY_HOUR && world.lastSalaryDay < day) {
    world.lastSalaryDay = day;
    const paid = paySalaries(world);
    if (paid > 0) events.push(`Fizetés! +${paid} 🐾`);
  }

  for (const cat of world.cats) {
    if (cat.id !== heldCatId) updateCatAi(world, cat, minutes, rng);
    if (cat.bubble && world.minute >= cat.bubbleUntil) cat.bubble = null;
  }
  return events;
}
