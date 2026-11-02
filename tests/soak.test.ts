import { describe, expect, it } from 'vitest';
import { BUILDINGS } from '../src/data/buildings';
import { JOB_IDS } from '../src/data/jobs';
import { addCat, defaultLooks } from '../src/sim/cats';
import { pairUp, tickBonds, wantBaby } from '../src/sim/family';
import { addStars } from '../src/sim/progress';
import { tickWorld } from '../src/sim/world';
import { createInitialWorld } from '../src/sim/world';

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe('hosszú futás', () => {
  it('6 nap minden nyitva, minden szakmával: nincs hiba, minden érték rendben', () => {
    const r = rng(42);
    const w = createInitialWorld(r);
    addStars(w, 15);
    w.inbox = [];
    for (const job of JOB_IDS) {
      addCat(w, { name: job, species: 'puma', sex: 'fiu', age: 'felnott', diet: 'husevo', job, looks: defaultLooks('puma', 'fiu', 'felnott'), homeId: 'otthon3' });
    }
    const mom = w.cats[0];
    const dad = w.cats.find((c) => c.sex === 'fiu' && c.age === 'felnott' && !c.partnerId)!;
    pairUp(w, mom.id, dad.id);
    for (const c of w.cats) c.place = c.place === 'utca' ? 'utca' : c.place;
    let travels = 0;
    for (let i = 0; i < 6 * 1440; i++) {
      const events = tickWorld(w, 1, r);
      travels += events.filter((e) => e.kind === 'utazas').length;
      w.inbox = [];
      if (i % 120 === 0) {
        for (const c of w.cats) { c.needs.etel = 80; c.needs.ital = 80; c.needs.jokedv = 80; }
        mom.place = dad.place; mom.street = dad.street;
        tickBonds(w, 0);
        if (mom.bond >= 100 && !mom.pregnancy) wantBaby(w, mom.id, r);
        w.namingQueue = [];
      }
      if (i % 500 === 0) w.coins += 20;
    }
    expect(w.coins).toBeGreaterThanOrEqual(0);
    expect(travels).toBeGreaterThan(0);
    for (const c of w.cats) {
      for (const v of Object.values(c.needs)) expect(v).toBeGreaterThanOrEqual(0);
      for (const v of Object.values(c.needs)) expect(v).toBeLessThanOrEqual(100);
      if (c.place !== 'utca') expect(BUILDINGS[c.place].street).toBe(c.street);
      expect(Number.isFinite(c.x)).toBe(true);
    }
    expect(w.cats.length).toBeLessThanOrEqual(30);
    expect(w.cats.some((c) => c.hybrid || c.bornMinute > 1440)).toBe(true);
  });
});
