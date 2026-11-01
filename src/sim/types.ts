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
