import { describe, expect, it } from 'vitest';
import { HEAL_COST, PET_JOY, PLAY_JOY, WATER_DRINK } from '../src/sim/balance';
import {
  buyFood, drinkWater, feedFromPantry, healCat, moveCat, orderMeal, petCat, playBall, putToBed, togglePause,
} from '../src/sim/actions';
import { testCat, testWorld } from './helpers';

describe('etetés a hűtőből', () => {
  it('a vega macska nem eszi meg a halat, és a hal megmarad', () => {
    const w = testWorld();
    const c = testCat(w, { diet: 'vega' }, { place: 'otthon1' });
    c.needs.etel = 10;
    w.pantry.hal = 1;
    const r = feedFromPantry(w, c.id, 'hal');
    expect(r.ok).toBe(false);
    expect(r.message).toContain('vega');
    expect(w.pantry.hal).toBe(1);
    expect(c.needs.etel).toBe(10);
  });
  it('a vega macska megeszi a répát', () => {
    const w = testWorld();
    const c = testCat(w, { diet: 'vega' }, { place: 'otthon1' });
    c.needs.etel = 10;
    w.pantry.repa = 2;
    expect(feedFromPantry(w, c.id, 'repa').ok).toBe(true);
    expect(w.pantry.repa).toBe(1);
    expect(c.needs.etel).toBe(40);
  });
  it('a húsevő a répát nem, a kenyeret megeszi', () => {
    const w = testWorld();
    const c = testCat(w, { diet: 'husevo' }, { place: 'otthon1' });
    w.pantry = { repa: 1, kenyer: 1 };
    expect(feedFromPantry(w, c.id, 'repa').ok).toBe(false);
    expect(feedFromPantry(w, c.id, 'kenyer').ok).toBe(true);
  });
  it('üres hűtőből nem lehet etetni', () => {
    const w = testWorld();
    const c = testCat(w);
    expect(feedFromPantry(w, c.id, 'hal').ok).toBe(false);
  });
  it('alvó macskát nem lehet etetni', () => {
    const w = testWorld();
    const c = testCat(w, {}, { activity: 'alszik' });
    w.pantry.hal = 1;
    expect(feedFromPantry(w, c.id, 'hal').ok).toBe(false);
    expect(w.pantry.hal).toBe(1);
  });
  it('a víz ingyen van', () => {
    const w = testWorld();
    const c = testCat(w, {}, { place: 'otthon1' });
    c.needs.ital = 10;
    expect(drinkWater(w, c.id).ok).toBe(true);
    expect(c.needs.ital).toBe(10 + WATER_DRINK);
    expect(w.coins).toBe(20);
  });
});

describe('bolt', () => {
  it('vásárláskor fogy a pénz és a hűtőbe kerül az étel', () => {
    const w = testWorld();
    testCat(w, { job: 'elado' });
    w.coins = 10;
    const r = buyFood(w, 'hal');
    expect(r.ok).toBe(true);
    expect(r.message).toBe('Megvetted: 🐟 Hal');
    expect(w.coins).toBe(6);
    expect(w.pantry.hal).toBe(1);
  });
  it('ha nincs elég pénz, megmondja mennyi hiányzik', () => {
    const w = testWorld();
    testCat(w, { job: 'elado' });
    w.coins = 3;
    const r = buyFood(w, 'hal');
    expect(r.message).toBe('Még 1 🐾 kell!');
    expect(w.pantry.hal).toBeUndefined();
  });
  it('eladó nélkül zárva', () => {
    const w = testWorld();
    expect(buyFood(w, 'repa').ok).toBe(false);
  });
});

describe('étterem', () => {
  it('a nem neki való ételért nem kell fizetni', () => {
    const w = testWorld();
    testCat(w, { job: 'szakacs' });
    const c = testCat(w, { diet: 'vega' });
    const r = orderMeal(w, c.id, 'hamburger');
    expect(r.ok).toBe(false);
    expect(w.coins).toBe(20);
  });
  it('rendelés: fizet, eszik, örül', () => {
    const w = testWorld();
    testCat(w, { job: 'szakacs' });
    const c = testCat(w, { diet: 'vega' }, { place: 'etterem' });
    c.needs.etel = 10;
    c.needs.jokedv = 10;
    expect(orderMeal(w, c.id, 'zoldsegleves').ok).toBe(true);
    expect(w.coins).toBe(15);
    expect(c.needs.etel).toBe(70);
    expect(c.needs.jokedv).toBe(20);
  });
  it('szakács nélkül zárva', () => {
    const w = testWorld();
    const c = testCat(w);
    expect(orderMeal(w, c.id, 'pizza').ok).toBe(false);
  });
});

describe('kórház', () => {
  it('csak a kórházban lehet gyógyítani', () => {
    const w = testWorld();
    testCat(w, { job: 'orvos' });
    const c = testCat(w, {}, { sick: true, place: 'utca' });
    expect(healCat(w, c.id).ok).toBe(false);
    expect(c.sick).toBe(true);
  });
  it('orvos nélkül nem megy', () => {
    const w = testWorld();
    const c = testCat(w, {}, { sick: true, place: 'korhaz' });
    const r = healCat(w, c.id);
    expect(r.ok).toBe(false);
    expect(r.message).toContain('orvos');
  });
  it('gyógyítás pénzbe kerül és meggyógyít', () => {
    const w = testWorld();
    testCat(w, { job: 'orvos' });
    const c = testCat(w, {}, { sick: true, place: 'korhaz' });
    expect(healCat(w, c.id).ok).toBe(true);
    expect(c.sick).toBe(false);
    expect(w.coins).toBe(20 - HEAL_COST);
  });
  it('a beteg orvos meggyógyíthatja magát', () => {
    const w = testWorld();
    const doc = testCat(w, { job: 'orvos' }, { sick: true, place: 'korhaz' });
    expect(healCat(w, doc.id).ok).toBe(true);
  });
});

describe('mozgatás, alvás, játék', () => {
  it('áthelyezéskor felébred és megáll', () => {
    const w = testWorld();
    const c = testCat(w, {}, { activity: 'alszik', place: 'otthon1', targetX: 300, goal: 'bolt' });
    moveCat(w, c.id, 'utca', 1000);
    expect(c.place).toBe('utca');
    expect(c.x).toBe(1000);
    expect(c.activity).toBe('all');
    expect(c.targetX).toBeNull();
    expect(c.goal).toBeNull();
  });
  it('ágyba csak otthon lehet fektetni', () => {
    const w = testWorld();
    const c = testCat(w);
    expect(putToBed(w, c.id).ok).toBe(false);
    c.place = 'otthon2';
    expect(putToBed(w, c.id).ok).toBe(true);
    expect(c.activity).toBe('alszik');
    expect(c.x).toBe(850);
  });
  it('simogatás jókedvet ad', () => {
    const w = testWorld();
    const c = testCat(w);
    c.needs.jokedv = 50;
    petCat(w, c.id);
    expect(c.needs.jokedv).toBe(50 + PET_JOY);
  });
  it('labdázás: mindenki örül, aki ébren van a szobában', () => {
    const w = testWorld();
    const a = testCat(w, {}, { place: 'otthon1' });
    const b = testCat(w, {}, { place: 'otthon1', activity: 'alszik' });
    const out = testCat(w, {}, { place: 'utca' });
    for (const c of [a, b, out]) c.needs.jokedv = 50;
    expect(playBall(w, 'otthon1').ok).toBe(true);
    expect(a.needs.jokedv).toBe(50 + PLAY_JOY);
    expect(b.needs.jokedv).toBe(50);
    expect(out.needs.jokedv).toBe(50);
  });
  it('szünet ki-be', () => {
    const w = testWorld();
    togglePause(w);
    expect(w.paused).toBe(true);
    togglePause(w);
    expect(w.paused).toBe(false);
  });
});
