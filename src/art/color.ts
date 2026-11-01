/** amount: -1 (fekete) … 0 (változatlan) … 1 (fehér) */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const target = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  const mix = (v: number) => Math.round((target - v) * p + v);
  const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(mix);
  return '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');
}
