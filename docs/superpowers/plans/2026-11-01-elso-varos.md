# NagyMacskaCitiy – 1. szakasz („Első város”) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Egy tableten játszható első változat: oldalnézetes utca 2 otthonnal, bolttal, étteremmel, kórházzal és Macskaműhellyel; cuki, kódból rajzolt nagymacskák, akik maguktól élnek, ujjal áthúzhatók, etethetők/itathatók (vega/húsevő), elfáradnak, megbetegedhetnek; napszakok, pénz, automatikus mentés, kezdőképernyőre tehető PWA.

**Architecture:** A játékszabályok egy tiszta TypeScript modulban élnek (`src/sim/`), ami egy `World` objektumot módosít és Vitesttel tesztelhető. A React + SVG felület (`src/ui/`, `src/art/`) csak megjelenít és akciókat hív a Zustand store-on keresztül (`act(fn)` → klónozott világ módosítása). A játékhurok 250 ms-onként lépteti a világot; a mozgást CSS-átmenet simítja.

**Tech Stack:** Vite 6+, React 19, TypeScript, Zustand, idb-keyval, vite-plugin-pwa, @vite-pwa/assets-generator, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-01-nagymacskacitiy-design.md`

---

## Fájlszerkezet

```
index.html
package.json, tsconfig.json, vite.config.ts, playwright.config.ts
public/favicon.svg (+ generált PNG ikonok)
src/
  main.tsx, App.tsx, styles.css
  sim/            – szabályok, nincs React
    types.ts        típusok
    balance.ts      minden hangolható szám egy helyen
    result.ts       ok()/fail()
    time.ts         óra, nap, napszak
    needs.ts        igény-csíkok
    diet.ts         vega/húsevő szabály
    cats.ts         macska létrehozás, say(), findCat()
    names.ts        cuki nevek
    economy.ts      pénz, munkások, fizetés
    health.ts       betegség
    actions.ts      játékos-akciók (etetés, vásárlás, gyógyítás, mozgatás…)
    ai.ts           macskák magától viselkedése
    world.ts        kezdő világ + tickWorld()
  data/
    species.ts      13 faj
    foods.ts        ételek, menü
    buildings.ts    épületek, jelenet-méretek, placeName()
    jobs.ts         szakma-címkék
  store/
    store.ts        Zustand store
    serialize.ts    JSON <-> World
    save.ts         IndexedDB mentés
    hooks.ts        játékhurok + automatikus mentés
  art/
    color.ts        shade()
    CatFigure.tsx   a macska rajza
    CatFace.tsx     kis fej-ikon
    BuildingArt.tsx épület az utcán
    Scenery.tsx     ég, utca, lámpák
    Rooms.tsx       szobák és bútorok
  ui/
    useCatDrag.ts   macska húzása
    CatSprite.tsx   macska a jelenetben (buborék, Zzz)
    CityScreen.tsx  utca
    InsideScreen.tsx épület belseje
    ItemTray.tsx    húzható tárgysor
    trays.tsx       hűtő, bolt, étterem, kórház sávok
    Hud.tsx, CatPanel.tsx, CatList.tsx, Toast.tsx, catStatus.ts
    CreatorScreen.tsx Macskaműhely
tests/            – Vitest egységtesztek (sim + store/serialize + art/color)
e2e/              – Playwright
.github/workflows/deploy.yml
```

---

### Task 1: Projekt váz

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `.gitignore`, `tests/smoke.test.ts`

- [ ] **Step 1: package.json**

```json
{
  "name": "nagymacskacitiy",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview --host",
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "e2e": "playwright test",
    "icons": "pwa-assets-generator --preset minimal-2023 public/favicon.svg"
  }
}
```

- [ ] **Step 2: Függőségek telepítése**

```bash
npm i react react-dom zustand idb-keyval
npm i -D typescript vite @vitejs/plugin-react vitest @types/react @types/react-dom @types/node vite-plugin-pwa @vite-pwa/assets-generator @playwright/test
```

- [ ] **Step 3: tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "types": ["vite/client", "vite-plugin-pwa/client", "node"]
  },
  "include": ["src", "tests", "e2e", "vite.config.ts", "playwright.config.ts"]
}
```

- [ ] **Step 4: vite.config.ts** (a PWA a 19. feladatban kerül bele)

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  test: { include: ['tests/**/*.test.ts'] },
});
```

- [ ] **Step 5: index.html**

```html
<!doctype html>
<html lang="hu">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="NagyMacska" />
    <meta name="theme-color" content="#F08A24" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <title>NagyMacskaCitiy</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: src/main.tsx, src/App.tsx (ideiglenes), src/styles.css (ideiglenes), .gitignore**

`src/main.tsx`:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`src/App.tsx` (a 16. feladatban lecseréljük):
```tsx
export function App() {
  return <div className="loading">🐾 NagyMacskaCitiy</div>;
}
```

`src/styles.css`:
```css
html, body, #root { margin: 0; height: 100%; }
.loading { display: grid; place-items: center; height: 100%; font-size: 40px; }
```

`.gitignore`:
```
node_modules
dist
dev-dist
test-results
playwright-report
.DS_Store
```

- [ ] **Step 7: Füstteszt**

`tests/smoke.test.ts`:
```ts
import { describe, expect, it } from 'vitest';

describe('smoke', () => {
  it('works', () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run: `npm test` → Expected: 1 passed. Run: `npm run typecheck` → Expected: nincs hiba.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: Vite + React + TS projektváz"
```

---

### Task 2: Típusok, hangolási számok, eredmény-segéd, adatfájlok

**Files:**
- Create: `src/sim/types.ts`, `src/sim/balance.ts`, `src/sim/result.ts`, `src/data/species.ts`, `src/data/foods.ts`, `src/data/buildings.ts`, `src/data/jobs.ts`

Ezek csak típusok és adatok, a tesztek a következő feladatokban használják őket.

- [ ] **Step 1: src/sim/types.ts**

```ts
export type SpeciesId =
  | 'oroszlan' | 'tigris' | 'jaguar' | 'leopard' | 'fekete_parduc' | 'hoparduc' | 'gepard'
  | 'puma' | 'kodfoltos_parduc' | 'hiuz' | 'szerval' | 'karakal' | 'ocelot';
export type PatternKind = 'nincs' | 'csikos' | 'rozettas' | 'pottyos' | 'felhos';
export type EarKind = 'kerek' | 'hegyes' | 'nagy' | 'pamacsos';
export type Sex = 'lany' | 'fiu';
export type AgeStage = 'baba' | 'gyerek' | 'felnott';
export type Diet = 'vega' | 'husevo';
export type FoodKind = Diet | 'mindenki';
export type JobId = 'orvos' | 'szakacs' | 'elado';
export type NeedKey = 'etel' | 'ital' | 'alvas' | 'jokedv';
export type Needs = Record<NeedKey, number>;
export type HomeId = 'otthon1' | 'otthon2';
export type BuildingId = HomeId | 'bolt' | 'etterem' | 'korhaz';
export type Place = 'utca' | BuildingId;
export type Activity = 'all' | 'setal' | 'alszik';
export type FoodId =
  | 'repa' | 'alma' | 'salata' | 'bab' | 'hal' | 'csirke' | 'tojas' | 'kenyer' | 'teszta' | 'tej' | 'gyumolcsle';
export type MealId = 'zoldsegleves' | 'gyumolcstal' | 'pizza' | 'halastal' | 'hamburger';

export interface Looks {
  fur: string;
  belly: string;
  pattern: PatternKind;
  patternColor: string;
  eyes: string;
  ears: EarKind;
  mane: boolean;
}

export interface Cat {
  id: string;
  name: string;
  species: SpeciesId;
  sex: Sex;
  age: AgeStage;
  diet: Diet;
  job: JobId | null;
  looks: Looks;
  needs: Needs;
  /** Hány játékperce üres valamelyik csík (betegséghez). */
  emptyMinutes: number;
  sick: boolean;
  homeId: HomeId;
  place: Place;
  x: number;
  targetX: number | null;
  /** Melyik épületbe megy be, ha odaért. */
  goal: BuildingId | null;
  activity: Activity;
  facing: 1 | -1;
  bubble: string | null;
  /** Játékperc, amikor a buborék eltűnik. */
  bubbleUntil: number;
}

export interface Edible {
  name: string;
  emoji: string;
  kind: FoodKind;
  price: number;
  etel: number;
  ital: number;
  jokedv: number;
}

export interface World {
  version: number;
  /** Összes eltelt játékperc a kezdet óta (0 = 1. nap 00:00). */
  minute: number;
  coins: number;
  paused: boolean;
  pantry: Partial<Record<FoodId, number>>;
  cats: Cat[];
  nextId: number;
  lastSalaryDay: number;
}

export interface ActionResult {
  ok: boolean;
  message: string;
}
```

- [ ] **Step 2: src/sim/balance.ts**

```ts
import type { Needs } from './types';

export const WORLD_VERSION = 1;

export const GAME_MINUTES_PER_DAY = 1440;
export const REAL_SECONDS_PER_DAY = 600; // 1 játéknap = 10 perc
export const GAME_MIN_PER_REAL_SEC = GAME_MINUTES_PER_DAY / REAL_SECONDS_PER_DAY; // 2.4

export const START_MINUTE = 8 * 60; // 1. nap 08:00
export const START_COINS = 40;
export const MAX_CATS = 30;

/** Ennyivel fogy percenként (100 = tele). */
export const DECAY_PER_MIN: Needs = {
  etel: 100 / 1440,
  ital: 100 / 1080,
  alvas: 100 / 1080,
  jokedv: 100 / 1440,
};
export const SLEEP_RESTORE_PER_MIN = 100 / 360;
export const SICK_AFTER_EMPTY_MIN = 720;

export const HEAL_COST = 3;
export const SALARY = 5;
export const SALARY_HOUR = 18;
export const PET_JOY = 4;
export const PLAY_JOY = 8;
export const WATER_DRINK = 50;

/** Egység / játékperc (felnőtt). */
export const WALK_SPEED = 25;
export const BUBBLE_MINUTES = 20;
```

- [ ] **Step 3: src/sim/result.ts**

```ts
import type { ActionResult } from './types';

export const ok = (message = ''): ActionResult => ({ ok: true, message });
export const fail = (message: string): ActionResult => ({ ok: false, message });
```

- [ ] **Step 4: src/data/species.ts**

```ts
import type { Looks, SpeciesId } from '../sim/types';

export interface SpeciesDef {
  id: SpeciesId;
  name: string;
  habitat: string;
  fact: string;
  looks: Omit<Looks, 'mane'>;
}

const def = (
  id: SpeciesId, name: string, habitat: string, fact: string,
  fur: string, belly: string, pattern: Looks['pattern'], patternColor: string, eyes: string, ears: Looks['ears'],
): SpeciesDef => ({ id, name, habitat, fact, looks: { fur, belly, pattern, patternColor, eyes, ears } });

export const SPECIES: Record<SpeciesId, SpeciesDef> = {
  oroszlan: def('oroszlan', 'Oroszlán', 'Szavanna', 'Az oroszlánok nagy családban, falkában élnek.', '#E8B04B', '#F7DFA6', 'nincs', '#A8642A', '#C8862A', 'kerek'),
  tigris: def('tigris', 'Tigris', 'Őserdő', 'Minden tigris csíkjai mások, mint az ujjlenyomat.', '#F08A24', '#FFF3E0', 'csikos', '#2B1B10', '#E2B33C', 'kerek'),
  jaguar: def('jaguar', 'Jaguár', 'Őserdő', 'A jaguár nagyon szeret úszni.', '#E9A93A', '#FFF1D6', 'rozettas', '#3A2410', '#D4A017', 'kerek'),
  leopard: def('leopard', 'Leopárd', 'Szavanna', 'A leopárd a vacsoráját felviszi a fára.', '#EDBB5A', '#FFF5DE', 'rozettas', '#3D2A12', '#B8D86B', 'kerek'),
  fekete_parduc: def('fekete_parduc', 'Fekete párduc', 'Őserdő', 'A fekete párducnak is vannak foltjai, csak nehéz meglátni őket!', '#2E2A33', '#4A4452', 'rozettas', '#1E1B22', '#F2D23C', 'kerek'),
  hoparduc: def('hoparduc', 'Hópárduc', 'Hós-hegy', 'A hópárduc a hosszú, bolyhos farkát sálnak használja.', '#D9D9D2', '#F7F7F2', 'rozettas', '#5E5E5E', '#8FB7C9', 'kerek'),
  gepard: def('gepard', 'Gepárd', 'Szavanna', 'A gepárd a leggyorsabb szárazföldi állat.', '#E8C064', '#FFF6DF', 'pottyos', '#2A1F14', '#C79A3A', 'kerek'),
  puma: def('puma', 'Puma', 'Amerikai hegyvidék', 'A puma nem tud üvölteni, de tud dorombolni!', '#C9955E', '#F3E2CC', 'nincs', '#8A5A30', '#9BBF6A', 'hegyes'),
  kodfoltos_parduc: def('kodfoltos_parduc', 'Ködfoltos párduc', 'Őserdő', 'A ködfoltos párducnak nagyon hosszú szemfogai vannak.', '#BFA27A', '#EDE0C8', 'felhos', '#4A3A28', '#C9A646', 'kerek'),
  hiuz: def('hiuz', 'Hiúz', 'Hós-hegy', 'A hiúz fülén pamacs van, és nagyon jól hall.', '#C7A27C', '#F2E6D6', 'pottyos', '#6B5440', '#C9B458', 'pamacsos'),
  szerval: def('szerval', 'Szervál', 'Szavanna', 'A szerválnak hatalmas füle van, azzal hallja meg az egereket a fűben.', '#E7B85C', '#FFF4DA', 'pottyos', '#2B2015', '#D9B23A', 'nagy'),
  karakal: def('karakal', 'Karakál', 'Szavanna', 'A karakál olyan magasra ugrik, hogy a repülő madarat is elkapja.', '#C98B52', '#F4E1C8', 'nincs', '#5A3A20', '#C7A24A', 'pamacsos'),
  ocelot: def('ocelot', 'Ocelot', 'Őserdő', 'Az ocelot éjjel vadászik, nappal a fán alszik.', '#D9A85F', '#FFF2D9', 'rozettas', '#3B2814', '#B79A46', 'kerek'),
};

export const SPECIES_IDS = Object.keys(SPECIES) as SpeciesId[];
```

- [ ] **Step 5: src/data/foods.ts**

```ts
import type { Edible, FoodId, FoodKind, MealId } from '../sim/types';

const e = (name: string, emoji: string, kind: FoodKind, price: number, etel: number, ital: number, jokedv: number): Edible =>
  ({ name, emoji, kind, price, etel, ital, jokedv });

export const FOODS: Record<FoodId, Edible> = {
  repa: e('Répa', '🥕', 'vega', 2, 30, 0, 2),
  alma: e('Alma', '🍎', 'vega', 2, 25, 5, 3),
  salata: e('Saláta', '🥬', 'vega', 2, 25, 5, 0),
  bab: e('Bab', '🫘', 'vega', 3, 40, 0, 0),
  hal: e('Hal', '🐟', 'husevo', 4, 45, 0, 3),
  csirke: e('Csirke', '🍗', 'husevo', 4, 45, 0, 3),
  tojas: e('Tojás', '🥚', 'husevo', 3, 35, 0, 0),
  kenyer: e('Kenyér', '🍞', 'mindenki', 2, 30, 0, 0),
  teszta: e('Tészta', '🍝', 'mindenki', 3, 40, 0, 2),
  tej: e('Tej', '🥛', 'mindenki', 2, 10, 35, 3),
  gyumolcsle: e('Gyümölcslé', '🧃', 'mindenki', 2, 0, 40, 4),
};
export const FOOD_IDS = Object.keys(FOODS) as FoodId[];

export const MEALS: Record<MealId, Edible> = {
  zoldsegleves: e('Zöldségleves', '🍲', 'vega', 5, 60, 15, 10),
  gyumolcstal: e('Gyümölcstál', '🍉', 'vega', 4, 40, 15, 12),
  pizza: e('Pizza', '🍕', 'mindenki', 5, 60, 0, 15),
  halastal: e('Halas tál', '🍣', 'husevo', 6, 70, 0, 12),
  hamburger: e('Hamburger', '🍔', 'husevo', 6, 70, 0, 12),
};
export const MEAL_IDS = Object.keys(MEALS) as MealId[];

export const KIND_ICON: Record<FoodKind, string> = { vega: '🥕', husevo: '🍖', mindenki: '😋' };
```

- [ ] **Step 6: src/data/buildings.ts**

```ts
import type { BuildingId, Place } from '../sim/types';

export interface BuildingDef {
  id: BuildingId | 'muhely';
  name: string;
  emoji: string;
  style: 'haz' | 'bolt';
  x: number;
  width: number;
  height: number;
  doorX: number;
  wall: string;
  roof: string;
}

// Utca-jelenet (SVG egységek)
export const STREET_WIDTH = 3000;
export const SCENE_HEIGHT = 700;
export const GROUND_Y = 560;
export const SIDEWALK_Y = 630; // a macskák talpa
export const SIDEWALK_BOTTOM = 660;

// Szoba-jelenet
export const ROOM_WIDTH = 1000;
export const ROOM_HEIGHT = 800;
export const ROOM_FLOOR_Y = 560;
export const ROOM_DOOR_X = 90;
export const HOME_BED_X = 800;

const b = (
  id: BuildingDef['id'], name: string, emoji: string, style: BuildingDef['style'],
  x: number, width: number, height: number, wall: string, roof: string,
): BuildingDef => ({ id, name, emoji, style, x, width, height, doorX: x + width / 2, wall, roof });

export const BUILDINGS: Record<BuildingId, BuildingDef> = {
  otthon1: b('otthon1', 'Rózsa-ház', '🏠', 'haz', 100, 380, 330, '#F8BBD0', '#C2185B'),
  bolt: b('bolt', 'Bolt', '🛒', 'bolt', 600, 380, 300, '#FFE082', '#F57F17'),
  etterem: b('etterem', 'Étterem', '🍽️', 'bolt', 1100, 420, 340, '#FFCCBC', '#BF360C'),
  korhaz: b('korhaz', 'Kórház', '🏥', 'bolt', 1640, 440, 380, '#E3F2FD', '#1565C0'),
  otthon2: b('otthon2', 'Menta-ház', '🏡', 'haz', 2200, 380, 330, '#C8E6C9', '#2E7D32'),
};
export const BUILDING_IDS = Object.keys(BUILDINGS) as BuildingId[];

export const WORKSHOP = b('muhely', 'Macskaműhely', '🛠️', 'haz', 2700, 260, 280, '#D1C4E9', '#5E35B1');

export function isHome(place: Place): place is 'otthon1' | 'otthon2' {
  return place === 'otthon1' || place === 'otthon2';
}

export function placeName(place: Place): string {
  if (place === 'utca') return '🛣️ Utca';
  const def = BUILDINGS[place];
  return `${def.emoji} ${def.name}`;
}
```

- [ ] **Step 7: src/data/jobs.ts**

```ts
import type { AgeStage, JobId } from '../sim/types';

export const JOB_LABEL: Record<JobId, string> = { orvos: '🩺 Orvos', szakacs: '👩‍🍳 Szakács', elado: '🛒 Eladó' };
export const JOB_IDS = Object.keys(JOB_LABEL) as JobId[];
export const AGE_LABEL: Record<AgeStage, string> = { baba: '🍼 Baba', gyerek: '🧒 Gyerek', felnott: '🧑 Felnőtt' };
```

- [ ] **Step 8: Ellenőrzés és commit**

Run: `npm run typecheck` → Expected: nincs hiba.

```bash
git add -A
git commit -m "feat(sim): típusok, hangolás, fajok, ételek, épületek"
```

---

### Task 3: Idő

**Files:**
- Create: `src/sim/time.ts`
- Test: `tests/time.test.ts`

- [ ] **Step 1: Failing teszt**

```ts
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
```

- [ ] **Step 2: Futtatás** – `npx vitest run tests/time.test.ts` → FAIL (modul nem található)

- [ ] **Step 3: Implementáció – src/sim/time.ts**

```ts
import { GAME_MIN_PER_REAL_SEC, GAME_MINUTES_PER_DAY } from './balance';

export type DayPhase = 'reggel' | 'nappal' | 'este' | 'ejjel';

export function dayOf(minute: number): number {
  return Math.floor(minute / GAME_MINUTES_PER_DAY) + 1;
}

export function minuteOfDay(minute: number): number {
  return ((minute % GAME_MINUTES_PER_DAY) + GAME_MINUTES_PER_DAY) % GAME_MINUTES_PER_DAY;
}

export function hourOf(minute: number): number {
  return Math.floor(minuteOfDay(minute) / 60);
}

export function phaseOf(minute: number): DayPhase {
  const h = hourOf(minute);
  if (h < 6 || h >= 21) return 'ejjel';
  if (h < 10) return 'reggel';
  if (h < 18) return 'nappal';
  return 'este';
}

export function isNight(minute: number): boolean {
  return phaseOf(minute) === 'ejjel';
}

export function formatClock(minute: number): string {
  const m = Math.floor(minuteOfDay(minute));
  const hh = String(Math.floor(m / 60)).padStart(2, '0');
  const mm = String(m % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function realSecondsToGameMinutes(seconds: number): number {
  return seconds * GAME_MIN_PER_REAL_SEC;
}
```

- [ ] **Step 4: Futtatás** – `npx vitest run tests/time.test.ts` → PASS

- [ ] **Step 5: Commit** – `git add -A && git commit -m "feat(sim): játékidő és napszakok"`

---

### Task 4: Macska-létrehozás, nevek, teszt-segédek

**Files:**
- Create: `src/sim/cats.ts`, `src/sim/names.ts`, `tests/helpers.ts`
- Test: `tests/cats.test.ts`

- [ ] **Step 1: Teszt-segéd – tests/helpers.ts**

```ts
import { START_MINUTE, WORLD_VERSION } from '../src/sim/balance';
import { buildCat, defaultLooks, type CatDraft } from '../src/sim/cats';
import type { Cat, World } from '../src/sim/types';

export function testWorld(): World {
  return { version: WORLD_VERSION, minute: START_MINUTE, coins: 20, paused: false, pantry: {}, cats: [], nextId: 1, lastSalaryDay: 0 };
}

export function testCat(world: World, draft: Partial<CatDraft> = {}, extra: Partial<Cat> = {}): Cat {
  const full: CatDraft = {
    name: 'Teszt', species: 'tigris', sex: 'lany', age: 'felnott', diet: 'husevo', job: null,
    looks: defaultLooks('tigris', 'lany', 'felnott'), homeId: 'otthon1', ...draft,
  };
  const cat: Cat = { ...buildCat(`c${world.nextId++}`, full, 'utca', 500), ...extra };
  world.cats.push(cat);
  return cat;
}

/** Determinisztikus "véletlen": sorban adja vissza az értékeket. */
export const seq = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};
export const never = () => 0.999;
```

- [ ] **Step 2: Failing teszt – tests/cats.test.ts**

```ts
import { describe, expect, it } from 'vitest';
import { WORKSHOP } from '../src/data/buildings';
import { MAX_CATS } from '../src/sim/balance';
import { addCat, defaultLooks, findCat, say } from '../src/sim/cats';
import { randomName } from '../src/sim/names';
import { testCat, testWorld } from './helpers';

const draft = () => ({
  name: 'Mazsola', species: 'jaguar' as const, sex: 'lany' as const, age: 'felnott' as const,
  diet: 'vega' as const, job: null, looks: defaultLooks('jaguar', 'lany', 'felnott'), homeId: 'otthon1' as const,
});

describe('macskák', () => {
  it('a felnőtt és gyerek oroszlán fiúnak sörénye van, a babának és a lánynak nincs', () => {
    expect(defaultLooks('oroszlan', 'fiu', 'felnott').mane).toBe(true);
    expect(defaultLooks('oroszlan', 'fiu', 'gyerek').mane).toBe(true);
    expect(defaultLooks('oroszlan', 'fiu', 'baba').mane).toBe(false);
    expect(defaultLooks('oroszlan', 'lany', 'felnott').mane).toBe(false);
    expect(defaultLooks('tigris', 'fiu', 'felnott').mane).toBe(false);
  });

  it('az új macska a Macskaműhely elé érkezik', () => {
    const w = testWorld();
    const r = addCat(w, draft());
    expect(r.ok).toBe(true);
    expect(r.message).toContain('Mazsola');
    expect(w.cats[0].place).toBe('utca');
    expect(w.cats[0].x).toBe(WORKSHOP.doorX);
    expect(w.cats[0].id).toBe('c1');
    expect(w.nextId).toBe(2);
  });

  it('üres név helyett Cica lesz', () => {
    const w = testWorld();
    addCat(w, { ...draft(), name: '   ' });
    expect(w.cats[0].name).toBe('Cica');
  });

  it(`legfeljebb ${MAX_CATS} macska lakhat a városban`, () => {
    const w = testWorld();
    for (let i = 0; i < MAX_CATS; i++) addCat(w, draft());
    const r = addCat(w, draft());
    expect(r.ok).toBe(false);
    expect(w.cats).toHaveLength(MAX_CATS);
  });

  it('say buborékot tesz a macska fölé, findCat megtalálja', () => {
    const w = testWorld();
    const c = testCat(w);
    say(w, c, 'Szia!');
    expect(findCat(w, c.id)?.bubble).toBe('Szia!');
    expect(c.bubbleUntil).toBeGreaterThan(w.minute);
  });

  it('véletlen név nem üres', () => {
    expect(randomName('lany', () => 0)).toBeTruthy();
    expect(randomName('fiu', () => 0.99)).toBeTruthy();
  });
});
```

- [ ] **Step 3: Futtatás** – `npx vitest run tests/cats.test.ts` → FAIL

- [ ] **Step 4: src/sim/names.ts**

```ts
import type { Sex } from './types';

const GIRL = ['Mira', 'Luna', 'Csillag', 'Bogyó', 'Pötty', 'Málna', 'Szofi', 'Panna', 'Mazsola', 'Hópihe', 'Zsuzsi', 'Bella', 'Mogyi', 'Virág'];
const BOY = ['Bruno', 'Leó', 'Morzsa', 'Tappancs', 'Mogyoró', 'Bajusz', 'Bence', 'Pamacs', 'Zserbó', 'Csoki', 'Maci', 'Tomi', 'Kópé', 'Villám'];

export function randomName(sex: Sex, rng: () => number = Math.random): string {
  const list = sex === 'lany' ? GIRL : BOY;
  return list[Math.floor(rng() * list.length)];
}
```

- [ ] **Step 5: src/sim/cats.ts**

```ts
import { SPECIES } from '../data/species';
import { WORKSHOP } from '../data/buildings';
import { BUBBLE_MINUTES, MAX_CATS } from './balance';
import { fail, ok } from './result';
import type { ActionResult, AgeStage, Cat, Diet, HomeId, JobId, Looks, Place, Sex, SpeciesId, World } from './types';

export interface CatDraft {
  name: string;
  species: SpeciesId;
  sex: Sex;
  age: AgeStage;
  diet: Diet;
  job: JobId | null;
  looks: Looks;
  homeId: HomeId;
}

export function hasMane(species: SpeciesId, sex: Sex, age: AgeStage): boolean {
  return species === 'oroszlan' && sex === 'fiu' && age !== 'baba';
}

export function defaultLooks(species: SpeciesId, sex: Sex, age: AgeStage): Looks {
  return { ...SPECIES[species].looks, mane: hasMane(species, sex, age) };
}

export function buildCat(id: string, draft: CatDraft, place: Place, x: number): Cat {
  return {
    ...draft,
    id,
    name: draft.name.trim() || 'Cica',
    looks: { ...draft.looks },
    needs: { etel: 80, ital: 80, alvas: 80, jokedv: 80 },
    emptyMinutes: 0,
    sick: false,
    place,
    x,
    targetX: null,
    goal: null,
    activity: 'all',
    facing: 1,
    bubble: null,
    bubbleUntil: 0,
  };
}

export function findCat(world: World, id: string): Cat | undefined {
  return world.cats.find((c) => c.id === id);
}

export function say(world: World, cat: Cat, text: string): void {
  cat.bubble = text;
  cat.bubbleUntil = world.minute + BUBBLE_MINUTES;
}

export function addCat(world: World, draft: CatDraft): ActionResult {
  if (world.cats.length >= MAX_CATS) {
    return fail(`Megtelt a város! Legfeljebb ${MAX_CATS} macska lakhat itt.`);
  }
  const cat = buildCat(`c${world.nextId++}`, draft, 'utca', WORKSHOP.doorX);
  world.cats.push(cat);
  say(world, cat, 'Szia! 👋');
  return ok(`Megérkezett: ${cat.name}! 🎉`);
}
```

- [ ] **Step 6: Futtatás** – `npx vitest run tests/cats.test.ts` → PASS

- [ ] **Step 7: Commit** – `git add -A && git commit -m "feat(sim): macskák létrehozása és nevek"`

---

### Task 5: Igény-csíkok és étrend

**Files:**
- Create: `src/sim/needs.ts`, `src/sim/diet.ts`
- Test: `tests/needs.test.ts`, `tests/diet.test.ts`

- [ ] **Step 1: Failing tesztek**

`tests/needs.test.ts`:
```ts
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
```

`tests/diet.test.ts`:
```ts
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
```

- [ ] **Step 2: Futtatás** – `npx vitest run tests/needs.test.ts tests/diet.test.ts` → FAIL

- [ ] **Step 3: src/sim/needs.ts**

```ts
import { DECAY_PER_MIN, SLEEP_RESTORE_PER_MIN } from './balance';
import type { Cat, NeedKey } from './types';

export const NEED_KEYS: NeedKey[] = ['etel', 'ital', 'alvas', 'jokedv'];

export function clampNeed(v: number): number {
  return Math.max(0, Math.min(100, v));
}

export function addNeed(cat: Cat, key: NeedKey, amount: number): void {
  cat.needs[key] = clampNeed(cat.needs[key] + amount);
}

export function decayNeeds(cat: Cat, minutes: number): void {
  addNeed(cat, 'etel', -DECAY_PER_MIN.etel * minutes);
  addNeed(cat, 'ital', -DECAY_PER_MIN.ital * minutes);
  addNeed(cat, 'jokedv', -DECAY_PER_MIN.jokedv * minutes);
  addNeed(cat, 'alvas', cat.activity === 'alszik' ? SLEEP_RESTORE_PER_MIN * minutes : -DECAY_PER_MIN.alvas * minutes);
}

export function anyNeedEmpty(cat: Cat): boolean {
  return NEED_KEYS.some((k) => cat.needs[k] <= 0);
}
```

- [ ] **Step 4: src/sim/diet.ts**

```ts
import type { Diet, FoodKind } from './types';

export function canEat(diet: Diet, kind: FoodKind): boolean {
  return kind === 'mindenki' || kind === diet;
}

export function refusal(diet: Diet): string {
  return diet === 'vega' ? 'Köszi, de én vega vagyok! 🥕' : 'Köszi, de én húsevő vagyok! 🍖';
}
```

- [ ] **Step 5: Futtatás** – PASS

- [ ] **Step 6: Commit** – `git add -A && git commit -m "feat(sim): igény-csíkok és vega/húsevő szabály"`

---

### Task 6: Pénz és munkások

**Files:**
- Create: `src/sim/economy.ts`
- Test: `tests/economy.test.ts`

- [ ] **Step 1: Failing teszt**

```ts
import { describe, expect, it } from 'vitest';
import { SALARY } from '../src/sim/balance';
import { hasWorker, paySalaries, spend } from '../src/sim/economy';
import { testCat, testWorld } from './helpers';

describe('pénz', () => {
  it('fizetés csökkenti a pénzt', () => {
    const w = testWorld();
    w.coins = 10;
    expect(spend(w, 4).ok).toBe(true);
    expect(w.coins).toBe(6);
  });
  it('mínuszba nem megy, megmondja mennyi hiányzik', () => {
    const w = testWorld();
    w.coins = 3;
    const r = spend(w, 4);
    expect(r.ok).toBe(false);
    expect(r.message).toBe('Még 1 🐾 kell!');
    expect(w.coins).toBe(3);
  });
  it('munkás csak felnőtt lehet', () => {
    const w = testWorld();
    testCat(w, { job: 'orvos', age: 'gyerek' });
    expect(hasWorker(w, 'orvos')).toBe(false);
    testCat(w, { job: 'orvos' });
    expect(hasWorker(w, 'orvos')).toBe(true);
  });
  it('a beteg munkás nem kap fizetést', () => {
    const w = testWorld();
    w.coins = 0;
    testCat(w, { job: 'orvos' });
    testCat(w, { job: 'elado' }, { sick: true });
    testCat(w);
    expect(paySalaries(w)).toBe(SALARY);
    expect(w.coins).toBe(SALARY);
  });
});
```

- [ ] **Step 2: Futtatás** – FAIL

- [ ] **Step 3: src/sim/economy.ts**

```ts
import { SALARY } from './balance';
import { fail, ok } from './result';
import type { ActionResult, JobId, World } from './types';

export function spend(world: World, price: number): ActionResult {
  if (world.coins < price) return fail(`Még ${price - world.coins} 🐾 kell!`);
  world.coins -= price;
  return ok();
}

export function earn(world: World, amount: number): void {
  world.coins += amount;
}

export function hasWorker(world: World, job: JobId): boolean {
  return world.cats.some((c) => c.job === job && c.age === 'felnott');
}

export function paySalaries(world: World): number {
  const workers = world.cats.filter((c) => c.job !== null && c.age === 'felnott' && !c.sick).length;
  const amount = workers * SALARY;
  earn(world, amount);
  return amount;
}
```

- [ ] **Step 4: Futtatás** – PASS
- [ ] **Step 5: Commit** – `git add -A && git commit -m "feat(sim): pénz, munkások, fizetés"`

---

### Task 7: Betegség

**Files:**
- Create: `src/sim/health.ts`
- Test: `tests/health.test.ts`

- [ ] **Step 1: Failing teszt**

```ts
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
```

- [ ] **Step 2: Futtatás** – FAIL

- [ ] **Step 3: src/sim/health.ts**

```ts
import { SICK_AFTER_EMPTY_MIN } from './balance';
import { say } from './cats';
import { anyNeedEmpty, NEED_KEYS } from './needs';
import type { Cat, World } from './types';

/** Frissíti az üres-csík számlálókat. Ha valaki most lett beteg, visszaadja. */
export function updateHealth(world: World, minutes: number): Cat | null {
  for (const cat of world.cats) {
    cat.emptyMinutes = anyNeedEmpty(cat) ? cat.emptyMinutes + minutes : 0;
  }
  if (world.cats.some((c) => c.sick)) return null;
  const patient = world.cats.find((c) => c.emptyMinutes >= SICK_AFTER_EMPTY_MIN);
  if (!patient) return null;
  patient.sick = true;
  say(world, patient, 'Rosszul vagyok… vigyél a kórházba! 🤒');
  return patient;
}

export function heal(cat: Cat): void {
  cat.sick = false;
  cat.emptyMinutes = 0;
  for (const k of NEED_KEYS) cat.needs[k] = Math.max(cat.needs[k], 30);
}
```

- [ ] **Step 4: Futtatás** – PASS
- [ ] **Step 5: Commit** – `git add -A && git commit -m "feat(sim): betegség (egyszerre max 1)"`

---

### Task 8: Játékos-akciók

**Files:**
- Create: `src/sim/actions.ts`
- Test: `tests/actions.test.ts`

- [ ] **Step 1: Failing teszt**

```ts
import { describe, expect, it } from 'vitest';
import { HOME_BED_X } from '../src/data/buildings';
import { HEAL_COST, PET_JOY, PLAY_JOY, WATER_DRINK } from '../src/sim/balance';
import {
  buyFood, drinkWater, feedFromPantry, healCat, moveCat, orderMeal, petCat, playBall, putToBed, togglePause,
} from '../src/sim/actions';
import { testCat, testWorld } from './helpers';

describe('etetés a hűtőből', () => {
  it('a vega macska nem eszi meg a halat, és a hal megmarad', () => {
    const w = testWorld();
    const c = testCat(w, { diet: 'vega' });
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
    const c = testCat(w, { diet: 'vega' });
    c.needs.etel = 10;
    w.pantry.repa = 2;
    expect(feedFromPantry(w, c.id, 'repa').ok).toBe(true);
    expect(w.pantry.repa).toBe(1);
    expect(c.needs.etel).toBe(40);
  });
  it('a húsevő a répát nem, a kenyeret megeszi', () => {
    const w = testWorld();
    const c = testCat(w, { diet: 'husevo' });
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
    const c = testCat(w);
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
    const c = testCat(w, { diet: 'vega' });
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
    expect(c.x).toBe(HOME_BED_X);
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
```

- [ ] **Step 2: Futtatás** – `npx vitest run tests/actions.test.ts` → FAIL

- [ ] **Step 3: src/sim/actions.ts**

```ts
import { HOME_BED_X, isHome } from '../data/buildings';
import { FOODS, MEALS } from '../data/foods';
import { HEAL_COST, PET_JOY, PLAY_JOY, WATER_DRINK } from './balance';
import { findCat, say } from './cats';
import { canEat, refusal } from './diet';
import { hasWorker, spend } from './economy';
import { heal } from './health';
import { addNeed } from './needs';
import { fail, ok } from './result';
import type { ActionResult, BuildingId, Cat, Edible, FoodId, MealId, Place, World } from './types';

function applyEdible(cat: Cat, e: Edible): void {
  addNeed(cat, 'etel', e.etel);
  addNeed(cat, 'ital', e.ital);
  addNeed(cat, 'jokedv', e.jokedv);
}

export function feedFromPantry(world: World, catId: string, foodId: FoodId): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  const food = FOODS[foodId];
  if ((world.pantry[foodId] ?? 0) <= 0) return fail(`Nincs több ${food.emoji} a hűtőben! Vegyél a boltban. 🛒`);
  if (cat.activity === 'alszik') return fail('Psszt, alszik! 😴');
  if (!canEat(cat.diet, food.kind)) {
    const msg = refusal(cat.diet);
    say(world, cat, msg);
    return fail(msg);
  }
  world.pantry[foodId] = (world.pantry[foodId] ?? 0) - 1;
  applyEdible(cat, food);
  say(world, cat, 'Nyamm! 😋');
  return ok();
}

export function drinkWater(world: World, catId: string): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  if (cat.activity === 'alszik') return fail('Psszt, alszik! 😴');
  addNeed(cat, 'ital', WATER_DRINK);
  say(world, cat, 'Glu-glu! 💧');
  return ok();
}

export function buyFood(world: World, foodId: FoodId): ActionResult {
  if (!hasWorker(world, 'elado')) return fail('Nincs eladó a boltban! Építs egyet a Macskaműhelyben. 🛒');
  const food = FOODS[foodId];
  const paid = spend(world, food.price);
  if (!paid.ok) return paid;
  world.pantry[foodId] = (world.pantry[foodId] ?? 0) + 1;
  return ok(`Megvetted: ${food.emoji} ${food.name}`);
}

export function orderMeal(world: World, catId: string, mealId: MealId): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  if (!hasWorker(world, 'szakacs')) return fail('Nincs szakács az étteremben! Építs egyet a Macskaműhelyben. 👩‍🍳');
  if (cat.activity === 'alszik') return fail('Psszt, alszik! 😴');
  const meal = MEALS[mealId];
  if (!canEat(cat.diet, meal.kind)) {
    const msg = refusal(cat.diet);
    say(world, cat, msg);
    return fail(msg);
  }
  const paid = spend(world, meal.price);
  if (!paid.ok) return paid;
  applyEdible(cat, meal);
  say(world, cat, 'Fincsi! 😋');
  return ok();
}

export function petCat(world: World, catId: string): ActionResult {
  const cat = findCat(world, catId);
  if (!cat || cat.activity === 'alszik') return ok();
  addNeed(cat, 'jokedv', PET_JOY);
  if (!cat.bubble) say(world, cat, '💕');
  return ok();
}

export function playBall(world: World, place: BuildingId): ActionResult {
  const players = world.cats.filter((c) => c.place === place && c.activity !== 'alszik');
  if (players.length === 0) return fail('Nincs itt senki, aki játszana! ⚽');
  for (const c of players) {
    addNeed(c, 'jokedv', PLAY_JOY);
    say(world, c, 'Hurrá! ⚽');
  }
  return ok();
}

export function healCat(world: World, catId: string): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  if (!cat.sick) return fail(`${cat.name} nem beteg. 😊`);
  if (cat.place !== 'korhaz') return fail('Előbb vidd a kórházba! 🏥');
  if (!hasWorker(world, 'orvos')) return fail('Nincs orvos! Építs egy orvost a Macskaműhelyben. 🩺');
  const paid = spend(world, HEAL_COST);
  if (!paid.ok) return paid;
  heal(cat);
  say(world, cat, 'Meggyógyultam! 🎉');
  return ok(`${cat.name} meggyógyult! 🎉`);
}

export function moveCat(world: World, catId: string, place: Place, x: number): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  cat.place = place;
  cat.x = x;
  cat.targetX = null;
  cat.goal = null;
  cat.activity = 'all';
  return ok();
}

export function putToBed(world: World, catId: string): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  if (!isHome(cat.place)) return fail('Ágy csak otthon van! 🛏️');
  cat.x = HOME_BED_X;
  cat.targetX = null;
  cat.goal = null;
  cat.activity = 'alszik';
  return ok();
}

export function togglePause(world: World): ActionResult {
  world.paused = !world.paused;
  return ok(world.paused ? 'Szünet ⏸️' : 'Indulás! ▶️');
}
```

- [ ] **Step 4: Futtatás** – PASS
- [ ] **Step 5: Commit** – `git add -A && git commit -m "feat(sim): etetés, bolt, étterem, kórház, mozgatás, alvás, játék"`

---

### Task 9: A macskák „agya”

**Files:**
- Create: `src/sim/ai.ts`
- Test: `tests/ai.test.ts`

Szabályok:
- Éjjel (21–6) vagy ha az alvás-csík 15 alatt van: hazamegy (kilép az épületből, elsétál a háza ajtajához, bemegy, odasétál az ágyhoz) és lefekszik.
- Alvó macska nappal csak akkor kel fel, ha teljesen kipihente magát (alvás = 100); éjjel nem kel fel.
- Beteg macska nem kószál, áll és néha szól.
- Egyébként kószál: néha új célpontot választ a helyén belül; az utcán néha elindul egy épületbe; épületben néha kimegy az utcára.
- Ha éhes/szomjas/unatkozik/beteg és nincs buborékja, néha szól.

- [ ] **Step 1: Failing teszt**

```ts
import { describe, expect, it } from 'vitest';
import { BUILDINGS, HOME_BED_X } from '../src/data/buildings';
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
    updateCatAi(w, c, 1, never);
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
    expect(c.targetX).toBe(1500);
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
```

- [ ] **Step 2: Futtatás** – FAIL

- [ ] **Step 3: src/sim/ai.ts**

```ts
import { BUILDING_IDS, BUILDINGS, HOME_BED_X, ROOM_DOOR_X, ROOM_WIDTH, STREET_WIDTH } from '../data/buildings';
import { WALK_SPEED } from './balance';
import { say } from './cats';
import { isNight } from './time';
import type { BuildingId, Cat, World } from './types';

export type Rng = () => number;

export function walkTowards(cat: Cat, targetX: number, minutes: number): boolean {
  const step = WALK_SPEED * (cat.age === 'baba' ? 0.6 : 1) * minutes;
  const dx = targetX - cat.x;
  if (Math.abs(dx) <= step) {
    cat.x = targetX;
    return true;
  }
  cat.facing = dx > 0 ? 1 : -1;
  cat.x += cat.facing * step;
  cat.activity = 'setal';
  return false;
}

function leaveBuilding(cat: Cat): void {
  if (cat.place === 'utca') return;
  cat.x = BUILDINGS[cat.place].doorX;
  cat.place = 'utca';
  cat.targetX = null;
}

function enterBuilding(cat: Cat, id: BuildingId, x: number): void {
  cat.place = id;
  cat.x = x;
  cat.targetX = null;
  cat.goal = null;
  cat.activity = 'all';
}

function goHomeToSleep(cat: Cat, minutes: number): void {
  cat.goal = null;
  if (cat.place === cat.homeId) {
    if (walkTowards(cat, HOME_BED_X, minutes)) {
      cat.activity = 'alszik';
      cat.targetX = null;
    }
    return;
  }
  leaveBuilding(cat);
  if (walkTowards(cat, BUILDINGS[cat.homeId].doorX, minutes)) enterBuilding(cat, cat.homeId, ROOM_DOOR_X);
}

function complaint(cat: Cat): string | null {
  if (cat.sick) return 'Rosszul vagyok… vigyél a kórházba! 🤒';
  if (cat.needs.ital < 20) return 'Szomjas vagyok! 💧';
  if (cat.needs.etel < 20) return 'Éhes vagyok! 🍽️';
  if (cat.needs.jokedv < 20) return 'Unatkozom… 🥺';
  return null;
}

function maybeComplain(world: World, cat: Cat, minutes: number, rng: Rng): void {
  if (cat.bubble) return;
  const text = complaint(cat);
  if (text && rng() < 0.01 * minutes) say(world, cat, text);
}

function wander(cat: Cat, minutes: number, rng: Rng): void {
  if (cat.targetX !== null) {
    if (walkTowards(cat, cat.targetX, minutes)) {
      cat.targetX = null;
      cat.activity = 'all';
      if (cat.goal) enterBuilding(cat, cat.goal, ROOM_DOOR_X + 60 + rng() * 300);
    }
    return;
  }
  cat.activity = 'all';
  if (cat.place !== 'utca') {
    if (rng() < 0.004 * minutes) {
      leaveBuilding(cat);
      return;
    }
  } else if (rng() < 0.003 * minutes) {
    const goal = BUILDING_IDS[Math.floor(rng() * BUILDING_IDS.length)];
    cat.goal = goal;
    cat.targetX = BUILDINGS[goal].doorX;
    return;
  }
  if (rng() < 0.03 * minutes) {
    const width = cat.place === 'utca' ? STREET_WIDTH : ROOM_WIDTH;
    cat.targetX = 80 + rng() * (width - 160);
  }
}

export function updateCatAi(world: World, cat: Cat, minutes: number, rng: Rng): void {
  const night = isNight(world.minute);
  if (cat.activity === 'alszik') {
    if (night || cat.needs.alvas < 100) return;
    cat.activity = 'all';
    say(world, cat, 'Kipihentem magam! ☀️');
  }
  if (night || cat.needs.alvas < 15) {
    goHomeToSleep(cat, minutes);
    return;
  }
  maybeComplain(world, cat, minutes, rng);
  if (cat.sick) {
    cat.targetX = null;
    cat.goal = null;
    cat.activity = 'all';
    return;
  }
  wander(cat, minutes, rng);
}
```

Megjegyzés a „szomjas” teszthez: `rng = () => 0` esetén a szólás után a `wander` épületbe indul – ez nem baj, a teszt csak a buborékot nézi.

- [ ] **Step 4: Futtatás** – PASS
- [ ] **Step 5: Commit** – `git add -A && git commit -m "feat(sim): macskák magától élnek (séta, alvás, szólás)"`

---

### Task 10: Világ – kezdőállapot és léptetés

**Files:**
- Create: `src/sim/world.ts`
- Test: `tests/world.test.ts`

- [ ] **Step 1: Failing teszt**

```ts
import { describe, expect, it } from 'vitest';
import { SALARY, START_COINS } from '../src/sim/balance';
import { hasWorker } from '../src/sim/economy';
import { createInitialWorld, tickWorld } from '../src/sim/world';
import { never, testCat, testWorld } from './helpers';

describe('világ', () => {
  it('a kezdő városban van család, orvos, szakács, eladó, vega és húsevő', () => {
    const w = createInitialWorld();
    expect(w.cats).toHaveLength(5);
    expect(w.coins).toBe(START_COINS);
    expect(hasWorker(w, 'orvos')).toBe(true);
    expect(hasWorker(w, 'szakacs')).toBe(true);
    expect(hasWorker(w, 'elado')).toBe(true);
    expect(w.cats.some((c) => c.diet === 'vega')).toBe(true);
    expect(w.cats.some((c) => c.diet === 'husevo')).toBe(true);
    expect(new Set(w.cats.map((c) => c.id)).size).toBe(5);
  });

  it('szünetben nem telik az idő', () => {
    const w = createInitialWorld();
    w.paused = true;
    const before = w.minute;
    tickWorld(w, 100, never);
    expect(w.minute).toBe(before);
  });

  it('telik az idő és fogynak az igények', () => {
    const w = testWorld();
    const c = testCat(w);
    tickWorld(w, 60, never);
    expect(w.minute).toBe(8 * 60 + 60);
    expect(c.needs.etel).toBeLessThan(80);
  });

  it('este 6-kor egyszer jár fizetés', () => {
    const w = createInitialWorld();
    w.minute = 17 * 60 + 59;
    const before = w.coins;
    const events = tickWorld(w, 2, never);
    expect(w.coins).toBe(before + 3 * SALARY);
    expect(events[0]).toContain('Fizetés');
    tickWorld(w, 10, never);
    expect(w.coins).toBe(before + 3 * SALARY);
  });

  it('a kézben tartott macskát nem mozgatja', () => {
    const w = testWorld();
    w.minute = 22 * 60;
    const c = testCat(w, {}, { place: 'utca', x: 2000 });
    tickWorld(w, 5, never, c.id);
    expect(c.x).toBe(2000);
  });

  it('a lejárt buborék eltűnik', () => {
    const w = testWorld();
    const c = testCat(w, {}, { bubble: 'Szia', bubbleUntil: w.minute + 5 });
    tickWorld(w, 10, never);
    expect(c.bubble).toBeNull();
  });

  it('új beteg esetén szól', () => {
    const w = testWorld();
    const c = testCat(w);
    c.needs.ital = 0;
    c.emptyMinutes = 719;
    const events = tickWorld(w, 2, never);
    expect(c.sick).toBe(true);
    expect(events.some((e) => e.includes('beteg'))).toBe(true);
  });
});
```

- [ ] **Step 2: Futtatás** – FAIL

- [ ] **Step 3: src/sim/world.ts**

```ts
import { SALARY_HOUR, START_COINS, START_MINUTE, WORLD_VERSION } from './balance';
import { updateCatAi, type Rng } from './ai';
import { buildCat, defaultLooks, type CatDraft } from './cats';
import { paySalaries } from './economy';
import { updateHealth } from './health';
import { decayNeeds } from './needs';
import { dayOf, hourOf } from './time';
import type { World } from './types';

type Starter = Omit<CatDraft, 'looks'> & { x: number };

const STARTERS: Starter[] = [
  { name: 'Mira', species: 'jaguar', sex: 'lany', age: 'felnott', diet: 'vega', job: 'orvos', homeId: 'otthon1', x: 320 },
  { name: 'Pötty', species: 'jaguar', sex: 'lany', age: 'gyerek', diet: 'vega', job: null, homeId: 'otthon1', x: 420 },
  { name: 'Bruno', species: 'tigris', sex: 'fiu', age: 'felnott', diet: 'husevo', job: 'szakacs', homeId: 'otthon2', x: 1300 },
  { name: 'Leó', species: 'oroszlan', sex: 'fiu', age: 'felnott', diet: 'husevo', job: 'elado', homeId: 'otthon2', x: 800 },
  { name: 'Hópihe', species: 'hoparduc', sex: 'lany', age: 'gyerek', diet: 'husevo', job: null, homeId: 'otthon2', x: 2350 },
];

export function createInitialWorld(): World {
  const world: World = {
    version: WORLD_VERSION,
    minute: START_MINUTE,
    coins: START_COINS,
    paused: false,
    pantry: { repa: 2, alma: 1, hal: 2, kenyer: 2, tej: 2 },
    cats: [],
    nextId: 1,
    lastSalaryDay: 0,
  };
  for (const { x, ...draft } of STARTERS) {
    const looks = defaultLooks(draft.species, draft.sex, draft.age);
    world.cats.push(buildCat(`c${world.nextId++}`, { ...draft, looks }, 'utca', x));
  }
  return world;
}

/** Lépteti a világot. Visszaadja a játékosnak szóló üzeneteket. */
export function tickWorld(world: World, minutes: number, rng: Rng, heldCatId: string | null = null): string[] {
  const events: string[] = [];
  if (world.paused || minutes <= 0) return events;

  world.minute += minutes;
  for (const cat of world.cats) decayNeeds(cat, minutes);

  const patient = updateHealth(world, minutes);
  if (patient) events.push(`${patient.name} beteg lett! Vidd a kórházba. 🏥`);

  const day = dayOf(world.minute);
  if (hourOf(world.minute) >= SALARY_HOUR && world.lastSalaryDay < day) {
    world.lastSalaryDay = day;
    const paid = paySalaries(world);
    if (paid > 0) events.push(`Fizetés! +${paid} 🐾`);
  }

  for (const cat of world.cats) {
    if (cat.id !== heldCatId) updateCatAi(world, cat, minutes, rng);
    if (cat.bubble && world.minute >= cat.bubbleUntil) cat.bubble = null;
  }
  return events;
}
```

- [ ] **Step 4: Futtatás** – `npm test` → minden PASS
- [ ] **Step 5: Commit** – `git add -A && git commit -m "feat(sim): kezdő város és világ-léptetés"`

---

### Task 11: Mentés

**Files:**
- Create: `src/store/serialize.ts`, `src/store/save.ts`
- Test: `tests/serialize.test.ts`

- [ ] **Step 1: Failing teszt**

```ts
import { describe, expect, it } from 'vitest';
import { createInitialWorld } from '../src/sim/world';
import { deserialize, serialize } from '../src/store/serialize';

describe('mentés', () => {
  it('oda-vissza ugyanaz', () => {
    const w = createInitialWorld();
    w.coins = 77;
    expect(deserialize(serialize(w))).toEqual(w);
  });
  it('rossz verziót nem tölt be', () => {
    const w = createInitialWorld();
    w.version = 999;
    expect(deserialize(serialize(w))).toBeNull();
  });
  it('hibás szöveget nem tölt be', () => {
    expect(deserialize('nem json')).toBeNull();
    expect(deserialize('{"version":1}')).toBeNull();
  });
});
```

- [ ] **Step 2: Futtatás** – FAIL

- [ ] **Step 3: src/store/serialize.ts**

```ts
import { WORLD_VERSION } from '../sim/balance';
import type { World } from '../sim/types';

export function serialize(world: World): string {
  return JSON.stringify(world);
}

export function deserialize(text: string): World | null {
  try {
    const data = JSON.parse(text) as Partial<World>;
    if (data.version !== WORLD_VERSION || !Array.isArray(data.cats) || typeof data.minute !== 'number') return null;
    return data as World;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: src/store/save.ts**

```ts
import { get, set } from 'idb-keyval';
import type { World } from '../sim/types';
import { deserialize, serialize } from './serialize';

const KEY = 'nagymacskacitiy-save';

export async function loadWorld(): Promise<World | null> {
  const text = await get<string>(KEY);
  return text ? deserialize(text) : null;
}

export async function saveWorld(world: World): Promise<void> {
  await set(KEY, serialize(world));
}
```

- [ ] **Step 5: Futtatás** – PASS, `npm run typecheck` – nincs hiba
- [ ] **Step 6: Commit** – `git add -A && git commit -m "feat: mentés IndexedDB-be"`

---

### Task 12: Store és játékhurok

**Files:**
- Create: `src/store/store.ts`, `src/store/hooks.ts`

- [ ] **Step 1: src/store/store.ts**

```ts
import { create } from 'zustand';
import { tickWorld } from '../sim/world';
import { realSecondsToGameMinutes } from '../sim/time';
import type { ActionResult, BuildingId, World } from '../sim/types';

export type Screen = { kind: 'city' } | { kind: 'inside'; building: BuildingId } | { kind: 'creator' };

interface GameStore {
  world: World | null;
  screen: Screen;
  selectedCatId: string | null;
  heldCatId: string | null;
  focusCatId: string | null;
  toast: { text: string; id: number } | null;
  setWorld: (world: World) => void;
  setScreen: (screen: Screen) => void;
  select: (id: string | null) => void;
  hold: (id: string | null) => void;
  focus: (id: string | null) => void;
  showToast: (text: string) => void;
  /** Klónozza a világot, lefuttatja rajta az akciót, és ha van üzenet, kiírja. */
  act: (fn: (w: World) => ActionResult | void) => ActionResult | undefined;
  step: (realSeconds: number) => void;
}

let toastId = 0;

export const useGame = create<GameStore>((set, get) => ({
  world: null,
  screen: { kind: 'city' },
  selectedCatId: null,
  heldCatId: null,
  focusCatId: null,
  toast: null,
  setWorld: (world) => set({ world }),
  setScreen: (screen) => set({ screen }),
  select: (selectedCatId) => set({ selectedCatId }),
  hold: (heldCatId) => set({ heldCatId }),
  focus: (focusCatId) => set({ focusCatId }),
  showToast: (text) => set({ toast: { text, id: ++toastId } }),
  act: (fn) => {
    const current = get().world;
    if (!current) return undefined;
    const draft = structuredClone(current);
    const result = fn(draft) as ActionResult | undefined;
    set({ world: draft });
    if (result?.message) get().showToast(result.message);
    return result;
  },
  step: (realSeconds) => {
    const { world, heldCatId } = get();
    if (!world || world.paused) return;
    const draft = structuredClone(world);
    const events = tickWorld(draft, realSecondsToGameMinutes(realSeconds), Math.random, heldCatId);
    set({ world: draft });
    for (const e of events) get().showToast(e);
  },
}));
```

- [ ] **Step 2: src/store/hooks.ts**

```ts
import { useEffect } from 'react';
import { saveWorld } from './save';
import { useGame } from './store';

const TICK_MS = 250;

/** 250 ms-onként lépteti a világot. Ha a lap háttérben volt, max 1 mp-et lép (az idő csak játék közben telik). */
export function useGameLoop(): void {
  useEffect(() => {
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 1);
      last = now;
      useGame.getState().step(dt);
    }, TICK_MS);
    return () => clearInterval(timer);
  }, []);
}

export function useAutosave(): void {
  useEffect(() => {
    const save = () => {
      const w = useGame.getState().world;
      if (w) void saveWorld(w);
    };
    const timer = setInterval(save, 3000);
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') save();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', save);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', save);
    };
  }, []);
}
```

- [ ] **Step 3: Ellenőrzés** – `npm run typecheck` → nincs hiba
- [ ] **Step 4: Commit** – `git add -A && git commit -m "feat: Zustand store, játékhurok, automatikus mentés"`

---

### Task 13: A macska rajza

**Files:**
- Create: `src/art/color.ts`, `src/art/CatFigure.tsx`, `src/art/CatFace.tsx`
- Test: `tests/color.test.ts`

- [ ] **Step 1: Failing teszt – tests/color.test.ts**

```ts
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
```

- [ ] **Step 2: Futtatás** – FAIL

- [ ] **Step 3: src/art/color.ts**

```ts
/** amount: -1 (fekete) … 0 (változatlan) … 1 (fehér) */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const target = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  const mix = (v: number) => Math.round((target - v) * p + v);
  const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(mix);
  return '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');
}
```

- [ ] **Step 4: Futtatás** – PASS

- [ ] **Step 5: src/art/CatFigure.tsx**

Koordináták: a talp a (0,0) pontban, a fej teteje kb. y = −170 (felnőttnél). A kor szerinti méretet az `AGE_SCALE` adja.

```tsx
import { useId } from 'react';
import type { Activity, AgeStage, EarKind, Looks, PatternKind } from '../sim/types';
import { shade } from './color';

export const AGE_SCALE: Record<AgeStage, number> = { baba: 0.55, gyerek: 0.75, felnott: 1 };

const BODY_SPOTS: Array<[number, number]> = [[-12, -78], [10, -70], [-6, -58], [14, -50], [-14, -46], [4, -86]];
const HEAD_SPOTS: Array<[number, number]> = [[-22, -138], [20, -136], [-8, -148], [10, -150], [-27, -120], [27, -118]];

function PatternMarks({ kind, color, area }: { kind: PatternKind; color: string; area: 'body' | 'head' }) {
  if (kind === 'nincs') return null;
  if (kind === 'csikos') {
    const paths = area === 'head'
      ? ['M -10 -156 Q -6 -146 -10 -138', 'M 0 -158 Q 4 -148 0 -140', 'M 10 -156 Q 14 -146 10 -138', 'M -38 -128 Q -28 -126 -22 -130', 'M 38 -128 Q 28 -126 22 -130']
      : ['M -26 -80 Q -12 -76 -6 -82', 'M 26 -80 Q 12 -76 6 -82', 'M -26 -64 Q -12 -60 -6 -66', 'M 26 -64 Q 12 -60 6 -66', 'M -26 -48 Q -14 -44 -8 -50', 'M 26 -48 Q 14 -44 8 -50'];
    return (
      <g stroke={color} strokeWidth={4} strokeLinecap="round" fill="none">
        {paths.map((d) => <path key={d} d={d} />)}
      </g>
    );
  }
  const spots = area === 'head' ? HEAD_SPOTS : BODY_SPOTS;
  if (kind === 'pottyos') {
    return <g fill={color}>{spots.map(([x, y]) => <circle key={`${x},${y}`} cx={x} cy={y} r={2.8} />)}</g>;
  }
  if (kind === 'rozettas') {
    return (
      <g stroke={color} strokeWidth={2.2} fill={color} fillOpacity={0.18}>
        {spots.map(([x, y]) => <circle key={`${x},${y}`} cx={x} cy={y} r={4.5} />)}
      </g>
    );
  }
  return (
    <g stroke={color} strokeWidth={2.5} fill={color} fillOpacity={0.25}>
      {spots.slice(0, 4).map(([x, y]) => <ellipse key={`${x},${y}`} cx={x} cy={y} rx={8} ry={5} transform={`rotate(25 ${x} ${y})`} />)}
    </g>
  );
}

function Ears({ kind, fur }: { kind: EarKind; fur: string }) {
  const inner = '#F6C1CC';
  if (kind === 'kerek') {
    return (
      <g>
        {[-1, 1].map((s) => (
          <g key={s}>
            <circle cx={26 * s} cy={-150} r={13} fill={fur} />
            <circle cx={26 * s} cy={-150} r={7} fill={inner} />
          </g>
        ))}
      </g>
    );
  }
  const tall = kind === 'nagy' ? 30 : 20;
  const w = kind === 'nagy' ? 15 : 13;
  return (
    <g>
      {[-1, 1].map((s) => {
        const bx = 24 * s;
        const by = -144;
        const tx = bx + 4 * s;
        const ty = by - tall - 10;
        return (
          <g key={s}>
            <polygon points={`${bx - w},${by} ${tx},${ty} ${bx + w},${by}`} fill={fur} stroke={fur} strokeWidth={6} strokeLinejoin="round" />
            <polygon points={`${bx - w * 0.5},${by - 2} ${tx},${ty + 10} ${bx + w * 0.5},${by - 2}`} fill={inner} />
            {kind === 'pamacsos' && <path d={`M ${tx} ${ty} l ${2 * s} -12`} stroke="#222" strokeWidth={3} strokeLinecap="round" />}
          </g>
        );
      })}
    </g>
  );
}

interface Props {
  looks: Looks;
  age: AgeStage;
  activity: Activity;
  sick: boolean;
  facing: 1 | -1;
}

export function CatFigure({ looks, age, activity, sick, facing }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const { fur, belly, pattern, patternColor, eyes } = looks;
  const outline = shade(fur, -0.35);
  const sleeping = activity === 'alszik';
  return (
    <g transform={`scale(${AGE_SCALE[age]})`}>
      <g transform={`scale(${facing} 1)`} className={`cat${activity === 'setal' ? ' walking' : ''}`}>
        <defs>
          <clipPath id={`b${uid}`}><rect x={-24} y={-92} width={48} height={58} rx={22} /></clipPath>
          <clipPath id={`h${uid}`}><ellipse cx={0} cy={-124} rx={38} ry={34} /></clipPath>
        </defs>
        <ellipse cx={0} cy={2} rx={30} ry={6} fill="rgba(0,0,0,0.15)" />
        <path className="tail" d="M 16 -50 Q 52 -48 48 -86 Q 46 -100 56 -104" stroke={fur} strokeWidth={9} fill="none" strokeLinecap="round" />
        <rect className="leg leg-l" x={-18} y={-40} width={15} height={40} rx={7} fill={fur} stroke={outline} strokeWidth={1.5} />
        <rect className="leg leg-r" x={3} y={-40} width={15} height={40} rx={7} fill={fur} stroke={outline} strokeWidth={1.5} />
        <rect x={-24} y={-92} width={48} height={58} rx={22} fill={fur} stroke={outline} strokeWidth={1.5} />
        <g clipPath={`url(#b${uid})`}>
          <ellipse cx={0} cy={-58} rx={14} ry={22} fill={belly} />
          <PatternMarks kind={pattern} color={patternColor} area="body" />
        </g>
        <rect className="arm arm-l" x={-33} y={-88} width={12} height={36} rx={6} fill={fur} stroke={outline} strokeWidth={1.5} />
        <rect className="arm arm-r" x={21} y={-88} width={12} height={36} rx={6} fill={fur} stroke={outline} strokeWidth={1.5} />
        {looks.mane && <circle cx={0} cy={-122} r={48} fill={shade(fur, -0.3)} />}
        <Ears kind={looks.ears} fur={fur} />
        <ellipse cx={0} cy={-124} rx={38} ry={34} fill={fur} stroke={outline} strokeWidth={1.5} />
        <g clipPath={`url(#h${uid})`}><PatternMarks kind={pattern} color={patternColor} area="head" /></g>
        <ellipse cx={0} cy={-108} rx={19} ry={13} fill={belly} />
        {sleeping ? (
          <g stroke="#3b2a20" strokeWidth={3} fill="none" strokeLinecap="round">
            <path d="M -21 -126 Q -14 -120 -7 -126" />
            <path d="M 7 -126 Q 14 -120 21 -126" />
          </g>
        ) : (
          <g className="eyes">
            {[-14, 14].map((x) => (
              <g key={x}>
                <ellipse cx={x} cy={-127} rx={9} ry={11} fill="#fff" />
                <circle cx={x} cy={-126} r={7} fill={eyes} />
                <ellipse cx={x} cy={-126} rx={3} ry={5} fill="#1b1b1b" />
                <circle cx={x + 3} cy={-130} r={2.5} fill="#fff" />
              </g>
            ))}
          </g>
        )}
        <path d="M -5 -113 L 5 -113 L 0 -107 Z" fill="#E88A9A" />
        <path d="M 0 -107 Q -4 -101 -9 -104 M 0 -107 Q 4 -101 9 -104" stroke="#5a3a2a" strokeWidth={2} fill="none" strokeLinecap="round" />
        <g stroke="#ffffffcc" strokeWidth={1.2}>
          <path d="M -20 -110 L -40 -114" /><path d="M -20 -106 L -40 -104" />
          <path d="M 20 -110 L 40 -114" /><path d="M 20 -106 L 40 -104" />
        </g>
        {!sick && <circle cx={-26} cy={-112} r={5} fill="#FF9AA8" opacity={0.5} />}
        {!sick && <circle cx={26} cy={-112} r={5} fill="#FF9AA8" opacity={0.5} />}
        {sick && <ellipse cx={0} cy={-120} rx={36} ry={30} fill="#7CB342" opacity={0.25} />}
      </g>
    </g>
  );
}
```

- [ ] **Step 6: src/art/CatFace.tsx** (kis ikon listákhoz, panelhez, figuraépítőhöz)

```tsx
import type { Looks } from '../sim/types';
import { CatFigure } from './CatFigure';

export function CatFace({ looks, sick = false, sleeping = false, className }: { looks: Looks; sick?: boolean; sleeping?: boolean; className?: string }) {
  return (
    <svg className={className} viewBox="-52 -182 104 104" aria-hidden="true">
      <CatFigure looks={looks} age="felnott" activity={sleeping ? 'alszik' : 'all'} sick={sick} facing={1} />
    </svg>
  );
}
```

- [ ] **Step 7: Ellenőrzés** – `npm test` PASS, `npm run typecheck` nincs hiba
- [ ] **Step 8: Commit** – `git add -A && git commit -m "feat(art): kódból rajzolt cuki nagymacska"`

---

### Task 14: Stílusok, buborék, macska a jelenetben, húzás

**Files:**
- Modify: `src/styles.css` (teljes csere)
- Create: `src/ui/CatSprite.tsx`, `src/ui/useCatDrag.ts`, `src/ui/catStatus.ts`

- [ ] **Step 1: src/styles.css**

```css
:root {
  --ink: #3b2a20; --paper: #fffaf2; --accent: #F08A24;
  --good: #66BB6A; --mid: #FFCA28; --bad: #EF5350;
  font-family: ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", "Nunito", system-ui, sans-serif;
  color: var(--ink);
}
* { box-sizing: border-box; }
html, body, #root {
  margin: 0; height: 100%; overflow: hidden; background: #7EC8F5;
  -webkit-user-select: none; user-select: none; -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent; overscroll-behavior: none;
}
button { font: inherit; color: inherit; border: none; cursor: pointer; touch-action: manipulation; }
.app { position: fixed; inset: 0; }
.loading { display: grid; place-items: center; height: 100%; font-size: 40px; }

.city-scroll { position: absolute; inset: 0; overflow-x: auto; overflow-y: hidden; touch-action: pan-x; }
.city-svg { display: block; height: 100%; width: calc(100dvh * 3000 / 700); }
.room-svg { position: absolute; inset: 0; width: 100%; height: 100%; touch-action: none; background: #3b2a20; }
.building { cursor: pointer; }

.hud { position: fixed; top: 8px; left: 8px; right: 8px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; pointer-events: none; z-index: 10; }
.hud > * { pointer-events: auto; }
.chip { background: var(--paper); border-radius: 999px; padding: 8px 16px; font-size: 22px; font-weight: 800; box-shadow: 0 3px 0 rgba(0,0,0,.15); white-space: nowrap; }
.chip.btn:active { transform: translateY(2px); box-shadow: none; }
.spacer { flex: 1; }

.cat-panel { position: fixed; top: 72px; left: 8px; right: 8px; z-index: 9; display: flex; flex-wrap: wrap; align-items: center; gap: 14px; background: var(--paper); border-radius: 20px; padding: 8px 14px; box-shadow: 0 4px 0 rgba(0,0,0,.15); }
.cat-panel .face { width: 64px; height: 64px; }
.cat-panel h2 { margin: 0; font-size: 24px; }
.badges { display: flex; gap: 6px; flex-wrap: wrap; font-size: 15px; }
.badge { background: #f1e6d6; border-radius: 999px; padding: 2px 10px; font-weight: 700; }
.bars { display: grid; grid-template-columns: repeat(4, 110px); gap: 4px 10px; }
.bar { display: flex; align-items: center; gap: 4px; font-size: 18px; }
.bar .track { flex: 1; height: 12px; background: #eee; border-radius: 6px; overflow: hidden; }
.bar .fill { height: 100%; border-radius: 6px; transition: width .3s; }
.status { font-weight: 700; font-size: 17px; }
.panel-btn { background: #FFE0B2; border-radius: 14px; padding: 8px 14px; font-size: 18px; font-weight: 800; }
.close { margin-left: auto; background: #eee; border-radius: 50%; width: 44px; height: 44px; font-size: 22px; }

.tray { position: fixed; left: 8px; right: 8px; bottom: 8px; z-index: 9; background: var(--paper); border-radius: 20px; padding: 8px 12px; box-shadow: 0 4px 0 rgba(0,0,0,.15); }
.tray-title { font-weight: 800; font-size: 18px; margin-bottom: 4px; }
.tray-items { display: flex; gap: 10px; overflow-x: auto; touch-action: pan-x; }
.tray-item { display: flex; flex-direction: column; align-items: center; min-width: 84px; padding: 6px; background: #fff; border-radius: 16px; border: 3px solid #f1e6d6; font-weight: 700; font-size: 15px; touch-action: none; }
.tray-item:disabled { opacity: .4; }
.tray-item.wide { min-width: 160px; }
.tray-emoji { font-size: 40px; line-height: 1.1; }
.tray-item small { font-size: 13px; opacity: .75; }
.tray-empty { padding: 12px; font-size: 18px; font-weight: 700; }
.ghost { position: fixed; z-index: 50; font-size: 56px; transform: translate(-50%, -60%); pointer-events: none; }

.toast { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); z-index: 40; background: var(--ink); color: #fff; padding: 12px 22px; border-radius: 999px; font-size: 22px; font-weight: 800; pointer-events: none; animation: toast 2.6s forwards; }
@keyframes toast { 0% { opacity: 0; } 10%, 85% { opacity: 1; } 100% { opacity: 0; } }

.modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 30; display: grid; place-items: center; }
.modal { background: var(--paper); border-radius: 24px; padding: 16px; width: min(900px, 94vw); max-height: 86vh; overflow: auto; }
.modal h2 { margin: 0 0 12px; }
.cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
.cat-card { background: #fff; border-radius: 16px; padding: 8px; display: flex; flex-direction: column; align-items: center; font-weight: 700; border: 3px solid #f1e6d6; }
.cat-card svg { width: 80px; height: 80px; }

.creator { position: fixed; inset: 0; display: grid; grid-template-columns: 38% 1fr; background: linear-gradient(#D1C4E9, #F3E5F5); }
.creator-preview { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px; gap: 8px; }
.creator-preview h1 { margin: 0; }
.creator-preview svg { width: 100%; max-height: 60vh; }
.fact { background: #fff; border-radius: 16px; padding: 10px 14px; font-size: 17px; }
.creator-form { overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px; }
.creator-form h3 { margin: 0 0 6px; font-size: 20px; }
.choices { display: flex; flex-wrap: wrap; gap: 8px; }
.choice { background: #fff; border-radius: 14px; padding: 8px 12px; font-size: 18px; font-weight: 700; border: 3px solid transparent; }
.choice.on { border-color: var(--accent); background: #FFF3E0; }
.species-choice { display: flex; flex-direction: column; align-items: center; width: 100px; font-size: 14px; }
.species-choice svg { width: 64px; height: 64px; }
.swatch { width: 48px; height: 48px; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 0 0 2px #ccc; }
.swatch.on { box-shadow: 0 0 0 4px var(--accent); }
.name-row { display: flex; gap: 8px; }
.name-row input { flex: 1; font: inherit; font-size: 22px; padding: 10px 14px; border-radius: 14px; border: 3px solid #ddd; -webkit-user-select: text; user-select: text; }
.creator-actions { display: flex; gap: 12px; justify-content: flex-end; position: sticky; bottom: 0; padding-top: 8px; }
.big-btn { font-size: 24px; font-weight: 900; padding: 14px 26px; border-radius: 18px; background: var(--good); color: #fff; box-shadow: 0 4px 0 rgba(0,0,0,.2); }
.big-btn.grey { background: #9e9e9e; }

/* Macska-animációk */
.cat .eyes { transform-box: fill-box; transform-origin: center; animation: blink 4.5s infinite; }
@keyframes blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
.cat .tail { transform-box: fill-box; transform-origin: 0% 100%; animation: wag 1.8s ease-in-out infinite alternate; }
@keyframes wag { from { transform: rotate(-6deg); } to { transform: rotate(8deg); } }
.cat.walking .leg, .cat.walking .arm { transform-box: fill-box; transform-origin: 50% 0%; }
.cat.walking .leg-l, .cat.walking .arm-r { animation: step .45s ease-in-out infinite alternate; }
.cat.walking .leg-r, .cat.walking .arm-l { animation: step .45s ease-in-out infinite alternate-reverse; }
@keyframes step { from { transform: rotate(-16deg); } to { transform: rotate(16deg); } }
.zzz { animation: float 2s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0); opacity: .6; } 50% { transform: translateY(-8px); opacity: 1; } }
```

- [ ] **Step 2: src/ui/catStatus.ts**

```ts
import { isHome, placeName } from '../data/buildings';
import type { Cat } from '../sim/types';

export function statusText(cat: Cat): string {
  if (cat.sick) return 'Beteg – vidd a kórházba! 🏥';
  if (cat.activity === 'alszik') return 'Alszik 😴';
  if (cat.needs.ital < 30 || cat.needs.etel < 30) {
    return isHome(cat.place) ? 'Éhes/szomjas – húzz neki valamit a hűtőből!' : 'Éhes/szomjas – vidd haza vagy az étterembe!';
  }
  if (cat.activity === 'setal') return 'Sétál 🚶';
  return `Itt van: ${placeName(cat.place)}`;
}

export function warningIcons(cat: Cat): string {
  let s = '';
  if (cat.sick) s += '🤒';
  if (cat.needs.etel < 20) s += '🍽️';
  if (cat.needs.ital < 20) s += '💧';
  if (cat.needs.alvas < 20) s += '😴';
  if (cat.needs.jokedv < 20) s += '🥺';
  return s;
}
```

- [ ] **Step 3: src/ui/CatSprite.tsx**

```tsx
import type { PointerEvent } from 'react';
import { AGE_SCALE, CatFigure } from '../art/CatFigure';
import type { Cat } from '../sim/types';

function Bubble({ text, y }: { text: string; y: number }) {
  const w = Math.max(70, [...text].length * 12 + 30);
  return (
    <g transform={`translate(0 ${y})`} pointerEvents="none">
      <rect x={-w / 2} y={-34} width={w} height={40} rx={18} fill="#fff" stroke="#333" strokeWidth={2} />
      <path d="M -8 5 L 0 16 L 8 5" fill="#fff" stroke="#333" strokeWidth={2} />
      <text x={0} y={-8} textAnchor="middle" fontSize={20} fontWeight={700} fill="#333">{text}</text>
    </g>
  );
}

interface Props {
  cat: Cat;
  x: number;
  y: number;
  minute: number;
  selected: boolean;
  lifted: boolean;
  onPointerDown: (e: PointerEvent<SVGGElement>) => void;
}

export function CatSprite({ cat, x, y, minute, selected, lifted, onPointerDown }: Props) {
  const s = AGE_SCALE[cat.age];
  const lying = cat.activity === 'alszik' && !lifted;
  const bubble = cat.bubble && minute < cat.bubbleUntil ? cat.bubble : null;
  const pose = lying ? 'translate(60 -75) rotate(-90)' : lifted ? 'translate(0 -20) scale(1.08)' : undefined;
  return (
    <g
      data-cat-id={cat.id}
      onPointerDown={onPointerDown}
      style={{ transform: `translate(${x}px, ${y}px)`, transition: lifted ? 'none' : 'transform 260ms linear', touchAction: 'none', cursor: 'grab' }}
    >
      {selected && <ellipse cx={0} cy={2} rx={44} ry={11} fill="none" stroke="#FFD54F" strokeWidth={6} />}
      <g transform={pose}>
        <CatFigure looks={cat.looks} age={cat.age} activity={lifted ? 'all' : cat.activity} sick={cat.sick} facing={cat.facing} />
      </g>
      {lying
        ? <rect x={-90} y={-130} width={180} height={110} fill="transparent" />
        : <rect x={-48} y={-180 * s} width={96} height={185 * s} fill="transparent" />}
      {cat.sick && <text x={34 * s} y={-160 * s} fontSize={28}>🤒</text>}
      {lying && <text className="zzz" x={-20} y={-110} fontSize={30} fontWeight={900} fill="#5C6BC0">Zzz</text>}
      {bubble && <Bubble text={bubble} y={lying ? -120 : -185 * s} />}
    </g>
  );
}
```

- [ ] **Step 4: src/ui/useCatDrag.ts**

```ts
import { useRef, useState, type PointerEvent, type RefObject } from 'react';
import { petCat } from '../sim/actions';
import { useGame } from '../store/store';

export interface Pt { x: number; y: number }

export function toSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number): Pt {
  const m = svg.getScreenCTM();
  if (!m) return { x: 0, y: 0 };
  const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
  return { x: p.x, y: p.y };
}

/** Macska húzása egy SVG jelenetben. Koppintás = kiválasztás + simogatás. */
export function useCatDrag(svgRef: RefObject<SVGSVGElement | null>, onDrop: (catId: string, p: Pt) => void) {
  const drag = useRef<{ catId: string; pointerId: number; sx: number; sy: number; moved: boolean } | null>(null);
  const [lift, setLift] = useState<{ catId: string; p: Pt } | null>(null);

  const onCatPointerDown = (catId: string) => (e: PointerEvent<SVGGElement>) => {
    e.stopPropagation();
    svgRef.current?.setPointerCapture(e.pointerId);
    drag.current = { catId, pointerId: e.pointerId, sx: e.clientX, sy: e.clientY, moved: false };
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    const svg = svgRef.current;
    if (!d || !svg || e.pointerId !== d.pointerId) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 10) return;
    if (!d.moved) {
      d.moved = true;
      useGame.getState().hold(d.catId);
    }
    setLift({ catId: d.catId, p: toSvgPoint(svg, e.clientX, e.clientY) });
  };

  const finish = (e: PointerEvent<SVGSVGElement>, cancelled: boolean) => {
    const d = drag.current;
    const svg = svgRef.current;
    if (!d || !svg || e.pointerId !== d.pointerId) return;
    drag.current = null;
    setLift(null);
    const game = useGame.getState();
    game.hold(null);
    if (cancelled) return;
    if (d.moved) {
      onDrop(d.catId, toSvgPoint(svg, e.clientX, e.clientY));
    } else {
      game.select(d.catId);
      game.act((w) => petCat(w, d.catId));
    }
  };

  return {
    lift,
    onCatPointerDown,
    svgHandlers: {
      onPointerMove,
      onPointerUp: (e: PointerEvent<SVGSVGElement>) => finish(e, false),
      onPointerCancel: (e: PointerEvent<SVGSVGElement>) => finish(e, true),
    },
  };
}

/** A kézben tartott macska legyen legfelül. */
export function heldLast<T extends { id: string }>(items: T[], heldId: string | undefined): T[] {
  if (!heldId) return items;
  return [...items.filter((c) => c.id !== heldId), ...items.filter((c) => c.id === heldId)];
}
```

- [ ] **Step 5: Ellenőrzés** – `npm run typecheck` → nincs hiba
- [ ] **Step 6: Commit** – `git add -A && git commit -m "feat(ui): stílusok, macska a jelenetben, húzás"`

---

### Task 15: Az utca

**Files:**
- Create: `src/art/Scenery.tsx`, `src/art/BuildingArt.tsx`, `src/ui/CityScreen.tsx`

- [ ] **Step 1: src/art/Scenery.tsx**

```tsx
import { GROUND_Y, SCENE_HEIGHT, SIDEWALK_BOTTOM } from '../data/buildings';
import type { DayPhase } from '../sim/time';

const SKY: Record<DayPhase, [string, string]> = {
  reggel: ['#FFD3A5', '#FFF1C9'],
  nappal: ['#7EC8F5', '#CDEFFF'],
  este: ['#F28C6A', '#FBD3A0'],
  ejjel: ['#16204A', '#3A4A85'],
};
const STARS = Array.from({ length: 60 }, (_, i) => ({ x: (i * 977) % 3000, y: ((i * 131) % 300) + 10, r: (i % 3) + 1 }));
const LAMPS = [540, 1040, 1580, 2140, 2640];

function Cloud({ x, y }: { x: number; y: number }) {
  return (
    <g fill="#fff" opacity={0.9}>
      <ellipse cx={x} cy={y} rx={60} ry={24} />
      <ellipse cx={x + 40} cy={y - 14} rx={40} ry={22} />
      <ellipse cx={x - 40} cy={y - 6} rx={34} ry={18} />
    </g>
  );
}

export function Sky({ phase, width }: { phase: DayPhase; width: number }) {
  const [top, bottom] = SKY[phase];
  const id = `sky-${phase}`;
  const night = phase === 'ejjel';
  const sunX = phase === 'reggel' ? 300 : phase === 'este' ? 2700 : 1500;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={width} height={GROUND_Y} fill={`url(#${id})`} />
      {night ? (
        <>
          {STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={0.8} />)}
          <circle cx={2600} cy={90} r={40} fill="#FFF8D6" />
        </>
      ) : (
        <>
          <circle cx={sunX} cy={phase === 'nappal' ? 80 : 160} r={50} fill="#FFE066" />
          {[200, 900, 1700, 2400].map((x, i) => <Cloud key={x} x={x} y={70 + (i % 3) * 30} />)}
        </>
      )}
      <path
        d={`M 0 ${GROUND_Y} Q 400 ${GROUND_Y - 140} 800 ${GROUND_Y} T 1600 ${GROUND_Y} T 2400 ${GROUND_Y} T 3200 ${GROUND_Y} Z`}
        fill={night ? '#2E3B6B' : '#A5D6A7'}
      />
    </g>
  );
}

export function Street({ width, lit }: { width: number; lit: boolean }) {
  return (
    <g>
      <rect x={0} y={GROUND_Y} width={width} height={SIDEWALK_BOTTOM - GROUND_Y} fill="#E8D9C0" />
      {Array.from({ length: Math.ceil(width / 80) }, (_, i) => (
        <line key={i} x1={i * 80} y1={GROUND_Y} x2={i * 80} y2={SIDEWALK_BOTTOM} stroke="#D4C2A3" strokeWidth={2} />
      ))}
      <rect x={0} y={SIDEWALK_BOTTOM} width={width} height={SCENE_HEIGHT - SIDEWALK_BOTTOM} fill="#6D6D6D" />
      {Array.from({ length: Math.ceil(width / 120) }, (_, i) => (
        <rect key={i} x={i * 120 + 20} y={SIDEWALK_BOTTOM + 16} width={60} height={6} fill="#fff" />
      ))}
      {LAMPS.map((x) => (
        <g key={x}>
          <rect x={x - 5} y={GROUND_Y - 200} width={10} height={200} fill="#455A64" />
          {lit && <circle cx={x} cy={GROUND_Y - 205} r={40} fill="#FFE680" opacity={0.35} />}
          <circle cx={x} cy={GROUND_Y - 205} r={16} fill={lit ? '#FFE680' : '#ECEFF1'} stroke="#455A64" strokeWidth={4} />
        </g>
      ))}
    </g>
  );
}
```

- [ ] **Step 2: src/art/BuildingArt.tsx**

```tsx
import type { ReactElement } from 'react';
import { GROUND_Y, type BuildingDef } from '../data/buildings';
import { shade } from './color';

function Awning({ x, y, w, color }: { x: number; y: number; w: number; color: string }) {
  const n = 6;
  const sw = w / n;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <path key={i} d={`M ${x + i * sw} ${y} h ${sw} v 30 q ${-sw / 2} 14 ${-sw} 0 Z`} fill={i % 2 ? '#fff' : color} />
      ))}
    </g>
  );
}

export function BuildingArt({ def, lit, onOpen }: { def: BuildingDef; lit: boolean; onOpen: () => void }) {
  const { x, width: w, height: h, wall, roof, doorX } = def;
  const top = GROUND_Y - h;
  const edge = shade(wall, -0.35);
  const glass = lit ? '#FFE680' : '#BFE6FF';
  const cols = Math.max(2, Math.floor((w - 40) / 100));
  const gap = (w - cols * 60) / (cols + 1);
  const windows: ReactElement[] = [];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = x + gap + c * (60 + gap);
      const wy = top + 70 + r * 100;
      if (wy + 60 > GROUND_Y - 120 && Math.abs(wx + 30 - doorX) < 80) continue;
      windows.push(
        <g key={`${r}-${c}`}>
          <rect x={wx} y={wy} width={60} height={60} rx={8} fill={glass} stroke={edge} strokeWidth={4} />
          <line x1={wx + 30} y1={wy} x2={wx + 30} y2={wy + 60} stroke={edge} strokeWidth={3} />
        </g>,
      );
    }
  }
  return (
    <g className="building" onClick={onOpen}>
      {def.style === 'haz' ? (
        <polygon points={`${x - 20},${top + 12} ${x + w / 2},${top - 80} ${x + w + 20},${top + 12}`} fill={roof} stroke={shade(roof, -0.3)} strokeWidth={4} strokeLinejoin="round" />
      ) : (
        <rect x={x - 10} y={top - 24} width={w + 20} height={36} rx={8} fill={roof} />
      )}
      <rect x={x} y={top} width={w} height={h} rx={8} fill={wall} stroke={edge} strokeWidth={4} />
      {windows}
      {def.style === 'bolt' && <Awning x={doorX - 90} y={GROUND_Y - 150} w={180} color={roof} />}
      <rect x={doorX - 36} y={GROUND_Y - 110} width={72} height={110} rx={10} fill={shade(roof, -0.15)} stroke={edge} strokeWidth={4} />
      <circle cx={doorX + 22} cy={GROUND_Y - 55} r={5} fill="#FFD54F" />
      <g transform={`translate(${x + w / 2} ${def.style === 'haz' ? top - 20 : top + 22})`}>
        <rect x={-w * 0.42} y={-26} width={w * 0.84} height={46} rx={14} fill="#fffaf2" stroke={edge} strokeWidth={3} />
        <text x={0} y={7} textAnchor="middle" fontSize={24} fontWeight={800} fill="#3b2a20">{def.emoji} {def.name}</text>
      </g>
    </g>
  );
}
```

- [ ] **Step 3: src/ui/CityScreen.tsx**

```tsx
import { useEffect, useRef } from 'react';
import { BuildingArt } from '../art/BuildingArt';
import { Sky, Street } from '../art/Scenery';
import {
  BUILDING_IDS, BUILDINGS, GROUND_Y, ROOM_DOOR_X, SCENE_HEIGHT, SIDEWALK_Y, STREET_WIDTH, WORKSHOP,
} from '../data/buildings';
import { moveCat } from '../sim/actions';
import { phaseOf } from '../sim/time';
import type { BuildingId } from '../sim/types';
import { useGame } from '../store/store';
import { CatSprite } from './CatSprite';
import { heldLast, useCatDrag, type Pt } from './useCatDrag';

function buildingAt(p: Pt): BuildingId | null {
  for (const id of BUILDING_IDS) {
    const b = BUILDINGS[id];
    if (p.x >= b.x && p.x <= b.x + b.width && p.y >= GROUND_Y - b.height && p.y <= GROUND_Y + 20) return id;
  }
  return null;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function CityScreen() {
  const world = useGame((s) => s.world)!;
  const selected = useGame((s) => s.selectedCatId);
  const focusCatId = useGame((s) => s.focusCatId);
  const setScreen = useGame((s) => s.setScreen);
  const act = useGame((s) => s.act);
  const svgRef = useRef<SVGSVGElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { lift, onCatPointerDown, svgHandlers } = useCatDrag(svgRef, (catId, p) => {
    const target = buildingAt(p);
    act((w) => (target ? moveCat(w, catId, target, ROOM_DOOR_X + 80) : moveCat(w, catId, 'utca', clamp(p.x, 40, STREET_WIDTH - 40))));
  });

  useEffect(() => {
    if (!focusCatId) return;
    const cat = useGame.getState().world?.cats.find((c) => c.id === focusCatId);
    const el = scrollRef.current;
    const svg = svgRef.current;
    if (cat && cat.place === 'utca' && el && svg) {
      const scale = svg.clientWidth / STREET_WIDTH;
      el.scrollTo({ left: cat.x * scale - el.clientWidth / 2, behavior: 'smooth' });
    }
    useGame.getState().focus(null);
  }, [focusCatId]);

  const phase = phaseOf(world.minute);
  const lit = phase === 'este' || phase === 'ejjel';
  const cats = heldLast(world.cats.filter((c) => c.place === 'utca'), lift?.catId);

  return (
    <div className="city-scroll" ref={scrollRef}>
      <svg ref={svgRef} className="city-svg" viewBox={`0 0 ${STREET_WIDTH} ${SCENE_HEIGHT}`} {...svgHandlers}>
        <Sky phase={phase} width={STREET_WIDTH} />
        <Street width={STREET_WIDTH} lit={lit} />
        {BUILDING_IDS.map((id) => (
          <BuildingArt key={id} def={BUILDINGS[id]} lit={lit} onOpen={() => setScreen({ kind: 'inside', building: id })} />
        ))}
        <BuildingArt def={WORKSHOP} lit={lit} onOpen={() => setScreen({ kind: 'creator' })} />
        {cats.map((c) => {
          const l = lift?.catId === c.id ? lift.p : null;
          return (
            <CatSprite
              key={c.id}
              cat={c}
              x={l ? l.x : c.x}
              y={l ? l.y + 60 : SIDEWALK_Y}
              minute={world.minute}
              selected={c.id === selected}
              lifted={!!l}
              onPointerDown={onCatPointerDown(c.id)}
            />
          );
        })}
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: Ellenőrzés** – `npm run typecheck` → nincs hiba
- [ ] **Step 5: Commit** – `git add -A && git commit -m "feat(ui): az utca épületekkel és napszakokkal"`

---

### Task 16: HUD, macska-panel, macskalista, értesítés, App

**Files:**
- Create: `src/ui/Hud.tsx`, `src/ui/CatPanel.tsx`, `src/ui/CatList.tsx`, `src/ui/Toast.tsx`
- Modify: `src/App.tsx` (teljes csere)

- [ ] **Step 1: src/ui/Toast.tsx**

```tsx
import { useGame } from '../store/store';

export function Toast() {
  const toast = useGame((s) => s.toast);
  if (!toast) return null;
  return <div key={toast.id} className="toast" role="status">{toast.text}</div>;
}
```

- [ ] **Step 2: src/ui/CatList.tsx**

```tsx
import { CatFace } from '../art/CatFace';
import { placeName } from '../data/buildings';
import { MAX_CATS } from '../sim/balance';
import type { Cat } from '../sim/types';
import { useGame } from '../store/store';
import { warningIcons } from './catStatus';

export function CatList({ onClose }: { onClose: () => void }) {
  const world = useGame((s) => s.world)!;
  const go = (cat: Cat) => {
    const g = useGame.getState();
    g.setScreen(cat.place === 'utca' ? { kind: 'city' } : { kind: 'inside', building: cat.place });
    g.select(cat.id);
    g.focus(cat.id);
    onClose();
  };
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>🐱 Macskáim ({world.cats.length}/{MAX_CATS})</h2>
        <div className="cat-grid">
          {world.cats.map((c) => (
            <button key={c.id} className="cat-card" onClick={() => go(c)}>
              <CatFace looks={c.looks} sick={c.sick} sleeping={c.activity === 'alszik'} />
              <span>{c.name}</span>
              <small>{placeName(c.place)} {warningIcons(c)}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: src/ui/Hud.tsx**

```tsx
import { useState } from 'react';
import { BUILDINGS } from '../data/buildings';
import { togglePause } from '../sim/actions';
import { dayOf, formatClock, phaseOf, type DayPhase } from '../sim/time';
import { useGame } from '../store/store';
import { CatList } from './CatList';

const PHASE_ICON: Record<DayPhase, string> = { reggel: '🌅', nappal: '☀️', este: '🌇', ejjel: '🌙' };

export function Hud() {
  const world = useGame((s) => s.world)!;
  const screen = useGame((s) => s.screen);
  const setScreen = useGame((s) => s.setScreen);
  const act = useGame((s) => s.act);
  const [listOpen, setListOpen] = useState(false);
  const building = screen.kind === 'inside' ? BUILDINGS[screen.building] : null;
  return (
    <>
      <div className="hud">
        {building && <button className="chip btn" onClick={() => setScreen({ kind: 'city' })}>⬅ Utca</button>}
        {building && <div className="chip">{building.emoji} {building.name}</div>}
        <div className="spacer" />
        <div className="chip">{PHASE_ICON[phaseOf(world.minute)]} {formatClock(world.minute)} · {dayOf(world.minute)}. nap</div>
        <div className="chip">🐾 {world.coins}</div>
        <button className="chip btn" onClick={() => setListOpen(true)}>🐱 Macskáim</button>
        <button className="chip btn" onClick={() => setScreen({ kind: 'creator' })}>➕ Új macska</button>
        <button className="chip btn" aria-label={world.paused ? 'Folytatás' : 'Szünet'} onClick={() => act((w) => togglePause(w))}>
          {world.paused ? '▶️' : '⏸️'}
        </button>
      </div>
      {listOpen && <CatList onClose={() => setListOpen(false)} />}
    </>
  );
}
```

- [ ] **Step 4: src/ui/CatPanel.tsx**

```tsx
import { CatFace } from '../art/CatFace';
import { isHome } from '../data/buildings';
import { AGE_LABEL, JOB_LABEL } from '../data/jobs';
import { SPECIES } from '../data/species';
import { putToBed } from '../sim/actions';
import { NEED_KEYS } from '../sim/needs';
import type { NeedKey } from '../sim/types';
import { useGame } from '../store/store';
import { statusText } from './catStatus';

const NEED_ICON: Record<NeedKey, string> = { etel: '🍗', ital: '💧', alvas: '😴', jokedv: '😊' };

function NeedBar({ icon, value }: { icon: string; value: number }) {
  const color = value > 50 ? 'var(--good)' : value > 20 ? 'var(--mid)' : 'var(--bad)';
  return (
    <div className="bar">
      <span>{icon}</span>
      <div className="track"><div className="fill" style={{ width: `${value}%`, background: color }} /></div>
    </div>
  );
}

export function CatPanel() {
  const world = useGame((s) => s.world)!;
  const id = useGame((s) => s.selectedCatId);
  const select = useGame((s) => s.select);
  const act = useGame((s) => s.act);
  const cat = world.cats.find((c) => c.id === id);
  if (!cat) return null;
  return (
    <div className="cat-panel">
      <CatFace className="face" looks={cat.looks} sick={cat.sick} sleeping={cat.activity === 'alszik'} />
      <div>
        <h2>{cat.name}</h2>
        <div className="badges">
          <span className="badge">{SPECIES[cat.species].name}</span>
          <span className="badge">{AGE_LABEL[cat.age]}</span>
          <span className="badge">{cat.diet === 'vega' ? '🥕 Vega' : '🍖 Húsevő'}</span>
          {cat.job && <span className="badge">{JOB_LABEL[cat.job]}</span>}
          {cat.sick && <span className="badge">🤒 Beteg</span>}
        </div>
      </div>
      <div className="bars">
        {NEED_KEYS.map((k) => <NeedBar key={k} icon={NEED_ICON[k]} value={cat.needs[k]} />)}
      </div>
      <div className="status">{statusText(cat)}</div>
      {isHome(cat.place) && cat.activity !== 'alszik' && (
        <button className="panel-btn" onClick={() => act((w) => putToBed(w, cat.id))}>🛏️ Lefekszik</button>
      )}
      <button className="close" aria-label="Bezár" onClick={() => select(null)}>✕</button>
    </div>
  );
}
```

- [ ] **Step 5: src/App.tsx** (az InsideScreen és CreatorScreen a 17–18. feladatban készül el; addig helykitöltő van helyettük)

```tsx
import { useEffect } from 'react';
import { createInitialWorld } from './sim/world';
import { useAutosave, useGameLoop } from './store/hooks';
import { loadWorld } from './store/save';
import { useGame } from './store/store';
import { CatPanel } from './ui/CatPanel';
import { CityScreen } from './ui/CityScreen';
import { CreatorScreen } from './ui/CreatorScreen';
import { Hud } from './ui/Hud';
import { InsideScreen } from './ui/InsideScreen';
import { Toast } from './ui/Toast';

export function App() {
  const world = useGame((s) => s.world);
  const screen = useGame((s) => s.screen);

  useEffect(() => {
    loadWorld()
      .then((w) => useGame.getState().setWorld(w ?? createInitialWorld()))
      .catch(() => useGame.getState().setWorld(createInitialWorld()));
  }, []);
  useGameLoop();
  useAutosave();

  if (!world) return <div className="loading">🐾 Betöltés…</div>;
  return (
    <div className="app">
      {screen.kind === 'city' && <CityScreen />}
      {screen.kind === 'inside' && <InsideScreen building={screen.building} />}
      {screen.kind === 'creator' && <CreatorScreen />}
      {screen.kind !== 'creator' && <Hud />}
      {screen.kind !== 'creator' && <CatPanel />}
      <Toast />
    </div>
  );
}
```

Ideiglenes helykitöltők, hogy már most futtatható legyen (a 17–18. feladat lecseréli):

`src/ui/InsideScreen.tsx`:
```tsx
import type { BuildingId } from '../sim/types';
export function InsideScreen({ building }: { building: BuildingId }) {
  return <div className="loading">{building}</div>;
}
```

`src/ui/CreatorScreen.tsx`:
```tsx
export function CreatorScreen() {
  return <div className="loading">🛠️</div>;
}
```

- [ ] **Step 6: Kipróbálás böngészőben**

Run: `npm run dev`, nyisd meg `http://localhost:5173` (tablet-méretű ablakban, pl. 1180×820). Ellenőrizd:
- látszik az égbolt, az utca, 6 épület, 5 macska; pislognak, csóválják a farkukat, sétálnak
- fent az óra pörög (≈2,4 játékperc/mp), pénz 40
- macskára koppintva szívecske-buborék és felső panel; húzással áthelyezhető; épületre ejtve eltűnik az utcáról
- „Macskáim” listában mindenki ott van; a szünet gomb megállítja az órát
- újratöltés után megmarad az állapot

- [ ] **Step 7: Commit** – `git add -A && git commit -m "feat(ui): HUD, macska-panel, macskalista, értesítések"`

---

### Task 17: Épületek belseje (babaház-nézet)

**Files:**
- Create: `src/art/Rooms.tsx`, `src/ui/ItemTray.tsx`, `src/ui/trays.tsx`
- Modify: `src/ui/InsideScreen.tsx` (teljes csere)

- [ ] **Step 1: src/art/Rooms.tsx**

```tsx
import type { ReactElement } from 'react';
import { HOME_BED_X, ROOM_DOOR_X, ROOM_FLOOR_Y, ROOM_HEIGHT, ROOM_WIDTH, type BuildingDef } from '../data/buildings';
import { shade } from './color';

const F = ROOM_FLOOR_Y;

export function RoomBackdrop({ def }: { def: BuildingDef }) {
  const dots: ReactElement[] = [];
  for (let r = 0; r * 70 + 40 < F - 30; r++) {
    for (let c = 0; c * 70 < ROOM_WIDTH; c++) {
      const x = 40 + c * 70 + (r % 2) * 35;
      const y = 40 + r * 70;
      dots.push(<circle key={`${r}-${c}`} cx={x} cy={y} r={5} fill={shade(def.wall, -0.1)} />);
    }
  }
  return (
    <g>
      <rect x={0} y={0} width={ROOM_WIDTH} height={F} fill={def.wall} />
      {dots}
      <rect x={0} y={F} width={ROOM_WIDTH} height={ROOM_HEIGHT - F} fill="#C99A6B" />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={0} y1={F + 30 * (i + 1)} x2={ROOM_WIDTH} y2={F + 30 * (i + 1)} stroke="#B5865A" strokeWidth={2} />
      ))}
      <rect x={0} y={F - 14} width={ROOM_WIDTH} height={14} fill={shade(def.wall, -0.3)} />
      <rect x={ROOM_DOOR_X - 55} y={F - 210} width={110} height={210} rx={12} fill={shade(def.roof, -0.1)} stroke={shade(def.roof, -0.4)} strokeWidth={4} />
      <circle cx={ROOM_DOOR_X + 35} cy={F - 105} r={6} fill="#FFD54F" />
      <text x={ROOM_DOOR_X} y={F - 225} textAnchor="middle" fontSize={22} fontWeight={800}>🚪 Ki az utcára</text>
    </g>
  );
}

export function HomeFurniture({ onBall }: { onBall: () => void }) {
  const B = HOME_BED_X;
  return (
    <g>
      <rect x={430} y={120} width={180} height={140} rx={10} fill="#BFE6FF" stroke="#fff" strokeWidth={10} />
      <rect x={200} y={F - 230} width={100} height={230} rx={14} fill="#ECEFF1" stroke="#90A4AE" strokeWidth={4} />
      <line x1={200} y1={F - 150} x2={300} y2={F - 150} stroke="#90A4AE" strokeWidth={4} />
      <rect x={282} y={F - 210} width={8} height={40} rx={4} fill="#90A4AE" />
      <text x={250} y={F - 245} textAnchor="middle" fontSize={22} fontWeight={800}>🧊 Hűtő</text>
      <rect x={330} y={F - 120} width={150} height={120} rx={8} fill="#BCAAA4" stroke="#8D6E63" strokeWidth={4} />
      <rect x={345} y={F - 130} width={120} height={14} rx={6} fill="#90A4AE" />
      <path d={`M 405 ${F - 130} v -40 h 30`} stroke="#78909C" strokeWidth={8} fill="none" strokeLinecap="round" />
      <text x={405} y={F - 185} textAnchor="middle" fontSize={22} fontWeight={800}>💧 Csap</text>
      <g onClick={onBall} style={{ cursor: 'pointer' }}>
        <circle cx={600} cy={F - 28} r={28} fill="#EF5350" stroke="#B71C1C" strokeWidth={3} />
        <path d={`M 572 ${F - 28} Q 600 ${F - 48} 628 ${F - 28}`} stroke="#fff" strokeWidth={5} fill="none" />
        <text x={600} y={F - 70} textAnchor="middle" fontSize={20} fontWeight={800}>⚽ Labda</text>
      </g>
      <rect x={B - 130} y={F - 140} width={22} height={140} rx={8} fill="#8D6E63" />
      <rect x={B - 120} y={F - 60} width={240} height={60} rx={10} fill="#A1887F" />
      <rect x={B - 115} y={F - 82} width={230} height={26} rx={10} fill="#FFFFFF" />
      <ellipse cx={B - 90} cy={F - 88} rx={26} ry={14} fill="#FFF8E1" stroke="#E0E0E0" strokeWidth={2} />
      <text x={B} y={F - 160} textAnchor="middle" fontSize={22} fontWeight={800}>🛏️ Ágy</text>
    </g>
  );
}

export function ShopFurniture() {
  const rows = [['🥕', '🍎', '🥬', '🫘'], ['🐟', '🍗', '🥚', '🍞'], ['🍝', '🥛', '🧃', '🍌']];
  return (
    <g>
      {rows.map((row, r) => (
        <g key={r}>
          <rect x={250} y={140 + r * 110} width={500} height={14} rx={6} fill="#8D6E63" />
          {row.map((e, i) => <text key={i} x={300 + i * 130} y={130 + r * 110} fontSize={56} textAnchor="middle">{e}</text>)}
        </g>
      ))}
      <rect x={780} y={F - 110} width={190} height={110} rx={10} fill="#FFB74D" stroke="#E65100" strokeWidth={4} />
      <text x={875} y={F - 50} textAnchor="middle" fontSize={26} fontWeight={800}>💰 Kassza</text>
    </g>
  );
}

export function RestaurantFurniture() {
  return (
    <g>
      <rect x={380} y={90} width={300} height={170} rx={12} fill="#37474F" stroke="#8D6E63" strokeWidth={10} />
      <text x={530} y={140} textAnchor="middle" fontSize={32} fill="#fff" fontWeight={800}>🍽️ Menü</text>
      <text x={530} y={190} textAnchor="middle" fontSize={34}>🍲 🍉 🍕 🍣 🍔</text>
      <text x={530} y={235} textAnchor="middle" fontSize={18} fill="#fff">🥕 vega · 🍖 húsos · 😋 mindenkinek</text>
      {[320, 720].map((tx) => (
        <g key={tx}>
          <rect x={tx - 70} y={F - 90} width={140} height={14} rx={6} fill="#A1887F" />
          <rect x={tx - 8} y={F - 80} width={16} height={80} fill="#8D6E63" />
          <text x={tx} y={F - 96} textAnchor="middle" fontSize={30}>🕯️</text>
        </g>
      ))}
    </g>
  );
}

export function HospitalFurniture() {
  return (
    <g>
      <g transform="translate(500 150)">
        <rect x={-40} y={-40} width={80} height={80} rx={10} fill="#fff" />
        <rect x={-12} y={-30} width={24} height={60} fill="#E53935" />
        <rect x={-30} y={-12} width={60} height={24} fill="#E53935" />
      </g>
      {[350, 750].map((bx) => (
        <g key={bx}>
          <rect x={bx - 100} y={F - 70} width={200} height={20} rx={8} fill="#E3F2FD" stroke="#90CAF9" strokeWidth={3} />
          <rect x={bx - 100} y={F - 50} width={10} height={50} fill="#90A4AE" />
          <rect x={bx + 90} y={F - 50} width={10} height={50} fill="#90A4AE" />
        </g>
      ))}
    </g>
  );
}
```

- [ ] **Step 2: src/ui/ItemTray.tsx** – húzható tárgysor (étel → macska). Koppintás = a kiválasztott macskának adja.

```tsx
import { useRef, useState, type PointerEvent } from 'react';
import { useGame } from '../store/store';

export interface TrayItem {
  key: string;
  emoji: string;
  label: string;
  sub?: string;
  disabled?: boolean;
}

function catIdAt(x: number, y: number): string | null {
  for (const el of document.elementsFromPoint(x, y)) {
    const host = el.closest('[data-cat-id]');
    if (host) return host.getAttribute('data-cat-id');
  }
  return null;
}

export function ItemTray({ title, items, empty, onUse }: {
  title: string;
  items: TrayItem[];
  empty?: string;
  onUse: (key: string, catId: string) => void;
}) {
  const selected = useGame((s) => s.selectedCatId);
  const start = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const [ghost, setGhost] = useState<{ emoji: string; x: number; y: number } | null>(null);

  const onDown = (item: TrayItem) => (e: PointerEvent<HTMLButtonElement>) => {
    if (item.disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY, moved: false };
  };
  const onMove = (item: TrayItem) => (e: PointerEvent<HTMLButtonElement>) => {
    const s = start.current;
    if (!s) return;
    if (!s.moved && Math.hypot(e.clientX - s.x, e.clientY - s.y) < 10) return;
    s.moved = true;
    setGhost({ emoji: item.emoji, x: e.clientX, y: e.clientY });
  };
  const onUp = (item: TrayItem) => (e: PointerEvent<HTMLButtonElement>) => {
    const s = start.current;
    start.current = null;
    setGhost(null);
    if (!s) return;
    const toast = useGame.getState().showToast;
    if (s.moved) {
      const catId = catIdAt(e.clientX, e.clientY);
      if (catId) onUse(item.key, catId);
      else toast('Húzd rá egy macskára! 🐾');
    } else if (selected) {
      onUse(item.key, selected);
    } else {
      toast('Koppints egy macskára, vagy húzd rá az ételt! 🐾');
    }
  };
  const cancel = () => {
    start.current = null;
    setGhost(null);
  };

  return (
    <div className="tray">
      <div className="tray-title">{title}</div>
      <div className="tray-items">
        {items.length === 0 && empty && <div className="tray-empty">{empty}</div>}
        {items.map((it) => (
          <button
            key={it.key}
            className="tray-item"
            disabled={it.disabled}
            onPointerDown={onDown(it)}
            onPointerMove={onMove(it)}
            onPointerUp={onUp(it)}
            onPointerCancel={cancel}
          >
            <span className="tray-emoji">{it.emoji}</span>
            <span>{it.label}</span>
            {it.sub && <small>{it.sub}</small>}
          </button>
        ))}
      </div>
      {ghost && <div className="ghost" style={{ left: ghost.x, top: ghost.y }}>{ghost.emoji}</div>}
    </div>
  );
}
```

- [ ] **Step 3: src/ui/trays.tsx**

```tsx
import { FOOD_IDS, FOODS, KIND_ICON, MEAL_IDS, MEALS } from '../data/foods';
import { buyFood, drinkWater, feedFromPantry, healCat, orderMeal } from '../sim/actions';
import { HEAL_COST } from '../sim/balance';
import type { FoodId, MealId } from '../sim/types';
import { useGame } from '../store/store';
import { ItemTray, type TrayItem } from './ItemTray';

export function HomeTray() {
  const world = useGame((s) => s.world)!;
  const act = useGame((s) => s.act);
  const foods: TrayItem[] = FOOD_IDS.filter((id) => (world.pantry[id] ?? 0) > 0).map((id) => ({
    key: id,
    emoji: FOODS[id].emoji,
    label: FOODS[id].name,
    sub: `${world.pantry[id]} db · ${KIND_ICON[FOODS[id].kind]}`,
  }));
  const items: TrayItem[] = [{ key: 'viz', emoji: '💧', label: 'Víz', sub: 'ingyen' }, ...foods];
  return (
    <ItemTray
      title={foods.length ? '🧊 Hűtő – húzd az ételt egy macskára!' : '🧊 Üres a hűtő – vegyél ételt a boltban! 🛒'}
      items={items}
      onUse={(key, catId) => act((w) => (key === 'viz' ? drinkWater(w, catId) : feedFromPantry(w, catId, key as FoodId)))}
    />
  );
}

export function RestaurantTray() {
  const act = useGame((s) => s.act);
  const items: TrayItem[] = MEAL_IDS.map((id) => ({
    key: id,
    emoji: MEALS[id].emoji,
    label: MEALS[id].name,
    sub: `${MEALS[id].price} 🐾 · ${KIND_ICON[MEALS[id].kind]}`,
  }));
  return (
    <ItemTray
      title="🍽️ Menü – húzd az ételt arra, aki enni szeretne!"
      items={items}
      onUse={(key, catId) => act((w) => orderMeal(w, catId, key as MealId))}
    />
  );
}

export function ShopTray() {
  const world = useGame((s) => s.world)!;
  const act = useGame((s) => s.act);
  return (
    <div className="tray">
      <div className="tray-title">🛒 Bolt – koppints, amit megveszel! (A hűtőbe kerül.)</div>
      <div className="tray-items">
        {FOOD_IDS.map((id) => (
          <button key={id} className="tray-item" onClick={() => act((w) => buyFood(w, id))}>
            <span className="tray-emoji">{FOODS[id].emoji}</span>
            <span>{FOODS[id].name}</span>
            <small>{FOODS[id].price} 🐾 · {KIND_ICON[FOODS[id].kind]}</small>
            <small>Hűtőben: {world.pantry[id] ?? 0}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

export function HospitalTray() {
  const world = useGame((s) => s.world)!;
  const act = useGame((s) => s.act);
  const doctor = world.cats.find((c) => c.job === 'orvos' && c.age === 'felnott');
  const sickHere = world.cats.filter((c) => c.place === 'korhaz' && c.sick);
  return (
    <div className="tray">
      <div className="tray-title">
        🏥 Kórház – {doctor ? `az orvos: ${doctor.name} 🩺` : 'nincs orvos! Építs egyet a Macskaműhelyben.'}
      </div>
      <div className="tray-items">
        {sickHere.length === 0 ? (
          <div className="tray-empty">Itt most nincs beteg. 😊 A beteg macskát az utcán húzd rá a kórházra!</div>
        ) : (
          sickHere.map((c) => (
            <button key={c.id} className="tray-item wide" onClick={() => act((w) => healCat(w, c.id))}>
              <span className="tray-emoji">💊</span>
              <span>{c.name} gyógyítása</span>
              <small>{HEAL_COST} 🐾</small>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: src/ui/InsideScreen.tsx**

```tsx
import { useRef } from 'react';
import { HomeFurniture, HospitalFurniture, RestaurantFurniture, RoomBackdrop, ShopFurniture } from '../art/Rooms';
import { BUILDINGS, HOME_BED_X, isHome, ROOM_DOOR_X, ROOM_FLOOR_Y, ROOM_HEIGHT, ROOM_WIDTH } from '../data/buildings';
import { moveCat, playBall, putToBed } from '../sim/actions';
import type { BuildingId } from '../sim/types';
import { useGame } from '../store/store';
import { CatSprite } from './CatSprite';
import { HomeTray, HospitalTray, RestaurantTray, ShopTray } from './trays';
import { heldLast, useCatDrag } from './useCatDrag';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function InsideScreen({ building }: { building: BuildingId }) {
  const world = useGame((s) => s.world)!;
  const selected = useGame((s) => s.selectedCatId);
  const act = useGame((s) => s.act);
  const svgRef = useRef<SVGSVGElement>(null);
  const def = BUILDINGS[building];
  const home = isHome(building);

  const { lift, onCatPointerDown, svgHandlers } = useCatDrag(svgRef, (catId, p) => {
    act((w) => {
      if (p.x < ROOM_DOOR_X + 70) return moveCat(w, catId, 'utca', def.doorX);
      if (home && Math.abs(p.x - HOME_BED_X) < 120 && p.y > ROOM_FLOOR_Y - 200) {
        moveCat(w, catId, building, HOME_BED_X);
        return putToBed(w, catId);
      }
      return moveCat(w, catId, building, clamp(p.x, ROOM_DOOR_X + 80, ROOM_WIDTH - 60));
    });
  });

  const cats = heldLast(world.cats.filter((c) => c.place === building), lift?.catId);

  return (
    <>
      <svg
        ref={svgRef}
        className="room-svg"
        viewBox={`0 0 ${ROOM_WIDTH} ${ROOM_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        {...svgHandlers}
      >
        <RoomBackdrop def={def} />
        {home && <HomeFurniture onBall={() => act((w) => playBall(w, building))} />}
        {building === 'bolt' && <ShopFurniture />}
        {building === 'etterem' && <RestaurantFurniture />}
        {building === 'korhaz' && <HospitalFurniture />}
        {cats.map((c) => {
          const l = lift?.catId === c.id ? lift.p : null;
          return (
            <CatSprite
              key={c.id}
              cat={c}
              x={l ? l.x : c.x}
              y={l ? l.y + 60 : ROOM_FLOOR_Y}
              minute={world.minute}
              selected={c.id === selected}
              lifted={!!l}
              onPointerDown={onCatPointerDown(c.id)}
            />
          );
        })}
        {cats.length === 0 && (
          <text x={ROOM_WIDTH / 2} y={330} textAnchor="middle" fontSize={28} fontWeight={800} fill="#00000066">
            Most nincs itt senki. Az utcán húzz ide egy macskát! 🐾
          </text>
        )}
      </svg>
      {home && <HomeTray />}
      {building === 'bolt' && <ShopTray />}
      {building === 'etterem' && <RestaurantTray />}
      {building === 'korhaz' && <HospitalTray />}
    </>
  );
}
```

- [ ] **Step 5: Kipróbálás böngészőben** (`npm run dev`)
- Bolt: koppints a 🛒 Bolt épületre → bent polcok; „Répa” koppintás → „Megvetted: 🥕 Répa”, pénz −2
- Rózsa-ház: húzz be egy macskát az utcán a házra, lépj be; a hűtősorból húzd a répát a vega Mirára → „Nyamm!”; húzd a halat → „Köszi, de én vega vagyok! 🥕”
- Húzd a macskát az ágyra → lefekszik, Zzz; labdára koppintás → „Hurrá!”
- Húzd a macskát az ajtóhoz → kikerül az utcára
- Étterem: húzz egy ételt egy bent lévő macskára → fizet, eszik
- Kórház: üres állapot szövege látszik

- [ ] **Step 6: Commit** – `git add -A && git commit -m "feat(ui): épületek belseje, hűtő, bolt, étterem, kórház"`

---

### Task 18: Macskaműhely (figuraépítő)

**Files:**
- Modify: `src/ui/CreatorScreen.tsx` (teljes csere)

- [ ] **Step 1: src/ui/CreatorScreen.tsx**

```tsx
import { useState } from 'react';
import { CatFace } from '../art/CatFace';
import { CatFigure } from '../art/CatFigure';
import { shade } from '../art/color';
import { BUILDINGS } from '../data/buildings';
import { AGE_LABEL, JOB_IDS, JOB_LABEL } from '../data/jobs';
import { SPECIES, SPECIES_IDS } from '../data/species';
import { addCat, defaultLooks, hasMane, type CatDraft } from '../sim/cats';
import { randomName } from '../sim/names';
import type { AgeStage, HomeId, PatternKind, Sex, SpeciesId } from '../sim/types';
import { useGame } from '../store/store';

const FUN_FURS = ['#F2C14E', '#E07B39', '#C9955E', '#8D6E63', '#D9D9D2', '#FFFFFF', '#2E2A33', '#F8BBD0', '#CE93D8', '#90CAF9'];
const EYES = ['#E2B33C', '#8FB7C9', '#9BBF6A', '#6D4C41', '#4FC3F7', '#BA68C8'];
const PATTERNS: Array<[PatternKind, string]> = [['nincs', 'Nincs'], ['csikos', 'Csíkos'], ['rozettas', 'Rozettás'], ['pottyos', 'Pöttyös'], ['felhos', 'Felhős']];
const AGES: AgeStage[] = ['baba', 'gyerek', 'felnott'];
const HOMES: HomeId[] = ['otthon1', 'otthon2'];

const cls = (base: string, on: boolean) => (on ? `${base} on` : base);

function newDraft(species: SpeciesId, sex: Sex, age: AgeStage): CatDraft {
  return { name: randomName(sex), species, sex, age, diet: 'husevo', job: null, looks: defaultLooks(species, sex, age), homeId: 'otthon1' };
}

export function CreatorScreen() {
  const act = useGame((s) => s.act);
  const setScreen = useGame((s) => s.setScreen);
  const [d, setD] = useState<CatDraft>(() => newDraft('jaguar', 'lany', 'felnott'));

  const update = (patch: Partial<CatDraft>) => setD((p) => ({ ...p, ...patch }));
  const setSpecies = (species: SpeciesId) => setD((p) => ({ ...p, species, looks: defaultLooks(species, p.sex, p.age) }));
  const setSexAge = (sex: Sex, age: AgeStage) =>
    setD((p) => ({ ...p, sex, age, job: age === 'felnott' ? p.job : null, looks: { ...p.looks, mane: hasMane(p.species, sex, age) } }));
  const setFur = (fur: string) => setD((p) => ({ ...p, looks: { ...p.looks, fur, belly: shade(fur, 0.6), patternColor: shade(fur, -0.6) } }));
  const speciesFur = SPECIES[d.species].looks.fur;

  const finish = () => {
    const r = act((w) => addCat(w, d));
    if (r?.ok) setScreen({ kind: 'city' });
  };

  return (
    <div className="creator">
      <div className="creator-preview">
        <h1>🛠️ Macskaműhely</h1>
        <svg viewBox="-110 -200 220 210" aria-hidden="true">
          <CatFigure looks={d.looks} age={d.age} activity="all" sick={false} facing={1} />
        </svg>
        <div className="fact">💡 Tudtad? {SPECIES[d.species].fact}<br />🌍 Otthona: {SPECIES[d.species].habitat}</div>
      </div>

      <div className="creator-form">
        <section>
          <h3>Milyen nagymacska?</h3>
          <div className="choices">
            {SPECIES_IDS.map((id) => (
              <button key={id} className={cls('choice species-choice', d.species === id)} onClick={() => setSpecies(id)}>
                <CatFace looks={defaultLooks(id, 'lany', 'felnott')} />
                {SPECIES[id].name}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3>Lány vagy fiú?</h3>
          <div className="choices">
            <button className={cls('choice', d.sex === 'lany')} onClick={() => setSexAge('lany', d.age)}>👧 Lány</button>
            <button className={cls('choice', d.sex === 'fiu')} onClick={() => setSexAge('fiu', d.age)}>👦 Fiú</button>
          </div>
        </section>

        <section>
          <h3>Hány éves?</h3>
          <div className="choices">
            {AGES.map((a) => (
              <button key={a} className={cls('choice', d.age === a)} onClick={() => setSexAge(d.sex, a)}>{AGE_LABEL[a]}</button>
            ))}
          </div>
        </section>

        <section>
          <h3>Bunda színe</h3>
          <div className="choices">
            {[speciesFur, ...FUN_FURS.filter((f) => f !== speciesFur)].map((f, i) => (
              <button
                key={f}
                aria-label={i === 0 ? 'Eredeti szín' : `Szín ${f}`}
                className={cls('swatch', d.looks.fur === f)}
                style={{ background: f }}
                onClick={() => (i === 0 ? setSpecies(d.species) : setFur(f))}
              />
            ))}
          </div>
        </section>

        <section>
          <h3>Minta</h3>
          <div className="choices">
            {PATTERNS.map(([p, label]) => (
              <button key={p} className={cls('choice', d.looks.pattern === p)} onClick={() => update({ looks: { ...d.looks, pattern: p } })}>{label}</button>
            ))}
          </div>
        </section>

        <section>
          <h3>Szemszín</h3>
          <div className="choices">
            {EYES.map((e) => (
              <button key={e} aria-label={`Szem ${e}`} className={cls('swatch', d.looks.eyes === e)} style={{ background: e }} onClick={() => update({ looks: { ...d.looks, eyes: e } })} />
            ))}
          </div>
        </section>

        <section>
          <h3>Mit eszik?</h3>
          <div className="choices">
            <button className={cls('choice', d.diet === 'vega')} onClick={() => update({ diet: 'vega' })}>🥕 Vega</button>
            <button className={cls('choice', d.diet === 'husevo')} onClick={() => update({ diet: 'husevo' })}>🍖 Húsevő</button>
          </div>
        </section>

        {d.age === 'felnott' && (
          <section>
            <h3>Szakma (ha akarod)</h3>
            <div className="choices">
              <button className={cls('choice', d.job === null)} onClick={() => update({ job: null })}>Nincs</button>
              {JOB_IDS.map((j) => (
                <button key={j} className={cls('choice', d.job === j)} onClick={() => update({ job: j })}>{JOB_LABEL[j]}</button>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3>Hol lakik?</h3>
          <div className="choices">
            {HOMES.map((h) => (
              <button key={h} className={cls('choice', d.homeId === h)} onClick={() => update({ homeId: h })}>
                {BUILDINGS[h].emoji} {BUILDINGS[h].name}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3>Neve</h3>
          <div className="name-row">
            <input placeholder="Név" value={d.name} maxLength={16} onChange={(e) => update({ name: e.target.value })} />
            <button className="choice" aria-label="Véletlen név" onClick={() => update({ name: randomName(d.sex) })}>🎲</button>
          </div>
        </section>

        <div className="creator-actions">
          <button className="big-btn grey" onClick={() => setScreen({ kind: 'city' })}>❌ Mégse</button>
          <button className="big-btn" onClick={finish}>✅ Kész!</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Kipróbálás** – `npm run dev`: „➕ Új macska” → válts fajt (az előnézet és a „Tudtad?” frissül), oroszlán fiú felnőttnek sörénye van; rózsaszín bunda; „✅ Kész!” → az utcán a Macskaműhely előtt megjelenik „Szia! 👋” buborékkal, értesítés: „Megérkezett: …! 🎉”. Ellenőrizd mind a 13 fajt szemre.

- [ ] **Step 3: Commit** – `git add -A && git commit -m "feat(ui): Macskaműhely – saját nagymacska építése"`

---

### Task 19: Tabletre telepíthető app (PWA) és ikon

**Files:**
- Create: `public/favicon.svg`, generált PNG-k a `public/` mappában
- Modify: `vite.config.ts`, `index.html`

- [ ] **Step 1: public/favicon.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="#7EC8F5"/>
  <circle cx="26" cy="30" r="12" fill="#F08A24"/><circle cx="74" cy="30" r="12" fill="#F08A24"/>
  <circle cx="26" cy="30" r="6" fill="#F6C1CC"/><circle cx="74" cy="30" r="6" fill="#F6C1CC"/>
  <ellipse cx="50" cy="56" rx="34" ry="30" fill="#F08A24"/>
  <path d="M42 30 q3 8 0 14 M50 28 q3 8 0 14 M58 30 q3 8 0 14" stroke="#2B1B10" stroke-width="3" fill="none" stroke-linecap="round"/>
  <ellipse cx="50" cy="68" rx="16" ry="11" fill="#FFF3E0"/>
  <ellipse cx="38" cy="54" rx="7" ry="8" fill="#fff"/><ellipse cx="62" cy="54" rx="7" ry="8" fill="#fff"/>
  <circle cx="38" cy="55" r="4.5" fill="#2B1B10"/><circle cx="62" cy="55" r="4.5" fill="#2B1B10"/>
  <circle cx="39.5" cy="53" r="1.5" fill="#fff"/><circle cx="63.5" cy="53" r="1.5" fill="#fff"/>
  <path d="M46 63 h8 l-4 5 z" fill="#E88A9A"/>
</svg>
```

- [ ] **Step 2: Ikonok generálása**

Run: `npm run icons`
Expected: a `public/` mappában megjelenik `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png`, `apple-touch-icon-180x180.png`, `favicon.ico`.

- [ ] **Step 3: vite.config.ts**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'NagyMacskaCitiy',
        short_name: 'NagyMacska',
        description: 'Cuki nagymacskák városa',
        lang: 'hu',
        display: 'standalone',
        orientation: 'landscape',
        background_color: '#7EC8F5',
        theme_color: '#F08A24',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: { include: ['tests/**/*.test.ts'] },
});
```

- [ ] **Step 4: index.html** – a `<link rel="icon" …>` sor alá:

```html
    <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />
```

- [ ] **Step 5: Build és ellenőrzés**

Run: `npm run build` → Expected: sikeres, a kimenetben `dist/sw.js` és `dist/manifest.webmanifest`.
Run: `npm run preview` → nyisd meg; DevTools → Application → Manifest: név, ikonok rendben; Service Worker aktív; Offline módban újratöltve is betölt.

- [ ] **Step 6: Commit** – `git add -A && git commit -m "feat: telepíthető, offline is működő app ikonnal"`

---

### Task 20: Böngészős teszt (tablet-méret)

**Files:**
- Create: `playwright.config.ts`, `e2e/game.spec.ts`

- [ ] **Step 1: playwright.config.ts**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  use: {
    ...devices['iPad (gen 7) landscape'],
    browserName: 'chromium',
    baseURL: 'http://localhost:5199',
  },
  webServer: {
    command: 'npx vite --port 5199 --strictPort',
    url: 'http://localhost:5199',
    reuseExistingServer: true,
  },
});
```

(Ha a `iPad (gen 7) landscape` név nem létezik a telepített Playwrightban: `node -e "console.log(Object.keys(require('@playwright/test').devices).filter(d=>d.includes('iPad')))"` és válassz egy fekvő iPad-et.)

- [ ] **Step 2: e2e/game.spec.ts**

```ts
import { expect, test } from '@playwright/test';

test('saját macska építése, és újratöltés után is megvan', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('1. nap')).toBeVisible();
  await page.getByRole('button', { name: /Új macska/ }).click();
  await page.getByRole('button', { name: 'Tigris', exact: true }).click();
  await page.getByPlaceholder('Név').fill('Teszt Tigris');
  await page.getByRole('button', { name: /Kész/ }).click();
  await expect(page.getByText('Megérkezett: Teszt Tigris! 🎉')).toBeVisible();
  await page.waitForTimeout(4000); // automatikus mentés 3 mp-enként
  await page.reload();
  await page.getByRole('button', { name: /Macskáim/ }).click();
  await expect(page.getByText('Teszt Tigris')).toBeVisible();
});

test('vásárlás a boltban', async ({ page }) => {
  await page.goto('/');
  await page.getByText('🛒 Bolt').first().click();
  await expect(page.getByText(/koppints, amit megveszel/)).toBeVisible();
  await page.getByRole('button', { name: /Répa/ }).click();
  await expect(page.getByText('Megvetted: 🥕 Répa')).toBeVisible();
});
```

- [ ] **Step 3: Futtatás**

Run: `npx playwright install chromium && npm run e2e`
Expected: 2 passed.

- [ ] **Step 4: Commit** – `git add -A && git commit -m "test: böngészős tesztek tablet-méretben"`

---

### Task 21: Közzététel GitHub Pages-en

> ⚠️ **Kérdezd meg a felhasználót, mielőtt ezt elindítod!** Nyilvános GitHub tárolót hoz létre a fiókjában (ingyenes Pages csak nyilvános tárolóval megy, ha nincs Pro előfizetés). A játékban nincs személyes adat.

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: .github/workflows/deploy.yml**

```yaml
name: Deploy
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
        env:
          BASE_PATH: /NagyMacskaCitiy/
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Tároló létrehozása és Pages bekapcsolása** (csak a felhasználó jóváhagyása után)

```bash
git add -A && git commit -m "ci: GitHub Pages közzététel"
git branch -M main
gh repo create NagyMacskaCitiy --public --source . --push
gh api -X POST "repos/{owner}/NagyMacskaCitiy/pages" -f build_type=workflow
gh run watch
```

Expected: a workflow zöld; az oldal elérhető: `https://<felhasználónév>.github.io/NagyMacskaCitiy/`.

- [ ] **Step 3: Tabletre tétel** – a tableten Safariban/Chrome-ban megnyitni a címet → Megosztás → „Hozzáadás a kezdőképernyőhöz”. Repülőgép-módban is el kell indulnia.

---

## Az 1. szakasz kész, ha

- `npm test` és `npm run e2e` zöld, `npm run build` hibátlan
- a tableten: 5 kezdő macska él az utcán, épületekbe be lehet menni, etetni/itatni lehet (a vega/húsevő szabály működik), alszanak éjjel, megbetegedhetnek és meggyógyíthatók, saját macska építhető, és minden megmarad bezárás után
- a kislány kipróbálta, és a visszajelzései fel vannak írva a 2. szakasz tervezéséhez
