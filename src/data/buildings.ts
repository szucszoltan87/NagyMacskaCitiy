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
