import { describe, expect, it } from 'vitest';
import { shade } from '../src/art/color';

describe('shade', () => {
  it('világosít és sötétít', () => {
    expect(shade('#000000', 1)).toBe('#ffffff');
    expect(shade('#ffffff', -1)).toBe('#000000');
    expect(shade('#808080', 0)).toBe('#808080');
    expect(shade('#000000', 0.5)).toBe('#808080');
  });
});
