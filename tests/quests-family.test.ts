import { describe, expect, it } from 'vitest';
import { findRecipe, FOODS, mixKind, RECIPE_IDS, RECIPES } from '../src/data/foods';
import { speciesName } from '../src/data/species';
import { buyFood, cook, feedFromPantry } from '../src/sim/actions';
import { DAY_MINUTES } from '../src/sim/balance';
import { addCat, ageAt, bornMinuteFor, defaultLooks } from '../src/sim/cats';
import { births, growUp, guessBaby, nameBaby, pairUp, tickBonds, wantBaby } from '../src/sim/family';
import { addStars } from '../src/sim/progress';
import { checkStateQuests, makeDailyQuests, questEvent } from '../src/sim/quests';
import { fulfillWish } from '../src/sim/wishes';
import { never, seq, testCat, testWorld } from './helpers';

describe('feladatok és csillagok', () => {
  it('naponta 3 különböző feladat', () => {
    const w = testWorld();
    testCat(w);
    const q = makeDailyQuests(w, seq(0.1, 0.5, 0.9, 0.3, 0.7));
    expect(q).toHaveLength(3);
    expect(new Set(q.map((x) => x.kind)).size).toBe(3);
  });
  it('a kész feladat csillagot és pénzt ad; mindhárom = bónusz csillag', () => {
    const w = testWorld();
    w.quests = [
      { kind: 'etet_vega', text: '', goal: 2, progress: 0, done: false },
      { kind: 'recept', text: '', goal: 1, progress: 0, done: false },
      { kind: 'kivansag', text: '', goal: 1, progress: 0, done: false },
    ];
    questEvent(w, { kind: 'etet', diet: 'vega' });
    expect(w.stars).toBe(0);
    questEvent(w, { kind: 'etet', diet: 'vega' });
    expect(w.stars).toBe(1);
    expect(w.coins).toBe(23);
    questEvent(w, { kind: 'recept' });
    questEvent(w, { kind: 'kivansag' });
    expect(w.stars).toBe(4);
  });
  it('pontos költés: ha túllépi, aznapra elbukott', () => {
    const w = testWorld();
    testCat(w, { job: 'elado' });
    w.quests = [{ kind: 'pontos_koltes', text: '', goal: 6, progress: 0, done: false, num: 6 }];
    buyFood(w, 'hal');
    expect(w.quests[0].done).toBe(false);
    buyFood(w, 'repa');
    expect(w.quests[0].done).toBe(true);
    const w2 = testWorld();
    testCat(w2, { job: 'elado' });
    w2.quests = [{ kind: 'pontos_koltes', text: '', goal: 5, progress: 0, done: false, num: 5 }];
    buyFood(w2, 'hal');
    buyFood(w2, 'hal');
    expect(w2.quests[0].failed).toBe(true);
  });
  it('a csillagok megnyitják az új helyeket, és szólnak róla', () => {
    const w = testWorld();
    addStars(w, 8);
    expect(w.inbox.some((m) => m.includes('Ruhabolt'))).toBe(true);
    expect(w.inbox.some((m) => m.includes('Parkváros'))).toBe(true);
    expect(w.inbox.some((m) => m.includes('Hós-hegy'))).toBe(false);
  });
  it('fejfedős feladat állapotból teljesül', () => {
    const w = testWorld();
    w.quests = [{ kind: 'fejfedo', text: '', goal: 2, progress: 0, done: false }];
    testCat(w).outfit.fej = { id: 'masni', color: '#f00' };
    checkStateQuests(w);
    expect(w.quests[0].done).toBe(false);
    testCat(w).outfit.fej = { id: 'korona', color: '#ff0' };
    checkStateQuests(w);
    expect(w.quests[0].done).toBe(true);
  });
  it('kívánság: ha megkapja, amit kért, örül és pénzt hoz', () => {
    const w = testWorld();
    const c = testCat(w, {}, { place: 'otthon1', wish: { kind: 'etel', food: 'hal' } });
    c.needs.jokedv = 10;
    w.pantry.hal = 1;
    feedFromPantry(w, c.id, 'hal');
    expect(c.wish).toBeNull();
    expect(c.needs.jokedv).toBeGreaterThan(40);
    expect(w.coins).toBe(22);
    fulfillWish(w, c);
    expect(w.coins).toBe(22);
  });
});

describe('receptek', () => {
  it('a recept fajtája a hozzávalókból jön', () => {
    for (const id of RECIPE_IDS) {
      const r = RECIPES[id];
      expect(r.dish.kind).toBe(mixKind(FOODS[r.a].kind, FOODS[r.b].kind));
    }
  });
  it('mindegy, milyen sorrendben', () => {
    expect(findRecipe('paradicsom', 'teszta')).toBe('spagetti');
    expect(findRecipe('repa', 'hal')).toBeNull();
  });
  it('főzés: elfogy a két hozzávaló, megjelenik az étel, új recept', () => {
    const w = testWorld();
    testCat(w, { job: 'szakacs' });
    w.pantry = { teszta: 1, paradicsom: 1 };
    expect(cook(w, 'teszta', 'paradicsom').ok).toBe(true);
    expect(w.pantry.spagetti).toBe(1);
    expect(w.pantry.teszta).toBe(0);
    expect(w.recipes).toEqual(['spagetti']);
  });
  it('rossz párosításnál nem fogy el semmi', () => {
    const w = testWorld();
    testCat(w, { job: 'szakacs' });
    w.pantry = { repa: 1, hal: 1 };
    expect(cook(w, 'repa', 'hal').ok).toBe(false);
    expect(w.pantry.repa).toBe(1);
  });
  it('a baba csak cumisüveget és tejet eszik', () => {
    const w = testWorld();
    const baby = testCat(w, { age: 'baba' }, { place: 'otthon1' });
    w.pantry = { hal: 1, cumisuveg: 1 };
    expect(feedFromPantry(w, baby.id, 'hal').ok).toBe(false);
    expect(feedFromPantry(w, baby.id, 'cumisuveg').ok).toBe(true);
  });
});

describe('család', () => {
  it('a keverék neve a szülőktől függ', () => {
    expect(speciesName('tigris', 'oroszlan')).toBe('Ligris');
    expect(speciesName('oroszlan', 'tigris')).toBe('Tigroroszlán');
    expect(speciesName('jaguar', 'gepard')).toBe('Jaguár–gepárd keverék');
    expect(speciesName('jaguar', null)).toBe('Jaguár');
  });
  it('pár → együtt töltött idő → baba → születés → tipp', () => {
    const w = testWorld();
    const mom = testCat(w, { species: 'tigris', sex: 'lany' }, { place: 'otthon1' });
    const dad = testCat(w, { species: 'oroszlan', sex: 'fiu', homeId: 'otthon2' }, { place: 'otthon2' });
    expect(pairUp(w, mom.id, dad.id).ok).toBe(true);
    expect(dad.homeId).toBe('otthon1');
    expect(wantBaby(w, mom.id, never).ok).toBe(false);
    dad.place = 'otthon1';
    tickBonds(w, 300);
    expect(mom.bond).toBe(100);
    expect(wantBaby(w, dad.id, never).ok).toBe(true);
    expect(mom.pregnancy?.answer).toBe('Ligris');
    expect(mom.pregnancy?.options).toContain('Ligris');
    guessBaby(w, mom.id, 'Ligris');
    w.minute += DAY_MINUTES;
    births(w, never);
    expect(mom.pregnancy).toBeNull();
    const baby = w.cats[w.cats.length - 1];
    expect(baby.age).toBe('baba');
    expect(baby.hybrid).toBe('oroszlan');
    expect(w.stars).toBe(1);
    expect(w.namingQueue).toEqual([baby.id]);
    nameBaby(w, baby.id, 'Csoki');
    expect(baby.name).toBe('Csoki');
    expect(w.namingQueue).toEqual([]);
    expect(w.lexicon).toContain('ligris');
  });
  it('lány + lány párnak nem lehet babája', () => {
    const w = testWorld();
    const a = testCat(w, { sex: 'lany' }, { place: 'otthon1' });
    const b = testCat(w, { sex: 'lany' }, { place: 'otthon1' });
    pairUp(w, a.id, b.id);
    tickBonds(w, 300);
    expect(wantBaby(w, a.id).message).toContain('lány és egy fiú');
  });
  it('felnövés: baba → gyerek → felnőtt', () => {
    const now = 10 * DAY_MINUTES;
    expect(ageAt(bornMinuteFor('baba', now), now)).toBe('baba');
    expect(ageAt(bornMinuteFor('gyerek', now), now)).toBe('gyerek');
    const w = testWorld();
    const c = testCat(w, { age: 'baba' });
    w.minute += 3 * DAY_MINUTES;
    growUp(w);
    expect(c.age).toBe('gyerek');
    w.minute += 3 * DAY_MINUTES;
    growUp(w);
    expect(c.age).toBe('felnott');
  });
  it('a műhelyben épített macska bekerül a lexikonba', () => {
    const w = testWorld();
    addCat(w, { name: 'Pici', species: 'karakal', sex: 'lany', age: 'gyerek', diet: 'vega', job: null, looks: defaultLooks('karakal', 'lany', 'gyerek'), homeId: 'otthon1' });
    expect(w.lexicon).toContain('karakal');
  });
});
