import { describe, expect, it } from 'vitest';
import { canEat, refusal } from '../src/sim/diet';

describe('étrend', () => {
  it('vega csak vega és mindenkinek szóló ételt eszik', () => {
    expect(canEat('vega', 'vega')).toBe(true);
    expect(canEat('vega', 'mindenki')).toBe(true);
    expect(canEat('vega', 'husevo')).toBe(false);
  });
  it('húsevő csak húsos és mindenkinek szóló ételt eszik', () => {
    expect(canEat('husevo', 'husevo')).toBe(true);
    expect(canEat('husevo', 'mindenki')).toBe(true);
    expect(canEat('husevo', 'vega')).toBe(false);
  });
  it('kedvesen visszautasít', () => {
    expect(refusal('vega')).toContain('vega');
    expect(refusal('husevo')).toContain('húsevő');
  });
});
