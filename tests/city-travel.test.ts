import { describe, expect, it } from 'vitest';
import { BUILDINGS } from '../src/data/buildings';
import { moveCat, putToBed, useSpot } from '../src/sim/actions';
import { updateCatAi } from '../src/sim/ai';
import { findTeddy, maybeStartEvent } from '../src/sim/events';
import { bedX, buyFurniture, placeFurniture, placeHas, storeFurniture } from '../src/sim/homes';
import { answerLesson, makeQuestion } from '../src/sim/lessons';
import { answerGiraffes, buildSnowman, giraffeCount, meetWild } from '../src/sim/local';
import { addStars } from '../src/sim/progress';
import { dayOf } from '../src/sim/time';
import { crossed, runTransport } from '../src/sim/travel';
import type { GameEvent } from '../src/sim/types';
import { tickWorld } from '../src/sim/world';
import { migrateV1, serialize, deserialize } from '../src/store/serialize';
import { never, seq, testCat, testWorld } from './helpers';

describe('közlekedés', () => {
  it('az indulási időt akkor is észreveszi, ha a lépés átlépi', () => {
    expect(crossed(599, 601, 600)).toBe(true);
    expect(crossed(600, 602, 600)).toBe(false);
    expect(crossed(1439, 1441, 0)).toBe(true);
  });
  it('a busz egész órakor elviszi a megállóban várókat, jegyért', () => {
    const w = testWorld();
    addStars(w, 8);
    testCat(w, { job: 'buszsofor' });
    const c = testCat(w, {}, { place: 'busz_bv' });
    w.minute = 10 * 60 + 1;
    const events: GameEvent[] = [];
    runTransport(w, 10 * 60 - 1, events);
    expect(c.street).toBe('parkvaros');
    expect(c.place).toBe('utca');
    expect(c.x).toBe(BUILDINGS.busz_pv.doorX);
    expect(w.coins).toBe(19);
    expect(events[0]).toMatchObject({ kind: 'utazas', mode: 'busz', to: 'parkvaros' });
  });
  it('sofőr nélkül nem indul, és szól', () => {
    const w = testWorld();
    addStars(w, 8);
    const c = testCat(w, {}, { place: 'busz_bv' });
    w.minute = 10 * 60 + 1;
    runTransport(w, 10 * 60 - 1, []);
    expect(c.street).toBe('belvaros');
    expect(w.inbox.some((m) => m.includes('buszsofőr'))).toBe(true);
  });
  it('a vonat csak menetrend szerint indul a Hós-hegyre', () => {
    const w = testWorld();
    addStars(w, 12);
    testCat(w, { job: 'mozdonyvezeto' });
    const c = testCat(w, {}, { place: 'vasut_bv' });
    w.minute = 9 * 60 + 1;
    runTransport(w, 9 * 60 - 1, []);
    expect(c.street).toBe('belvaros');
    w.minute = 10 * 60 + 1;
    runTransport(w, 10 * 60 - 1, []);
    expect(c.street).toBe('hoshegy');
    expect(w.coins).toBe(17);
  });
  it('a repülő a kapu szerint visz', () => {
    const w = testWorld();
    addStars(w, 15);
    testCat(w, { job: 'pilota' });
    const a = testCat(w, {}, { place: 'repter_pv', street: 'parkvaros' });
    const b = testCat(w, {}, { place: 'repter_pv', street: 'parkvaros' });
    const waiting = testCat(w, {}, { place: 'repter_pv', street: 'parkvaros' });
    useSpot(w, a.id, 'kapu_sz');
    useSpot(w, b.id, 'kapu_os');
    w.minute = 9 * 60 + 1;
    runTransport(w, 9 * 60 - 1, []);
    expect(a.street).toBe('szavanna');
    expect(b.street).toBe('oserdo');
    expect(waiting.street).toBe('parkvaros');
  });
  it('munkába busszal jár át a másik utcára (ingyen)', () => {
    const w = testWorld();
    addStars(w, 10);
    testCat(w, { job: 'buszsofor' }, { place: 'busz_bv', activity: 'dolgozik' });
    const ff = testCat(w, { job: 'tuzolto' }, { x: 4800 });
    w.minute = 8 * 60 + 10;
    for (let i = 0; i < 30; i++) updateCatAi(w, ff, 1, never);
    expect(ff.place).toBe('busz_bv');
    expect(ff.dest).toBe('tuzoltosag');
    w.minute = 9 * 60 + 1;
    runTransport(w, 9 * 60 - 1, []);
    expect(ff.street).toBe('parkvaros');
    expect(w.coins).toBe(20);
  });
  it('a Hós-hegyen a meleg ruha nélküli tigris gyorsabban szomorodik', () => {
    const w = testWorld();
    const cold = testCat(w, {}, { street: 'hoshegy', place: 'utca' });
    const warm = testCat(w, {}, { street: 'hoshegy', place: 'utca' });
    warm.outfit.fej = { id: 'sapka', color: '#00f' };
    tickWorld(w, 60, never);
    expect(cold.needs.jokedv).toBeLessThan(warm.needs.jokedv);
  });
});

describe('bővülő város', () => {
  it('hinta: játszik és nő a jókedve', () => {
    const w = testWorld();
    const c = testCat(w, {}, { place: 'park', street: 'parkvaros' });
    c.needs.jokedv = 20;
    expect(useSpot(w, c.id, 'hinta').ok).toBe(true);
    tickWorld(w, 30, never);
    expect(c.activity).toBe('jatszik');
    expect(c.needs.jokedv).toBeGreaterThan(30);
  });
  it('fán ragadt kölyök: csak a tűzoltó tudja lesegíteni', () => {
    const w = testWorld();
    addStars(w, 10);
    const kid = testCat(w, { age: 'gyerek' }, { x: 1000 });
    w.minute = 11 * 60;
    maybeStartEvent(w, seq(0.1, 0.0, 0.0));
    expect(kid.stuck).toBe(true);
    expect(moveCat(w, kid.id, 'utca', 500).ok).toBe(false);
    const other = testCat(w);
    expect(moveCat(w, other.id, 'utca', 1050).message).toContain('tűzoltó');
    const ff = testCat(w, { job: 'tuzolto' });
    const r = moveCat(w, ff.id, 'utca', 1060);
    expect(r.ok).toBe(true);
    expect(kid.stuck).toBe(false);
    expect(w.stars).toBe(11);
  });
  it('elveszett mackó: megtalálva jutalom', () => {
    const w = testWorld();
    addStars(w, 10);
    testCat(w, { age: 'gyerek' });
    w.minute = 11 * 60;
    maybeStartEvent(w, seq(0.1, 0.99, 0.0, 0.0));
    expect(w.event?.kind).toBe('macko');
    expect(findTeddy(w)).toContain('Megvan');
    expect(w.event).toBeNull();
  });
  it('bútor: vásárlás, lerakás, raktárba vissza', () => {
    const w = testWorld();
    addStars(w, 10);
    testCat(w, { job: 'elado' });
    expect(placeHas(w, 'otthon3', 'agy')).toBe(false);
    expect(buyFurniture(w, 'agy').ok).toBe(true);
    expect(placeFurniture(w, 'otthon3', 'agy', 600).ok).toBe(true);
    expect(placeHas(w, 'otthon3', 'agy')).toBe(true);
    const sleeper = testCat(w, { homeId: 'otthon3' }, { place: 'otthon3', street: 'parkvaros' });
    expect(bedX(w, sleeper)).toBe(600);
    storeFurniture(w, 'otthon3', w.homes.otthon3.items[0].uid);
    expect(w.furnitureStock).toEqual(['agy']);
    expect(bedX(w, sleeper)).toBeNull();
    expect(putToBed(w, sleeper.id).ok).toBe(true);
    expect(sleeper.bubble).toContain('Nincs ágyam');
  });
  it('iskolai óra: jó válasz tudást és pénzt ad', () => {
    const w = testWorld();
    testCat(w, { job: 'tanar' });
    const kid = testCat(w, { age: 'gyerek' }, { place: 'iskola' });
    const q = makeQuestion(seq(0.1, 0.2, 0.3, 0.4, 0.5));
    expect(q.options).toContain(q.answer);
    expect(answerLesson(w, q, 'rossz').ok).toBe(false);
    expect(answerLesson(w, q, q.answer).ok).toBe(true);
    expect(kid.knowledge).toBe(1);
    expect(w.coins).toBe(21);
  });
});

describe('úti célok és lexikon', () => {
  it('hóember csak akkor, ha van ott városi macska; 3 koppintás', () => {
    const w = testWorld();
    expect(buildSnowman(w).ok).toBe(false);
    testCat(w, {}, { street: 'hoshegy' });
    buildSnowman(w);
    buildSnowman(w);
    expect(buildSnowman(w).ok).toBe(true);
    expect(w.stars).toBe(1);
    expect(buildSnowman(w).ok).toBe(false);
  });
  it('zsiráfszámolás', () => {
    const w = testWorld();
    testCat(w, {}, { street: 'szavanna' });
    const n = giraffeCount(dayOf(w.minute));
    expect(answerGiraffes(w, n + 1).ok).toBe(false);
    expect(answerGiraffes(w, n).ok).toBe(true);
  });
  it('vadon élő macska → lexikon-kártya', () => {
    const w = testWorld();
    meetWild(w, 'szerval');
    expect(w.lexicon).toContain('szerval');
  });
});

describe('mentés', () => {
  it('v2 oda-vissza', () => {
    const w = testWorld();
    testCat(w);
    expect(deserialize(serialize(w))).toEqual(w);
  });
  it('az 1. szakasz mentése átalakul, a macskák megmaradnak', () => {
    const old = {
      version: 1, minute: 3000, coins: 33, paused: false, pantry: { hal: 3 }, nextId: 7, lastSalaryDay: 2,
      cats: [{
        id: 'c6', name: 'Cirmi', species: 'tigris', sex: 'lany', age: 'gyerek', diet: 'husevo', job: null,
        looks: { fur: '#F08A24', belly: '#fff', pattern: 'csikos', patternColor: '#000', eyes: '#ff0', ears: 'kerek', mane: false },
        needs: { etel: 50, ital: 40, alvas: 30, jokedv: 20 }, emptyMinutes: 0, sick: false, homeId: 'otthon2', place: 'bolt',
        x: 400, targetX: null, goal: null, activity: 'all', facing: -1, bubble: null, bubbleUntil: 0,
      }],
    };
    const w = deserialize(JSON.stringify(old))!;
    expect(w.version).toBe(2);
    expect(w.coins).toBe(33);
    expect(w.pantry.hal).toBe(3);
    const c = w.cats.find((x) => x.id === 'c6')!;
    expect(c.name).toBe('Cirmi');
    expect(c.place).toBe('bolt');
    expect(c.street).toBe('belvaros');
    expect(c.age).toBe('gyerek');
    expect(c.needs.jokedv).toBe(20);
    expect(w.cats.length).toBe(7);
    expect(new Set(w.cats.map((x) => x.id)).size).toBe(7);
    expect(w.quests).toHaveLength(3);
    expect(migrateV1).toBeTypeOf('function');
  });
});
