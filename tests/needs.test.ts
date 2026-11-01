import { describe, expect, it } from 'vitest';
import { addNeed, anyNeedEmpty, decayNeeds } from '../src/sim/needs';
import { testCat, testWorld } from './helpers';

describe('igények', () => {
  it('egy nap alatt elfogy a teli étel-csík', () => {
    const c = testCat(testWorld());
    c.needs.etel = 100;
    decayNeeds(c, 1440);
    expect(c.needs.etel).toBeCloseTo(0);
  });
  it('alvás közben töltődik az alvás-csík', () => {
    const c = testCat(testWorld(), {}, { activity: 'alszik' });
    c.needs.alvas = 10;
    decayNeeds(c, 180);
    expect(c.needs.alvas).toBeCloseTo(60);
  });
  it('ébren fogy az alvás-csík', () => {
    const c = testCat(testWorld());
    c.needs.alvas = 50;
    decayNeeds(c, 108);
    expect(c.needs.alvas).toBeCloseTo(40);
  });
  it('0 és 100 között marad', () => {
    const c = testCat(testWorld());
    addNeed(c, 'etel', 500);
    expect(c.needs.etel).toBe(100);
    addNeed(c, 'etel', -500);
    expect(c.needs.etel).toBe(0);
  });
  it('észreveszi az üres csíkot', () => {
    const c = testCat(testWorld());
    expect(anyNeedEmpty(c)).toBe(false);
    c.needs.ital = 0;
    expect(anyNeedEmpty(c)).toBe(true);
  });
});
