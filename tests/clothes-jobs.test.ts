import { describe, expect, it } from 'vitest';
import { buyClothing, protectedFrom, setHair, wear } from '../src/sim/clothes';
import { paySalaries } from '../src/sim/economy';
import { updateCatAi } from '../src/sim/ai';
import { SALARY } from '../src/sim/balance';
import { addStars, buildingOpen } from '../src/sim/progress';
import { never, testCat, testWorld } from './helpers';

describe('ruhák', () => {
  it('megvenni csak nyitott boltban, eladóval lehet, és csak egyszer', () => {
    const w = testWorld();
    expect(buyClothing(w, 'korona', 'ruhabolt').ok).toBe(false);
    addStars(w, 2);
    expect(buyClothing(w, 'korona', 'ruhabolt').ok).toBe(false);
    testCat(w, { job: 'elado' });
    expect(buyClothing(w, 'korona', 'ruhabolt').ok).toBe(true);
    expect(w.coins).toBe(15);
    expect(buyClothing(w, 'korona', 'ruhabolt').ok).toBe(false);
  });
  it('a hókabát csak a Sí-boltban kapható', () => {
    const w = testWorld();
    addStars(w, 15);
    testCat(w, { job: 'elado' });
    expect(buyClothing(w, 'hokabat', 'ruhabolt').ok).toBe(false);
    expect(buyClothing(w, 'hokabat', 'sibolt').ok).toBe(true);
  });
  it('öltözni otthon lehet, az utcán nem', () => {
    const w = testWorld();
    w.ownedClothes.push('polo');
    const c = testCat(w);
    expect(wear(w, c.id, 'polo', '#fff').ok).toBe(false);
    c.place = 'otthon1';
    expect(wear(w, c.id, 'polo', '#fff').ok).toBe(true);
    expect(c.outfit.felso?.id).toBe('polo');
  });
  it('az egyberuha leveszi a felsőt és az alsót', () => {
    const w = testWorld();
    w.ownedClothes.push('polo', 'nadrag', 'ruha');
    const c = testCat(w, {}, { place: 'otthon1' });
    wear(w, c.id, 'polo', '#fff');
    wear(w, c.id, 'nadrag', '#fff');
    wear(w, c.id, 'ruha', '#f0f');
    expect(c.outfit.felso).toBeUndefined();
    expect(c.outfit.also).toBeUndefined();
    expect(c.outfit.egyberuha?.id).toBe('ruha');
    wear(w, c.id, 'polo', '#fff');
    expect(c.outfit.egyberuha).toBeUndefined();
  });
  it('hidegben véd a sál; a hópárduc ruha nélkül is bírja', () => {
    const w = testWorld();
    const tiger = testCat(w);
    const snow = testCat(w, { species: 'hoparduc' });
    expect(protectedFrom(tiger, 'hideg')).toBe(false);
    expect(protectedFrom(snow, 'hideg')).toBe(true);
    tiger.outfit.kieg = { id: 'sal', color: '#f00' };
    expect(protectedFrom(tiger, 'hideg')).toBe(true);
    expect(protectedFrom(tiger, 'meleg')).toBe(false);
    expect(protectedFrom(tiger, 'esos')).toBe(true);
  });
  it('fodrász: fodrász kell és pénzbe kerül', () => {
    const w = testWorld();
    const c = testCat(w, {}, { place: 'fodrasz' });
    expect(setHair(w, c.id, 'konty', '#f00').ok).toBe(false);
    testCat(w, { job: 'fodrasz' });
    expect(setHair(w, c.id, 'konty', '#f00').ok).toBe(true);
    expect(c.hair).toBe('konty');
    expect(w.coins).toBe(18);
  });
});

describe('munka', () => {
  it('nappal bemegy a munkahelyére, és aznap fizetést kap', () => {
    const w = testWorld();
    w.minute = 9 * 60;
    const doc = testCat(w, { job: 'orvos' }, { x: 300 });
    for (let i = 0; i < 200; i++) updateCatAi(w, doc, 1, never);
    expect(doc.place).toBe('korhaz');
    expect(doc.activity).toBe('dolgozik');
    w.coins = 0;
    expect(paySalaries(w)).toBe(SALARY);
  });
  it('aki nem ment dolgozni, nem kap fizetést', () => {
    const w = testWorld();
    testCat(w, { job: 'orvos' });
    w.coins = 0;
    expect(paySalaries(w)).toBe(0);
  });
  it('akit a játékos letett, egy ideig ott marad', () => {
    const w = testWorld();
    w.minute = 9 * 60;
    const doc = testCat(w, { job: 'orvos' }, { place: 'otthon1', stayUntil: 9 * 60 + 60 });
    updateCatAi(w, doc, 1, never);
    expect(doc.place).toBe('otthon1');
  });
  it('zárt munkahelyre nem jár be', () => {
    const w = testWorld();
    w.minute = 9 * 60;
    const t = testCat(w, { job: 'tanar' }, { x: 300 });
    expect(buildingOpen(w, 'iskola')).toBe(false);
    for (let i = 0; i < 50; i++) updateCatAi(w, t, 1, never);
    expect(t.place).not.toBe('iskola');
  });
});
