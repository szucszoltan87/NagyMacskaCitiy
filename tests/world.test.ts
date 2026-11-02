import { describe, expect, it } from 'vitest';
import { SALARY, START_COINS } from '../src/sim/balance';
import { hasWorker } from '../src/sim/economy';
import { createInitialWorld, tickWorld } from '../src/sim/world';
import { never, testCat, testWorld } from './helpers';

describe('világ', () => {
  it('a kezdő városban van család, orvos, szakács, eladó, vega és húsevő', () => {
    const w = createInitialWorld();
    expect(w.cats.filter((c) => c.street === 'belvaros')).toHaveLength(5);
    expect(w.cats).toHaveLength(11);
    expect(w.coins).toBe(START_COINS);
    expect(hasWorker(w, 'orvos')).toBe(true);
    expect(hasWorker(w, 'szakacs')).toBe(true);
    expect(hasWorker(w, 'elado')).toBe(true);
    expect(w.cats.some((c) => c.diet === 'vega')).toBe(true);
    expect(w.cats.some((c) => c.diet === 'husevo')).toBe(true);
    expect(new Set(w.cats.map((c) => c.id)).size).toBe(11);
    expect(w.quests).toHaveLength(3);
  });

  it('szünetben nem telik az idő', () => {
    const w = createInitialWorld();
    w.paused = true;
    const before = w.minute;
    tickWorld(w, 100, never);
    expect(w.minute).toBe(before);
  });

  it('telik az idő és fogynak az igények', () => {
    const w = testWorld();
    const c = testCat(w);
    tickWorld(w, 60, never);
    expect(w.minute).toBe(8 * 60 + 60);
    expect(c.needs.etel).toBeLessThan(80);
  });

  it('este 6-kor egyszer jár fizetés', () => {
    const w = createInitialWorld();
    w.minute = 17 * 60 + 59;
    for (const c of w.cats) if (c.job) c.workedDay = 1;
    const before = w.coins;
    tickWorld(w, 2, never);
    expect(w.coins).toBe(before + 3 * SALARY);
    expect(w.inbox.some((m) => m.includes('Fizetés'))).toBe(true);
    tickWorld(w, 10, never);
    expect(w.coins).toBe(before + 3 * SALARY);
  });

  it('a kézben tartott macskát nem mozgatja', () => {
    const w = testWorld();
    w.minute = 22 * 60;
    const c = testCat(w, {}, { place: 'utca', x: 2000 });
    tickWorld(w, 5, never, c.id);
    expect(c.x).toBe(2000);
  });

  it('a lejárt buborék eltűnik', () => {
    const w = testWorld();
    const c = testCat(w, {}, { bubble: 'Szia', bubbleUntil: w.minute + 5 });
    tickWorld(w, 10, never);
    expect(c.bubble).toBeNull();
  });

  it('új beteg esetén szól', () => {
    const w = testWorld();
    const c = testCat(w);
    c.needs.ital = 0;
    c.emptyMinutes = 719;
    tickWorld(w, 2, never);
    expect(c.sick).toBe(true);
    expect(w.inbox.some((e) => e.includes('beteg'))).toBe(true);
  });
});
