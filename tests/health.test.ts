import { describe, expect, it } from 'vitest';
import { heal, updateHealth } from '../src/sim/health';
import { testCat, testWorld } from './helpers';

describe('betegség', () => {
  it('fél napig üres csík után beteg lesz', () => {
    const w = testWorld();
    const c = testCat(w);
    c.needs.ital = 0;
    expect(updateHealth(w, 719)).toBeNull();
    expect(c.sick).toBe(false);
    expect(updateHealth(w, 1)).toBe(c);
    expect(c.sick).toBe(true);
    expect(c.bubble).toContain('kórház');
  });
  it('egyszerre csak egy macska beteg', () => {
    const w = testWorld();
    const a = testCat(w);
    const b = testCat(w);
    a.needs.etel = 0;
    b.needs.etel = 0;
    updateHealth(w, 720);
    updateHealth(w, 720);
    expect(w.cats.filter((c) => c.sick)).toHaveLength(1);
  });
  it('ha megkapja amit kér, nullázódik a számláló', () => {
    const w = testWorld();
    const c = testCat(w);
    c.needs.ital = 0;
    updateHealth(w, 500);
    c.needs.ital = 50;
    updateHealth(w, 1);
    expect(c.emptyMinutes).toBe(0);
  });
  it('gyógyítás után egészséges, a csíkok legalább 30-on vannak', () => {
    const w = testWorld();
    const c = testCat(w, {}, { sick: true, emptyMinutes: 900 });
    c.needs.etel = 0;
    c.needs.jokedv = 70;
    heal(c);
    expect(c.sick).toBe(false);
    expect(c.emptyMinutes).toBe(0);
    expect(c.needs.etel).toBe(30);
    expect(c.needs.jokedv).toBe(70);
  });
});
