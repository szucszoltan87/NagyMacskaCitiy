import { BUILDINGS, STREETS } from '../data/buildings';
import { HYBRIDS, SPECIES } from '../data/species';
import { UNLOCKS } from '../data/unlocks';
import type { BuildingId, StreetId, World } from './types';

export function notify(world: World, text: string): void {
  if (!world.inbox.includes(text)) world.inbox.push(text);
}

export function addStars(world: World, n: number): void {
  const before = world.stars;
  world.stars += n;
  for (const u of UNLOCKS) {
    if (before < u.stars && world.stars >= u.stars) notify(world, `🎉 Megnyílt: ${u.text}! ${u.hint}`);
  }
}

export function streetOpen(world: World, street: StreetId): boolean {
  return world.stars >= STREETS[street].unlock;
}

export function buildingOpen(world: World, id: BuildingId): boolean {
  const def = BUILDINGS[id];
  return world.stars >= def.unlock && streetOpen(world, def.street);
}

export function unlockLexicon(world: World, key: string | null): void {
  if (!key || world.lexicon.includes(key)) return;
  world.lexicon.push(key);
  const name = key in SPECIES ? SPECIES[key as keyof typeof SPECIES].name : HYBRIDS.find((h) => h.key === key)?.name;
  if (name) notify(world, `📖 Új lexikon-kártya: ${name}!`);
}
