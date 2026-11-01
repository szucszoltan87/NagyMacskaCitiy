import { get, set } from 'idb-keyval';
import type { World } from '../sim/types';
import { deserialize, serialize } from './serialize';

const KEY = 'nagymacskacitiy-save';

export async function loadWorld(): Promise<World | null> {
  const text = await get<string>(KEY);
  return text ? deserialize(text) : null;
}

export async function saveWorld(world: World): Promise<void> {
  await set(KEY, serialize(world));
}
