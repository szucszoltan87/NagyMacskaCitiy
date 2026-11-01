import type { BuildingId, Climate, DestinationId, HomeId, JobId, LodgeId, Place, SleepId, StreetId } from '../sim/types';

export type BuildingKind =
  | 'otthon' | 'szallas' | 'bolt' | 'etterem' | 'korhaz' | 'ruhabolt' | 'fodrasz' | 'ovoda' | 'iskola'
  | 'park' | 'strand' | 'butorbolt' | 'tuzoltosag' | 'rendorseg' | 'busz' | 'vasut' | 'repter' | 'helyibolt' | 'muhely';

export interface BuildingDef {
  id: BuildingId | 'muhely';
  name: string;
  emoji: string;
  kind: BuildingKind;
  style: 'haz' | 'bolt' | 'kert';
  street: StreetId;
  x: number;
  width: number;
  height: number;
  doorX: number;
  wall: string;
  roof: string;
  /** Ennyi csillag kell a megnyitáshoz. */
  unlock: number;
  /** Ilyen szakmájú dolgozó kell hozzá, és ide jár dolgozni. */
  job: JobId | null;
  /** Maguktól is bemennek-e ide a macskák sétálás közben. */
  wander: boolean;
}

export interface StreetDef {
  id: StreetId;
  name: string;
  emoji: string;
  width: number;
  unlock: number;
  scenery: 'varos' | 'park' | 'ho' | 'szavanna' | 'dzsungel';
  climate: Climate | null;
}

// Utca-jelenet (SVG egységek)
export const SCENE_HEIGHT = 700;
export const GROUND_Y = 560;
export const SIDEWALK_Y = 630; // a macskák talpa
export const SIDEWALK_BOTTOM = 660;

// Szoba-jelenet
export const ROOM_WIDTH = 1000;
export const ROOM_HEIGHT = 800;
export const ROOM_FLOOR_Y = 560;
export const ROOM_DOOR_X = 90;
export const LODGE_BED_X = 800;

export const STREETS: Record<StreetId, StreetDef> = {
  belvaros: { id: 'belvaros', name: 'Belváros', emoji: '🏙️', width: 6100, unlock: 0, scenery: 'varos', climate: null },
  parkvaros: { id: 'parkvaros', name: 'Parkváros', emoji: '🌳', width: 4760, unlock: 8, scenery: 'park', climate: null },
  hoshegy: { id: 'hoshegy', name: 'Hós-hegy', emoji: '🏔️', width: 2400, unlock: 12, scenery: 'ho', climate: 'hideg' },
  szavanna: { id: 'szavanna', name: 'Szavanna', emoji: '🦒', width: 2400, unlock: 15, scenery: 'szavanna', climate: 'meleg' },
  oserdo: { id: 'oserdo', name: 'Őserdő', emoji: '🌴', width: 2400, unlock: 15, scenery: 'dzsungel', climate: 'esos' },
};
export const STREET_IDS = Object.keys(STREETS) as StreetId[];
export const DESTINATIONS: DestinationId[] = ['hoshegy', 'szavanna', 'oserdo'];
export const CITY_STREETS: StreetId[] = ['belvaros', 'parkvaros'];

const b = (
  id: BuildingDef['id'], name: string, emoji: string, kind: BuildingKind, style: BuildingDef['style'], street: StreetId,
  x: number, width: number, height: number, wall: string, roof: string,
  opts: { unlock?: number; job?: JobId; wander?: boolean } = {},
): BuildingDef => ({
  id, name, emoji, kind, style, street, x, width, height, doorX: x + width / 2, wall, roof,
  unlock: opts.unlock ?? 0, job: opts.job ?? null, wander: opts.wander ?? true,
});

export const BUILDINGS: Record<BuildingId, BuildingDef> = {
  // Belváros
  otthon1: b('otthon1', 'Rózsa-ház', '🏠', 'otthon', 'haz', 'belvaros', 100, 380, 330, '#F8BBD0', '#C2185B'),
  bolt: b('bolt', 'Bolt', '🛒', 'bolt', 'bolt', 'belvaros', 600, 380, 300, '#FFE082', '#F57F17', { job: 'elado' }),
  etterem: b('etterem', 'Étterem', '🍽️', 'etterem', 'bolt', 'belvaros', 1100, 420, 340, '#FFCCBC', '#BF360C', { job: 'szakacs' }),
  korhaz: b('korhaz', 'Kórház', '🏥', 'korhaz', 'bolt', 'belvaros', 1640, 440, 380, '#E3F2FD', '#1565C0', { job: 'orvos', wander: false }),
  otthon2: b('otthon2', 'Menta-ház', '🏡', 'otthon', 'haz', 'belvaros', 2200, 380, 330, '#C8E6C9', '#2E7D32'),
  ruhabolt: b('ruhabolt', 'Ruhabolt', '👗', 'ruhabolt', 'bolt', 'belvaros', 2700, 380, 300, '#F3E5F5', '#8E24AA', { unlock: 2, job: 'elado' }),
  fodrasz: b('fodrasz', 'Fodrász', '💇', 'fodrasz', 'bolt', 'belvaros', 3200, 340, 290, '#FCE4EC', '#D81B60', { unlock: 4, job: 'fodrasz' }),
  ovoda: b('ovoda', 'Óvoda', '🧸', 'ovoda', 'haz', 'belvaros', 3660, 380, 300, '#FFF9C4', '#F9A825', { unlock: 6, job: 'ovono', wander: false }),
  iskola: b('iskola', 'Iskola', '🏫', 'iskola', 'bolt', 'belvaros', 4160, 460, 380, '#FFE0B2', '#E65100', { unlock: 6, job: 'tanar', wander: false }),
  busz_bv: b('busz_bv', 'Buszmegálló', '🚌', 'busz', 'kert', 'belvaros', 4740, 300, 260, '#B3E5FC', '#0277BD', { unlock: 8, job: 'buszsofor', wander: false }),
  vasut_bv: b('vasut_bv', 'Vasútállomás', '🚂', 'vasut', 'bolt', 'belvaros', 5160, 480, 340, '#D7CCC8', '#5D4037', { unlock: 12, job: 'mozdonyvezeto', wander: false }),
  // Parkváros
  busz_pv: b('busz_pv', 'Buszmegálló', '🚌', 'busz', 'kert', 'parkvaros', 100, 300, 260, '#B3E5FC', '#0277BD', { unlock: 8, wander: false }),
  park: b('park', 'Park és játszótér', '🌳', 'park', 'kert', 'parkvaros', 520, 600, 240, '#C5E1A5', '#558B2F', { unlock: 8 }),
  strand: b('strand', 'Strand', '🏖️', 'strand', 'kert', 'parkvaros', 1240, 560, 220, '#FFF3C4', '#0288D1', { unlock: 8 }),
  otthon3: b('otthon3', 'Napraforgó-ház', '🌻', 'otthon', 'haz', 'parkvaros', 1920, 380, 330, '#FFFDE7', '#F9A825', { unlock: 8 }),
  butorbolt: b('butorbolt', 'Bútorbolt', '🛋️', 'butorbolt', 'bolt', 'parkvaros', 2420, 400, 300, '#D7CCC8', '#6D4C41', { unlock: 10, job: 'elado' }),
  tuzoltosag: b('tuzoltosag', 'Tűzoltóság', '🚒', 'tuzoltosag', 'bolt', 'parkvaros', 2940, 420, 340, '#FFCDD2', '#C62828', { unlock: 10, job: 'tuzolto', wander: false }),
  rendorseg: b('rendorseg', 'Rendőrség', '🚓', 'rendorseg', 'bolt', 'parkvaros', 3480, 400, 320, '#C5CAE9', '#283593', { unlock: 10, job: 'rendor', wander: false }),
  repter_pv: b('repter_pv', 'Repülőtér', '✈️', 'repter', 'bolt', 'parkvaros', 4000, 620, 360, '#ECEFF1', '#455A64', { unlock: 15, job: 'pilota', wander: false }),
  // Hós-hegy
  vasut_hh: b('vasut_hh', 'Hós-hegyi állomás', '🚂', 'vasut', 'bolt', 'hoshegy', 100, 440, 320, '#D7CCC8', '#5D4037', { unlock: 12, wander: false }),
  kunyho: b('kunyho', 'Hegyi kunyhó', '🛖', 'szallas', 'haz', 'hoshegy', 700, 420, 330, '#BCAAA4', '#4E342E', { unlock: 12 }),
  sibolt: b('sibolt', 'Sí-bolt', '⛷️', 'helyibolt', 'bolt', 'hoshegy', 1260, 380, 300, '#E1F5FE', '#0277BD', { unlock: 12 }),
  // Szavanna
  repter_sz: b('repter_sz', 'Szavannai reptér', '✈️', 'repter', 'bolt', 'szavanna', 100, 460, 320, '#ECEFF1', '#455A64', { unlock: 15, wander: false }),
  szafaritabor: b('szafaritabor', 'Szafari-tábor', '⛺', 'szallas', 'haz', 'szavanna', 720, 440, 300, '#FFE0B2', '#8D6E63', { unlock: 15 }),
  szafaribolt: b('szafaribolt', 'Szafari-bolt', '🧭', 'helyibolt', 'bolt', 'szavanna', 1300, 380, 290, '#FFF8E1', '#A1887F', { unlock: 15 }),
  // Őserdő
  repter_os: b('repter_os', 'Őserdei reptér', '✈️', 'repter', 'bolt', 'oserdo', 100, 460, 320, '#ECEFF1', '#455A64', { unlock: 15, wander: false }),
  fakunyho: b('fakunyho', 'Fakunyhó', '🛖', 'szallas', 'haz', 'oserdo', 720, 420, 330, '#A1887F', '#33691E', { unlock: 15 }),
  dzsungelbolt: b('dzsungelbolt', 'Dzsungel-bolt', '🦜', 'helyibolt', 'bolt', 'oserdo', 1300, 380, 290, '#DCEDC8', '#2E7D32', { unlock: 15 }),
};
export const BUILDING_IDS = Object.keys(BUILDINGS) as BuildingId[];

export const WORKSHOP = b('muhely', 'Macskaműhely', '🛠️', 'muhely', 'haz', 'belvaros', 5760, 260, 280, '#D1C4E9', '#5E35B1');

export const HOME_IDS: HomeId[] = ['otthon1', 'otthon2', 'otthon3'];
export const LODGE_OF: Record<DestinationId, LodgeId> = { hoshegy: 'kunyho', szavanna: 'szafaritabor', oserdo: 'fakunyho' };
export const BUS_STOP: Partial<Record<StreetId, BuildingId>> = { belvaros: 'busz_bv', parkvaros: 'busz_pv' };

export const WORKPLACE: Record<JobId, BuildingId> = {
  orvos: 'korhaz', szakacs: 'etterem', elado: 'bolt', tanar: 'iskola', ovono: 'ovoda', tuzolto: 'tuzoltosag',
  rendor: 'rendorseg', fodrasz: 'fodrasz', buszsofor: 'busz_bv', mozdonyvezeto: 'vasut_bv', pilota: 'repter_pv',
};

export function isHome(place: Place): place is HomeId {
  return place === 'otthon1' || place === 'otthon2' || place === 'otthon3';
}

export function isLodge(place: Place): place is LodgeId {
  return place === 'kunyho' || place === 'szafaritabor' || place === 'fakunyho';
}

export function isSleepPlace(place: Place): place is SleepId {
  return isHome(place) || isLodge(place);
}

export function isDestination(street: StreetId): street is DestinationId {
  return street === 'hoshegy' || street === 'szavanna' || street === 'oserdo';
}

export function placeName(place: Place, street?: StreetId): string {
  if (place === 'utca') return street ? `${STREETS[street].emoji} ${STREETS[street].name}, utca` : '🛣️ Utca';
  const def = BUILDINGS[place];
  return `${def.emoji} ${def.name}`;
}
