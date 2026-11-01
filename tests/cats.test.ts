import { describe, expect, it } from 'vitest';
import { WORKSHOP } from '../src/data/buildings';
import { MAX_CATS } from '../src/sim/balance';
import { addCat, defaultLooks, findCat, say } from '../src/sim/cats';
import { randomName } from '../src/sim/names';
import { testCat, testWorld } from './helpers';

const draft = () => ({
  name: 'Mazsola', species: 'jaguar' as const, sex: 'lany' as const, age: 'felnott' as const,
  diet: 'vega' as const, job: null, looks: defaultLooks('jaguar', 'lany', 'felnott'), homeId: 'otthon1' as const,
});

describe('macskák', () => {
  it('a felnőtt és gyerek oroszlán fiúnak sörénye van, a babának és a lánynak nincs', () => {
    expect(defaultLooks('oroszlan', 'fiu', 'felnott').mane).toBe(true);
    expect(defaultLooks('oroszlan', 'fiu', 'gyerek').mane).toBe(true);
    expect(defaultLooks('oroszlan', 'fiu', 'baba').mane).toBe(false);
    expect(defaultLooks('oroszlan', 'lany', 'felnott').mane).toBe(false);
    expect(defaultLooks('tigris', 'fiu', 'felnott').mane).toBe(false);
  });

  it('az új macska a Macskaműhely elé érkezik', () => {
    const w = testWorld();
    const r = addCat(w, draft());
    expect(r.ok).toBe(true);
    expect(r.message).toContain('Mazsola');
    expect(w.cats[0].place).toBe('utca');
    expect(w.cats[0].x).toBe(WORKSHOP.doorX);
    expect(w.cats[0].id).toBe('c1');
    expect(w.nextId).toBe(2);
  });

  it('üres név helyett Cica lesz', () => {
    const w = testWorld();
    addCat(w, { ...draft(), name: '   ' });
    expect(w.cats[0].name).toBe('Cica');
  });

  it(`legfeljebb ${MAX_CATS} macska lakhat a városban`, () => {
    const w = testWorld();
    for (let i = 0; i < MAX_CATS; i++) addCat(w, draft());
    const r = addCat(w, draft());
    expect(r.ok).toBe(false);
    expect(w.cats).toHaveLength(MAX_CATS);
  });

  it('say buborékot tesz a macska fölé, findCat megtalálja', () => {
    const w = testWorld();
    const c = testCat(w);
    say(w, c, 'Szia!');
    expect(findCat(w, c.id)?.bubble).toBe('Szia!');
    expect(c.bubbleUntil).toBeGreaterThan(w.minute);
  });

  it('véletlen név nem üres', () => {
    expect(randomName('lany', () => 0)).toBeTruthy();
    expect(randomName('fiu', () => 0.99)).toBeTruthy();
  });
});
