import { START_MINUTE, WORLD_VERSION } from '../src/sim/balance';
import { buildCat, defaultLooks, type CatDraft } from '../src/sim/cats';
import type { Cat, World } from '../src/sim/types';

export function testWorld(): World {
  return { version: WORLD_VERSION, minute: START_MINUTE, coins: 20, paused: false, pantry: {}, cats: [], nextId: 1, lastSalaryDay: 0 };
}

export function testCat(world: World, draft: Partial<CatDraft> = {}, extra: Partial<Cat> = {}): Cat {
  const full: CatDraft = {
    name: 'Teszt', species: 'tigris', sex: 'lany', age: 'felnott', diet: 'husevo', job: null,
    looks: defaultLooks('tigris', 'lany', 'felnott'), homeId: 'otthon1', ...draft,
  };
  const cat: Cat = { ...buildCat(`c${world.nextId++}`, full, 'utca', 500), ...extra };
  world.cats.push(cat);
  return cat;
}

/** Determinisztikus "véletlen": sorban adja vissza az értékeket. */
export const seq = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};
export const never = () => 0.999;
