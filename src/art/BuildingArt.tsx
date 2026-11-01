import type { ReactElement } from 'react';
import { GROUND_Y, type BuildingDef } from '../data/buildings';
import { shade } from './color';

function Awning({ x, y, w, color }: { x: number; y: number; w: number; color: string }) {
  const n = 6;
  const sw = w / n;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <path key={i} d={`M ${x + i * sw} ${y} h ${sw} v 30 q ${-sw / 2} 14 ${-sw} 0 Z`} fill={i % 2 ? '#fff' : color} />
      ))}
    </g>
  );
}

export function BuildingArt({ def, lit, onOpen }: { def: BuildingDef; lit: boolean; onOpen: () => void }) {
  const { x, width: w, height: h, wall, roof, doorX } = def;
  const top = GROUND_Y - h;
  const edge = shade(wall, -0.35);
  const glass = lit ? '#FFE680' : '#BFE6FF';
  const cols = Math.max(2, Math.floor((w - 40) / 100));
  const gap = (w - cols * 60) / (cols + 1);
  const windows: ReactElement[] = [];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = x + gap + c * (60 + gap);
      const wy = top + 70 + r * 100;
      if (wy + 60 > GROUND_Y - 120 && Math.abs(wx + 30 - doorX) < 80) continue;
      windows.push(
        <g key={`${r}-${c}`}>
          <rect x={wx} y={wy} width={60} height={60} rx={8} fill={glass} stroke={edge} strokeWidth={4} />
          <line x1={wx + 30} y1={wy} x2={wx + 30} y2={wy + 60} stroke={edge} strokeWidth={3} />
        </g>,
      );
    }
  }
  return (
    <g className="building" onClick={onOpen}>
      {def.style === 'haz' ? (
        <polygon points={`${x - 20},${top + 12} ${x + w / 2},${top - 80} ${x + w + 20},${top + 12}`} fill={roof} stroke={shade(roof, -0.3)} strokeWidth={4} strokeLinejoin="round" />
      ) : (
        <rect x={x - 10} y={top - 24} width={w + 20} height={36} rx={8} fill={roof} />
      )}
      <rect x={x} y={top} width={w} height={h} rx={8} fill={wall} stroke={edge} strokeWidth={4} />
      {windows}
      {def.style === 'bolt' && <Awning x={doorX - 90} y={GROUND_Y - 150} w={180} color={roof} />}
      <rect x={doorX - 36} y={GROUND_Y - 110} width={72} height={110} rx={10} fill={shade(roof, -0.15)} stroke={edge} strokeWidth={4} />
      <circle cx={doorX + 22} cy={GROUND_Y - 55} r={5} fill="#FFD54F" />
      <g transform={`translate(${x + w / 2} ${def.style === 'haz' ? top - 20 : top + 22})`}>
        <rect x={-w * 0.42} y={-26} width={w * 0.84} height={46} rx={14} fill="#fffaf2" stroke={edge} strokeWidth={3} />
        <text x={0} y={7} textAnchor="middle" fontSize={24} fontWeight={800} fill="#3b2a20">{def.emoji} {def.name}</text>
      </g>
    </g>
  );
}
