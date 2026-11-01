import type { BuildingId, Climate, ClothingId, ClothingSlot, HairId } from '../sim/types';

export interface ClothingDef {
  name: string;
  emoji: string;
  slot: ClothingSlot;
  price: number;
  color: string;
  protects: Climate | null;
  shops: BuildingId[];
}

const R: BuildingId[] = ['ruhabolt'];
const c = (name: string, emoji: string, slot: ClothingSlot, price: number, color: string, protects: Climate | null = null, shops: BuildingId[] = R): ClothingDef =>
  ({ name, emoji, slot, price, color, protects, shops });

export const CLOTHES: Record<ClothingId, ClothingDef> = {
  masni: c('Masni', '🎀', 'fej', 2, '#EC407A'),
  sapka: c('Sapka', '🧶', 'fej', 3, '#42A5F5', 'hideg', ['ruhabolt', 'sibolt']),
  korona: c('Korona', '👑', 'fej', 5, '#FFC107'),
  baseball: c('Baseballsapka', '🧢', 'fej', 3, '#E53935'),
  szalmakalap: c('Szalmakalap', '👒', 'fej', 3, '#E6C068', 'meleg'),
  szafarikalap: c('Szafari-kalap', '🤠', 'fej', 3, '#C8A165', 'meleg', ['szafaribolt']),
  virag: c('Virág', '🌸', 'fej', 1, '#F48FB1'),
  polo: c('Póló', '👕', 'felso', 2, '#66BB6A'),
  ing: c('Ing', '👔', 'felso', 3, '#90CAF9'),
  pulover: c('Pulóver', '🧥', 'felso', 4, '#AB47BC'),
  kabat: c('Téli kabát', '🧥', 'felso', 6, '#EF5350', 'hideg'),
  hokabat: c('Hókabát', '🧥', 'felso', 5, '#FFFFFF', 'hideg', ['sibolt']),
  esokabat: c('Esőkabát', '🧥', 'felso', 5, '#FFEB3B', 'esos', ['ruhabolt', 'dzsungelbolt']),
  nadrag: c('Nadrág', '👖', 'also', 3, '#3F51B5'),
  szoknya: c('Szoknya', '🩱', 'also', 3, '#F06292'),
  rovidnadrag: c('Rövidnadrág', '🩳', 'also', 2, '#FFA726', null, ['ruhabolt', 'szafaribolt']),
  ruha: c('Ruha', '👗', 'egyberuha', 4, '#BA68C8'),
  hercegnoruha: c('Hercegnőruha', '👸', 'egyberuha', 7, '#F8BBD0'),
  cipo: c('Cipő', '👟', 'cipo', 3, '#5C6BC0'),
  csizma: c('Csizma', '🥾', 'cipo', 4, '#795548', 'hideg', ['ruhabolt', 'sibolt']),
  gumicsizma: c('Gumicsizma', '👢', 'cipo', 3, '#43A047', 'esos', ['ruhabolt', 'dzsungelbolt']),
  szandal: c('Szandál', '🩴', 'cipo', 2, '#FF8A65', 'meleg', ['ruhabolt', 'szafaribolt']),
  sal: c('Sál', '🧣', 'kieg', 2, '#E53935', 'hideg', ['ruhabolt', 'sibolt']),
  napszemuveg: c('Napszemüveg', '🕶️', 'kieg', 3, '#263238', 'meleg', ['ruhabolt', 'szafaribolt']),
  szemuveg: c('Szemüveg', '👓', 'kieg', 3, '#6D4C41'),
  taska: c('Táska', '👜', 'kieg', 3, '#8D6E63'),
  nyaklanc: c('Nyaklánc', '📿', 'kieg', 2, '#FFD54F'),
  esernyo: c('Esernyő', '☂️', 'kieg', 3, '#7E57C2', 'esos', ['dzsungelbolt']),
};
export const CLOTHING_IDS = Object.keys(CLOTHES) as ClothingId[];

export const SLOT_LABEL: Record<ClothingSlot, string> = {
  fej: '🎩 Fejre', felso: '👕 Felső', also: '👖 Alsó', egyberuha: '👗 Egyberuha', cipo: '👟 Cipő', kieg: '👜 Kiegészítő',
};
export const SLOTS: ClothingSlot[] = ['fej', 'felso', 'also', 'egyberuha', 'cipo', 'kieg'];

export const PALETTE = ['#EF5350', '#EC407A', '#AB47BC', '#5C6BC0', '#42A5F5', '#26A69A', '#66BB6A', '#FFEB3B', '#FFA726', '#8D6E63', '#FFFFFF', '#263238'];

export const HAIR_LABEL: Record<HairId, string> = {
  nincs: '✂️ Nincs', frufru: '🌀 Frufru', konty: '🍡 Konty', copf: '🎀 Copfok', tuskes: '⚡ Tüskés', gondor: '☁️ Göndör', hosszu: '💫 Hosszú',
};
export const HAIR_IDS = Object.keys(HAIR_LABEL) as HairId[];
export const SALON_PRICE = 2;

export const CLIMATE_TEXT: Record<Climate, { need: string; complaint: string }> = {
  hideg: { need: 'sapka, sál, kabát vagy csizma', complaint: 'Brrr, fázom! 🥶' },
  meleg: { need: 'kalap, napszemüveg vagy szandál', complaint: 'Jaj, de meleg van! 🥵' },
  esos: { need: 'esőkabát, esernyő vagy gumicsizma', complaint: 'Elázom! 🌧️' },
};
