import { WORLD_VERSION } from '../sim/balance';
import type { World } from '../sim/types';

export function serialize(world: World): string {
  return JSON.stringify(world);
}

export function deserialize(text: string): World | null {
  try {
    const data = JSON.parse(text) as Partial<World>;
    if (data.version !== WORLD_VERSION || !Array.isArray(data.cats) || typeof data.minute !== 'number') return null;
    return data as World;
  } catch {
    return null;
  }
}
