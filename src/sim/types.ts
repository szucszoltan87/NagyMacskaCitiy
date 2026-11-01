export type SpeciesId =
  | 'oroszlan' | 'tigris' | 'jaguar' | 'leopard' | 'fekete_parduc' | 'hoparduc' | 'gepard'
  | 'puma' | 'kodfoltos_parduc' | 'hiuz' | 'szerval' | 'karakal' | 'ocelot';
export type PatternKind = 'nincs' | 'csikos' | 'rozettas' | 'pottyos' | 'felhos';
export type EarKind = 'kerek' | 'hegyes' | 'nagy' | 'pamacsos';
export type Sex = 'lany' | 'fiu';
export type AgeStage = 'baba' | 'gyerek' | 'felnott';
export type Diet = 'vega' | 'husevo';
export type FoodKind = Diet | 'mindenki';
export type JobId =
  | 'orvos' | 'szakacs' | 'elado' | 'tanar' | 'ovono' | 'tuzolto' | 'rendor' | 'fodrasz'
  | 'buszsofor' | 'mozdonyvezeto' | 'pilota';
export type NeedKey = 'etel' | 'ital' | 'alvas' | 'jokedv';
export type Needs = Record<NeedKey, number>;

export type StreetId = 'belvaros' | 'parkvaros' | 'hoshegy' | 'szavanna' | 'oserdo';
export type DestinationId = 'hoshegy' | 'szavanna' | 'oserdo';
export type Climate = 'hideg' | 'meleg' | 'esos';

export type HomeId = 'otthon1' | 'otthon2' | 'otthon3';
export type LodgeId = 'kunyho' | 'szafaritabor' | 'fakunyho';
export type SleepId = HomeId | LodgeId;
export type BuildingId =
  | SleepId
  | 'bolt' | 'etterem' | 'korhaz' | 'ruhabolt' | 'fodrasz' | 'ovoda' | 'iskola'
  | 'park' | 'strand' | 'butorbolt' | 'tuzoltosag' | 'rendorseg'
  | 'busz_bv' | 'busz_pv' | 'vasut_bv' | 'vasut_hh' | 'repter_pv' | 'repter_sz' | 'repter_os'
  | 'sibolt' | 'szafaribolt' | 'dzsungelbolt';
export type Place = 'utca' | BuildingId;
export type Activity = 'all' | 'setal' | 'alszik' | 'dolgozik' | 'tanul' | 'jatszik' | 'uszik';
/** Egy épületen belüli hely, ahová macskát lehet tenni. */
export type SpotId = 'hinta' | 'csuszda' | 'viz' | 'kad' | 'kapu_sz' | 'kapu_os';

export type FoodId =
  | 'repa' | 'alma' | 'salata' | 'bab' | 'paradicsom' | 'hal' | 'csirke' | 'tojas'
  | 'kenyer' | 'teszta' | 'sajt' | 'tej' | 'gyumolcsle' | 'cumisuveg'
  | RecipeId;
export type RecipeId =
  | 'spagetti' | 'szendvics' | 'rantotta' | 'halsalata' | 'tekercs' | 'turmix'
  | 'csirkesteszta' | 'babgulyas' | 'repatorta' | 'pizzaszelet';
export type MealId =
  | 'zoldsegleves' | 'gyumolcstal' | 'pizza' | 'halastal' | 'hamburger' | 'fagyi'
  | 'kakao' | 'mango' | 'grillcsirke' | 'banan' | 'halnyars';

export type ClothingSlot = 'fej' | 'felso' | 'also' | 'egyberuha' | 'cipo' | 'kieg';
export type ClothingId =
  | 'masni' | 'sapka' | 'korona' | 'baseball' | 'szalmakalap' | 'szafarikalap' | 'virag'
  | 'polo' | 'ing' | 'pulover' | 'kabat' | 'hokabat' | 'esokabat'
  | 'nadrag' | 'szoknya' | 'rovidnadrag'
  | 'ruha' | 'hercegnoruha'
  | 'cipo' | 'csizma' | 'gumicsizma' | 'szandal'
  | 'sal' | 'napszemuveg' | 'szemuveg' | 'taska' | 'nyaklanc' | 'esernyo';
export interface Worn { id: ClothingId; color: string }
export type Outfit = Partial<Record<ClothingSlot, Worn>>;
export type HairId = 'nincs' | 'frufru' | 'konty' | 'copf' | 'tuskes' | 'gondor' | 'hosszu';

export type FurnitureId =
  | 'agy' | 'huto' | 'mosdo' | 'kad' | 'kanape' | 'tv' | 'konyvespolc' | 'jatekdoboz'
  | 'noveny' | 'lampa' | 'szonyeg' | 'kep';
export type Wallpaper = 'sima' | 'potty' | 'csik' | 'sziv';
export interface PlacedFurniture { uid: string; kind: FurnitureId; x: number }
export interface HomeDecor { wall: string; floor: string; wallpaper: Wallpaper; items: PlacedFurniture[] }

export interface Looks {
  fur: string;
  belly: string;
  pattern: PatternKind;
  patternColor: string;
  eyes: string;
  ears: EarKind;
  mane: boolean;
}

export type Wish =
  | { kind: 'etel'; food: FoodId }
  | { kind: 'ruha'; slot: ClothingSlot }
  | { kind: 'hely'; building: BuildingId }
  | { kind: 'jatek' }
  | { kind: 'rokon'; street: DestinationId };

export interface Pregnancy { fatherId: string; due: number; options: string[]; answer: string; guess: string | null }

export interface Cat {
  id: string;
  name: string;
  species: SpeciesId;
  /** Ha keverék: az apa faja. */
  hybrid: SpeciesId | null;
  sex: Sex;
  age: AgeStage;
  bornMinute: number;
  diet: Diet;
  job: JobId | null;
  looks: Looks;
  outfit: Outfit;
  hair: HairId;
  hairColor: string;
  nails: string | null;
  needs: Needs;
  /** Hány játékperce üres valamelyik csík (betegséghez). */
  emptyMinutes: number;
  sick: boolean;
  homeId: SleepId;
  street: StreetId;
  place: Place;
  x: number;
  targetX: number | null;
  /** Melyik épületbe megy be, ha odaért. */
  goal: BuildingId | null;
  /** Végső úticél egy másik utcán (busszal megy). */
  dest: BuildingId | null;
  activity: Activity;
  spot: SpotId | null;
  spotUntil: number;
  /** Eddig marad ott, ahová a játékos tette (nem megy el dolgozni/sétálni). */
  stayUntil: number;
  facing: 1 | -1;
  bubble: string | null;
  /** Játékperc, amikor a buborék eltűnik. */
  bubbleUntil: number;
  wish: Wish | null;
  nextWishAt: number;
  workedDay: number;
  partnerId: string | null;
  bond: number;
  pregnancy: Pregnancy | null;
  knowledge: number;
  stuck: boolean;
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

export type QuestKind =
  | 'etet_vega' | 'etet_husevo' | 'pontos_koltes' | 'kulonbozo_etel' | 'ora' | 'jokedv'
  | 'fejfedo' | 'recept' | 'ora_iskola' | 'hinta' | 'utazas' | 'termeszet' | 'kivansag';

export interface Quest {
  kind: QuestKind;
  text: string;
  goal: number;
  progress: number;
  done: boolean;
  /** pl. pontos összeg, óra, épület, cél-utca, macska. */
  num?: number;
  building?: BuildingId;
  street?: DestinationId;
  catId?: string;
  failed?: boolean;
}

export type CityEvent =
  | { kind: 'fa'; catId: string }
  | { kind: 'macko'; ownerId: string; building: BuildingId };

export interface DayStats {
  shopSpent: number;
  foodsBought: FoodId[];
}

export interface World {
  version: number;
  /** Összes eltelt játékperc a kezdet óta (0 = 1. nap 00:00). */
  minute: number;
  coins: number;
  stars: number;
  paused: boolean;
  pantry: Partial<Record<FoodId, number>>;
  cats: Cat[];
  nextId: number;
  lastSalaryDay: number;
  questDay: number;
  quests: Quest[];
  today: DayStats;
  ownedClothes: ClothingId[];
  recipes: RecipeId[];
  homes: Record<HomeId, HomeDecor>;
  furnitureStock: FurnitureId[];
  paints: string[];
  event: CityEvent | null;
  eventDay: number;
  /** Úti célonként: melyik nap volt kész a helyi feladat. */
  localDone: Partial<Record<DestinationId, number>>;
  snowman: number;
  sandcastle: number;
  lexicon: string[];
  namingQueue: string[];
  sound: boolean;
  /** A játékosnak szóló üzenetek; a felület kiolvassa és kiírja. */
  inbox: string[];
}

export interface ActionResult {
  ok: boolean;
  message: string;
  sfx?: SfxName;
}

export type SfxName = 'nyam' | 'dorombol' | 'erme' | 'csillag' | 'pop' | 'busz' | 'vonat' | 'repulo' | 'baj';

/** A tick által a felületnek küldött események. */
export type GameEvent =
  | { kind: 'uzenet'; text: string; sfx?: SfxName }
  | { kind: 'utazas'; from: BuildingId; to: StreetId; mode: 'busz' | 'vonat' | 'repulo'; names: string[] };
