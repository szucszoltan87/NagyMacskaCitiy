import { describe, expect, it } from 'vitest';
import { SALARY } from '../src/sim/balance';
import { hasWorker, paySalaries, spend } from '../src/sim/economy';
import { testCat, testWorld } from './helpers';

describe('pénz', () => {
  it('fizetés csökkenti a pénzt', () => {
    const w = testWorld();
    w.coins = 10;
    expect(spend(w, 4).ok).toBe(true);
    expect(w.coins).toBe(6);
  });
  it('mínuszba nem megy, megmondja mennyi hiányzik', () => {
    const w = testWorld();
    w.coins = 3;
    const r = spend(w, 4);
    expect(r.ok).toBe(false);
    expect(r.message).toBe('Még 1 🐾 kell!');
    expect(w.coins).toBe(3);
  });
  it('munkás csak felnőtt lehet', () => {
    const w = testWorld();
    testCat(w, { job: 'orvos', age: 'gyerek' });
    expect(hasWorker(w, 'orvos')).toBe(false);
    testCat(w, { job: 'orvos' });
    expect(hasWorker(w, 'orvos')).toBe(true);
  });
  it('a beteg munkás nem kap fizetést', () => {
    const w = testWorld();
    w.coins = 0;
    testCat(w, { job: 'orvos' }, { workedDay: 1 });
    testCat(w, { job: 'elado' }, { sick: true, workedDay: 1 });
    testCat(w, { job: 'szakacs' });
    testCat(w);
    expect(paySalaries(w)).toBe(SALARY);
    expect(w.coins).toBe(SALARY);
  });
});
