import { describe, expect, it } from 'vitest';
import { dayOf, formatClock, hourOf, isNight, phaseOf, realSecondsToGameMinutes } from '../src/sim/time';

describe('idő', () => {
  it('napok számolása 1-től', () => {
    expect(dayOf(0)).toBe(1);
    expect(dayOf(1439)).toBe(1);
    expect(dayOf(1440)).toBe(2);
  });
  it('óra formázás', () => {
    expect(formatClock(8 * 60 + 5)).toBe('08:05');
    expect(formatClock(1440 + 23 * 60 + 59.7)).toBe('23:59');
    expect(hourOf(1440 + 18 * 60)).toBe(18);
  });
  it('napszakok', () => {
    expect(phaseOf(5 * 60 + 59)).toBe('ejjel');
    expect(phaseOf(6 * 60)).toBe('reggel');
    expect(phaseOf(10 * 60)).toBe('nappal');
    expect(phaseOf(18 * 60)).toBe('este');
    expect(phaseOf(21 * 60)).toBe('ejjel');
    expect(isNight(23 * 60)).toBe(true);
    expect(isNight(12 * 60)).toBe(false);
  });
  it('10 valódi perc = 1 játéknap', () => {
    expect(realSecondsToGameMinutes(600)).toBeCloseTo(1440);
  });
});
