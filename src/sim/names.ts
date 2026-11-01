import type { Sex } from './types';

const GIRL = ['Mira', 'Luna', 'Csillag', 'Bogyó', 'Pötty', 'Málna', 'Szofi', 'Panna', 'Mazsola', 'Hópihe', 'Zsuzsi', 'Bella', 'Mogyi', 'Virág'];
const BOY = ['Bruno', 'Leó', 'Morzsa', 'Tappancs', 'Mogyoró', 'Bajusz', 'Bence', 'Pamacs', 'Zserbó', 'Csoki', 'Maci', 'Tomi', 'Kópé', 'Villám'];

export function randomName(sex: Sex, rng: () => number = Math.random): string {
  const list = sex === 'lany' ? GIRL : BOY;
  return list[Math.floor(rng() * list.length)];
}
