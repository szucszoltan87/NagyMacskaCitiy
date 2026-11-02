import { lexiconKey } from '../data/species';
import { WORLD_VERSION } from '../sim/balance';
import { buildCat } from '../sim/cats';
import { startDay } from '../sim/quests';
import type { Cat, World } from '../sim/types';
import { emptyWorld, makeStarter, RELATIVES } from '../sim/world';

export function serialize(world: World): string {
  return JSON.stringify(world);
}

type V1Cat = Pick<Cat, 'id' | 'name' | 'species' | 'sex' | 'age' | 'diet' | 'looks' | 'needs' | 'emptyMinutes' | 'sick' | 'x' | 'facing'>
  & { job: string | null; homeId: string; place: string };
interface V1World { version: 1; minute: number; coins: number; paused: boolean; pantry: World['pantry']; cats: V1Cat[]; nextId: number; lastSalaryDay: number }

/** Az 1. szakasz mentését átalakítja: a macskák, a pénz és a hűtő megmarad. */
export function migrateV1(old: V1World, rng: () => number = Math.random): World {
  const w = emptyWorld();
  w.minute = old.minute;
  w.coins = old.coins;
  w.paused = old.paused;
  w.pantry = { ...old.pantry };
  w.nextId = old.nextId;
  w.lastSalaryDay = old.lastSalaryDay;
  for (const c of old.cats) {
    const homeId = c.homeId === 'otthon2' ? 'otthon2' : 'otthon1';
    const place = ['otthon1', 'otthon2', 'bolt', 'etterem', 'korhaz'].includes(c.place) ? (c.place as Cat['place']) : 'utca';
    const cat = buildCat(c.id, {
      name: c.name, species: c.species, sex: c.sex, age: c.age, diet: c.diet,
      job: (c.job as Cat['job']) ?? null, looks: c.looks, homeId,
    }, place, c.x, w.minute, 'belvaros');
    cat.needs = { ...c.needs };
    cat.emptyMinutes = c.emptyMinutes;
    cat.sick = c.sick;
    cat.facing = c.facing;
    w.cats.push(cat);
  }
  for (const r of RELATIVES) w.cats.push(makeStarter(w, r));
  for (const c of w.cats) {
    const key = lexiconKey(c.species, c.hybrid);
    if (key && c.street === 'belvaros' && !w.lexicon.includes(key)) w.lexicon.push(key);
  }
  startDay(w, rng);
  return w;
}

export function deserialize(text: string): World | null {
  try {
    const data = JSON.parse(text) as { version?: number; cats?: unknown; minute?: unknown };
    if (!Array.isArray(data.cats) || typeof data.minute !== 'number') return null;
    if (data.version === 1) return migrateV1(data as V1World);
    if (data.version !== WORLD_VERSION) return null;
    return data as World;
  } catch {
    return null;
  }
}
