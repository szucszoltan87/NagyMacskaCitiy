const toRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (rgb: number[]) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

/** amount: -1 (fekete) … 0 (változatlan) … 1 (fehér) */
export function shade(hex: string, amount: number): string {
  const target = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  return toHex(toRgb(hex).map((v) => (target - v) * p + v));
}

/** Két szín keveréke: t = 0 → a, t = 1 → b. */
export function mix(a: string, b: string, t: number): string {
  const ra = toRgb(a);
  const rb = toRgb(b);
  return toHex(ra.map((v, i) => v + (rb[i] - v) * t));
}

/** Kontúrszín: a bunda sötétebb árnyalata, egy kis szilvás-barnával – sosem fekete. */
export function lineColor(fur: string): string {
  return mix(shade(fur, -0.5), '#5B3350', 0.4);
}
