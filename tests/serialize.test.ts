import { describe, expect, it } from 'vitest';
import { createInitialWorld } from '../src/sim/world';
import { deserialize, serialize } from '../src/store/serialize';

describe('mentés', () => {
  it('oda-vissza ugyanaz', () => {
    const w = createInitialWorld();
    w.coins = 77;
    expect(deserialize(serialize(w))).toEqual(w);
  });
  it('rossz verziót nem tölt be', () => {
    const w = createInitialWorld();
    w.version = 999;
    expect(deserialize(serialize(w))).toBeNull();
  });
  it('hibás szöveget nem tölt be', () => {
    expect(deserialize('nem json')).toBeNull();
    expect(deserialize('{"version":1}')).toBeNull();
  });
});
