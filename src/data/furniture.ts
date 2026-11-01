import type { FurnitureId, HomeDecor, HomeId, Wallpaper } from '../sim/types';

export interface FurnitureDef { name: string; emoji: string; price: number; width: number; height: number }

export const FURNITURE: Record<FurnitureId, FurnitureDef> = {
  agy: { name: 'Ágy', emoji: '🛏️', price: 6, width: 240, height: 140 },
  huto: { name: 'Hűtő', emoji: '🧊', price: 6, width: 100, height: 230 },
  mosdo: { name: 'Mosdó', emoji: '🚰', price: 4, width: 150, height: 170 },
  kad: { name: 'Kád', emoji: '🛁', price: 5, width: 200, height: 100 },
  kanape: { name: 'Kanapé', emoji: '🛋️', price: 5, width: 220, height: 110 },
  tv: { name: 'Tévé', emoji: '📺', price: 5, width: 140, height: 150 },
  konyvespolc: { name: 'Könyvespolc', emoji: '📚', price: 4, width: 120, height: 220 },
  jatekdoboz: { name: 'Játékdoboz', emoji: '⚽', price: 3, width: 90, height: 80 },
  noveny: { name: 'Növény', emoji: '🪴', price: 2, width: 70, height: 120 },
  lampa: { name: 'Lámpa', emoji: '💡', price: 2, width: 60, height: 200 },
  szonyeg: { name: 'Szőnyeg', emoji: '🟫', price: 2, width: 220, height: 14 },
  kep: { name: 'Kép', emoji: '🖼️', price: 2, width: 110, height: 90 },
};
export const FURNITURE_IDS = Object.keys(FURNITURE) as FurnitureId[];

export const WALLPAPERS: Array<[Wallpaper, string]> = [['sima', 'Sima'], ['potty', 'Pöttyös'], ['csik', 'Csíkos'], ['sziv', 'Szíves']];
export const START_PAINTS = ['#F8BBD0', '#C8E6C9', '#FFFDE7', '#FFFFFF', '#C99A6B'];
export const SHOP_PAINTS = ['#BBDEFB', '#E1BEE7', '#FFE0B2', '#FFCDD2', '#B2EBF2', '#DCEDC8', '#FFF59D', '#8D6E63', '#90A4AE', '#4DB6AC'];
export const PAINT_PRICE = 2;

const f = (homeId: string, list: Array<[FurnitureId, number]>) =>
  list.map(([kind, x], i) => ({ uid: `${homeId}-${i}`, kind, x }));

export function defaultHomes(): Record<HomeId, HomeDecor> {
  return {
    otthon1: {
      wall: '#F8BBD0', floor: '#C99A6B', wallpaper: 'potty',
      items: f('otthon1', [['kep', 520], ['huto', 250], ['mosdo', 405], ['jatekdoboz', 600], ['agy', 800]]),
    },
    otthon2: {
      wall: '#C8E6C9', floor: '#C99A6B', wallpaper: 'csik',
      items: f('otthon2', [['noveny', 190], ['huto', 280], ['mosdo', 430], ['kanape', 620], ['agy', 850]]),
    },
    otthon3: { wall: '#FFFFFF', floor: '#C99A6B', wallpaper: 'sima', items: [] },
  };
}
