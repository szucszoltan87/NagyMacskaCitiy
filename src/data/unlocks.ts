export interface Unlock { stars: number; text: string; hint: string }

export const UNLOCKS: Unlock[] = [
  { stars: 2, text: '👗 Ruhabolt', hint: 'Öltöztesd fel a macskákat! A ruhaboltban eladó dolgozik.' },
  { stars: 4, text: '💇 Fodrász', hint: 'Frizura és csillogó karom! Ehhez fodrász kell.' },
  { stars: 6, text: '🧸 Óvoda és 🏫 Iskola', hint: 'Ide óvónő és tanár kell.' },
  { stars: 8, text: '🚌 Busz és 🌳 Parkváros', hint: 'Park, strand, új ház! A buszhoz buszsofőr kell.' },
  { stars: 10, text: '🛋️ Bútorbolt, 🚒 Tűzoltóság, 🚓 Rendőrség', hint: 'Rendezd be a házakat! Kellhet tűzoltó és rendőr is.' },
  { stars: 12, text: '🚂 Vonat a Hós-hegyre', hint: 'Ehhez mozdonyvezető kell. Vigyél meleg ruhát!' },
  { stars: 15, text: '✈️ Repülő a Szavannára és az Őserdőbe', hint: 'Ehhez pilóta kell. Gondold át, mit vegyenek fel!' },
];

export function nextUnlock(stars: number): Unlock | null {
  return UNLOCKS.find((u) => u.stars > stars) ?? null;
}
