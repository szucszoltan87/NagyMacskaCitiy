import { describe, expect, it } from 'vitest';
import { BUILDINGS } from '../src/data/buildings';

const HOME_BED_X = 800;
import { updateCatAi, walkTowards } from '../src/sim/ai';
import { never, seq, testCat, testWorld } from './helpers';

describe('macska-agy', () => {
  it('lépésenként sétál a cél felé, aztán megáll', () => {
    const c = testCat(testWorld(), {}, { x: 0 });
    expect(walkTowards(c, 100, 1)).toBe(false);
    expect(c.x).toBe(25);
    expect(c.facing).toBe(1);
    expect(c.activity).toBe('setal');
    expect(walkTowards(c, 100, 10)).toBe(true);
    expect(c.x).toBe(100);
  });

  it('a baba lassabban sétál', () => {
    const c = testCat(testWorld(), { age: 'baba' }, { x: 0 });
    walkTowards(c, 100, 1);
    expect(c.x).toBe(15);
  });

  it('éjjel hazamegy és lefekszik', () => {
    const w = testWorld();
    w.minute = 22 * 60;
    const c = testCat(w, { homeId: 'otthon1' }, { place: 'utca', x: 2000 });
    for (let i = 0; i < 300; i++) updateCatAi(w, c, 1, never);
    expect(c.place).toBe('otthon1');
    expect(c.activity).toBe('alszik');
    expect(c.x).toBe(HOME_BED_X);
  });

  it('éjjel egy másik épületből is hazamegy', () => {
    const w = testWorld();
    w.minute = 23 * 60;
    const c = testCat(w, { homeId: 'otthon2' }, { place: 'bolt', x: 500 });
    updateCatAi(w, c, 1, never);
    expect(c.place).toBe('utca');
    expect(Math.abs(c.x - BUILDINGS.bolt.doorX)).toBeLessThanOrEqual(25);
  });

  it('reggel kipihenten felkel', () => {
    const w = testWorld();
    w.minute = 7 * 60;
    const c = testCat(w, {}, { place: 'otthon1', activity: 'alszik' });
    c.needs.alvas = 100;
    updateCatAi(w, c, 1, never);
    expect(c.activity).not.toBe('alszik');
  });

  it('nappal tovább alszik, amíg ki nem pihente magát', () => {
    const w = testWorld();
    w.minute = 12 * 60;
    const c = testCat(w, {}, { place: 'otthon1', activity: 'alszik' });
    c.needs.alvas = 50;
    updateCatAi(w, c, 1, never);
    expect(c.activity).toBe('alszik');
  });

  it('nappal is hazamegy aludni, ha nagyon fáradt', () => {
    const w = testWorld();
    w.minute = 12 * 60;
    const c = testCat(w, {}, { place: 'otthon1', x: HOME_BED_X });
    c.needs.alvas = 10;
    for (let i = 0; i < 5; i++) updateCatAi(w, c, 1, never);
    expect(c.activity).toBe('alszik');
  });

  it('a beteg macska nem kószál', () => {
    const w = testWorld();
    w.minute = 12 * 60;
    const c = testCat(w, {}, { sick: true, place: 'utca', x: 700 });
    updateCatAi(w, c, 1, () => 0);
    expect(c.targetX).toBeNull();
    expect(c.goal).toBeNull();
    expect(c.place).toBe('utca');
  });

  it('nappal az utcán új célpontot választ', () => {
    const w = testWorld();
    w.minute = 12 * 60;
    const c = testCat(w, {}, { place: 'utca', x: 700 });
    updateCatAi(w, c, 1, seq(0.5, 0.01, 0.5));
    expect(c.goal).toBeNull();
    expect(c.targetX).toBe(3050);
  });

  it('nappal az utcán néha bemegy egy épületbe', () => {
    const w = testWorld();
    w.minute = 12 * 60;
    const c = testCat(w, {}, { place: 'utca', x: 700 });
    updateCatAi(w, c, 1, seq(0.001, 0));
    expect(c.goal).toBe('otthon1');
    expect(c.targetX).toBe(BUILDINGS.otthon1.doorX);
    for (let i = 0; i < 100; i++) updateCatAi(w, c, 1, () => 0.5);
    expect(c.place).toBe('otthon1');
  });

  it('a szomjas macska szól', () => {
    const w = testWorld();
    w.minute = 12 * 60;
    const c = testCat(w);
    c.needs.ital = 5;
    updateCatAi(w, c, 1, () => 0);
    expect(c.bubble).toContain('Szomjas');
  });
});
