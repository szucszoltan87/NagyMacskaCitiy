import type { ReactElement } from 'react';
import { GROUND_Y, type BuildingDef } from '../data/buildings';
import { lineColor, shade } from './color';

function archPath(x: number, y: number, w: number, h: number): string {
  const r = w / 2;
  return `M ${x} ${y + h} L ${x} ${y + r} A ${r} ${r} 0 0 1 ${x + w} ${y + r} L ${x + w} ${y + h} Z`;
}

function Window({ x, y, lit, line, accent }: { x: number; y: number; lit: boolean; line: string; accent: string }) {
  const w = 58;
  const h = 70;
  return (
    <g>
      <path d={archPath(x, y, w, h)} fill={lit ? '#FFE9A8' : '#CDEBFF'} stroke={line} strokeWidth={4} strokeLinejoin="round" />
      {!lit && <path d={`M ${x + 12} ${y + 50} L ${x + 30} ${y + 22}`} stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.8} />}
      <path d={`M ${x + 2} ${y + 26} Q ${x + 14} ${y + 30} ${x + 12} ${y + 62} L ${x + 2} ${y + 62} Z`} fill={accent} opacity={0.9} />
      <path d={`M ${x + w - 2} ${y + 26} Q ${x + w - 14} ${y + 30} ${x + w - 12} ${y + 62} L ${x + w - 2} ${y + 62} Z`} fill={accent} opacity={0.9} />
      <rect x={x - 6} y={y + h - 2} width={w + 12} height={14} rx={6} fill="#C99A8B" stroke={line} strokeWidth={3} />
      {[0, 1, 2].map((k) => (
        <circle key={k} cx={x + 8 + k * 21} cy={y + h - 4} r={7} fill={['#FF9EBE', '#FFE58F', '#C9B6F2'][k]} stroke="#fff" strokeWidth={2} />
      ))}
    </g>
  );
}

function Shingles({ id, points, roof }: { id: string; points: string; roof: string }) {
  const rows: ReactElement[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 26; c++) {
      rows.push(<circle key={`${r}-${c}`} cx={c * 28 + (r % 2) * 14} cy={r * 20} r={14} fill={shade(roof, 0.12)} stroke={shade(roof, -0.18)} strokeWidth={2} />);
    }
  }
  return (
    <>
      <defs><clipPath id={id}><polygon points={points} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>{rows}</g>
    </>
  );
}

function Bush({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} ${GROUND_Y})`}>
      <path d="M -16 0 L -12 -22 L 12 -22 L 16 0 Z" fill="#FFB38A" stroke="#D9825B" strokeWidth={2.5} strokeLinejoin="round" />
      <circle cy={-36} r={20} fill="#9EDFC0" stroke="#5CC3A0" strokeWidth={2.5} />
      <circle cx={-7} cy={-42} r={4} fill="#FF9EBE" />
      <circle cx={8} cy={-32} r={4} fill="#FFE58F" />
    </g>
  );
}

export function BuildingArt({ def, lit, onOpen }: { def: BuildingDef; lit: boolean; onOpen: () => void }) {
  const { x, width: w, height: h, wall, roof, doorX } = def;
  const top = GROUND_Y - h;
  const line = lineColor(wall);
  const accent = shade(roof, 0.55);
  const cols = Math.max(2, Math.floor((w - 40) / 100));
  const gap = (w - cols * 58) / (cols + 1);
  const windows: ReactElement[] = [];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = x + gap + c * (58 + gap);
      const wy = top + 72 + r * 104;
      if (wy + 70 > GROUND_Y - 125 && Math.abs(wx + 29 - doorX) < 84) continue;
      if (wy + 84 > GROUND_Y) continue;
      windows.push(<Window key={`${r}-${c}`} x={wx} y={wy} lit={lit} line={line} accent={accent} />);
    }
  }
  const roofPts = `${x - 24},${top + 14} ${x + w / 2},${top - 92} ${x + w + 24},${top + 14}`;
  const shingleId = `sh-${def.id}`;
  return (
    <g className="building" onClick={onOpen}>
      {def.style === 'haz' ? (
        <g>
          <rect x={x + w * 0.68} y={top - 78} width={34} height={60} rx={6} fill={shade(roof, -0.1)} stroke={shade(roof, -0.4)} strokeWidth={3} />
          <polygon points={roofPts} fill={roof} stroke={shade(roof, -0.35)} strokeWidth={5} strokeLinejoin="round" />
          <g transform={`translate(${x - 24} ${top - 92})`}>
            <Shingles id={shingleId} points={`0,106 ${w / 2 + 24},0 ${w + 48},106`} roof={roof} />
          </g>
          <polygon points={roofPts} fill="none" stroke={shade(roof, -0.35)} strokeWidth={5} strokeLinejoin="round" />
        </g>
      ) : (
        <g>
          <rect x={x - 12} y={top - 26} width={w + 24} height={40} rx={14} fill={roof} stroke={shade(roof, -0.35)} strokeWidth={4} />
          {Array.from({ length: Math.floor((w + 24) / 26) }, (_, i) => (
            <circle key={i} cx={x - 12 + 13 + i * 26} cy={top + 14} r={13} fill={roof} stroke={shade(roof, -0.35)} strokeWidth={3} />
          ))}
        </g>
      )}
      <rect x={x} y={top} width={w} height={h} rx={16} fill={wall} stroke={line} strokeWidth={4} />
      {def.style === 'bolt' && <rect x={x} y={top + 14} width={w} height={8} fill={shade(wall, -0.06)} />}
      {windows}
      {def.style === 'bolt' && (
        <g>
          {Array.from({ length: 7 }, (_, i) => {
            const sw = 200 / 7;
            const ax = doorX - 100 + i * sw;
            return <path key={i} d={`M ${ax} ${GROUND_Y - 160} h ${sw} v 26 a ${sw / 2} ${sw / 2} 0 0 1 ${-sw} 0 Z`} fill={i % 2 ? '#fff' : roof} stroke={shade(roof, -0.35)} strokeWidth={2} />;
          })}
        </g>
      )}
      <path d={archPath(doorX - 38, GROUND_Y - 118, 76, 118)} fill={shade(roof, 0.1)} stroke={line} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M ${doorX} ${GROUND_Y - 84} c -6 -8 -16 -2 -10 6 l 10 9 l 10 -9 c 6 -8 -4 -14 -10 -6 Z`} fill="#fff" opacity={0.85} />
      <circle cx={doorX + 22} cy={GROUND_Y - 50} r={5.5} fill="#FFE58F" stroke={line} strokeWidth={2} />
      <rect x={doorX - 46} y={GROUND_Y - 6} width={92} height={10} rx={5} fill="#FF9EBE" />
      <Bush x={doorX - 66} />
      <Bush x={doorX + 66} />
      <g transform={`translate(${x + w / 2} ${def.style === 'haz' ? top - 22 : top - 6})`}>
        <path
          d={`M ${-w * 0.44} -24 h ${w * 0.88} l -12 22 l 12 22 h ${-w * 0.88} l 12 -22 Z`}
          fill="#FFF8EE" stroke={line} strokeWidth={3} strokeLinejoin="round"
        />
        <text x={0} y={8} textAnchor="middle" fontSize={24} fontWeight={600} fill="#5B3350">{def.emoji} {def.name}</text>
      </g>
    </g>
  );
}
