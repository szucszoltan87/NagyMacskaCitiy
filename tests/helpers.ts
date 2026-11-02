import { buildCat, defaultLooks, type CatDraft } from '../src/sim/cats';
import type { Cat, World } from '../src/sim/types';
import { emptyWorld } from '../src/sim/world';

export function testWorld(): World {
  const w = emptyWorld();
  w.coins = 20;
  w.pantry = {};
  w.questDay = 1;
  return w;
}

export function testCat(world: World, draft: Partial<CatDraft> = {}, extra: Partial<Cat> = {}): Cat {
  const full: CatDraft = {
    name: 'Teszt', species: 'tigris', sex: 'lany', age: 'felnott', diet: 'husevo', job: null,
    looks: defaultLooks('tigris', 'lany', 'felnott'), homeId: 'otthon1', ...draft,
  };
  const cat: Cat = { ...buildCat(`c${world.nextId++}`, full, 'utca', 500, world.minute), nextWishAt: Number.MAX_SAFE_INTEGER, ...extra };
  if (extra.place && extra.place !== 'utca' && !extra.street) {
    cat.street = extra.place === 'otthon3' || extra.place === 'park' || extra.place === 'strand' ? 'parkvaros' : cat.street;
  }
  world.cats.push(cat);
  return cat;
}

/** Determinisztikus "véletlen": sorban adja vissza az értékeket. */
export const seq = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};
export const never = () => 0.999;
