import { memo, type ReactElement } from 'react';
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

function Garden({ def }: { def: BuildingDef }) {
  const { x, width: w, doorX, wall, roof, kind } = def;
  const G = GROUND_Y;
  const line = lineColor(roof);
  return (
    <g>
      {kind === 'park' && (
        <g>
          <path d={`M ${x + 60} ${G} L ${x + 90} ${G - 170} L ${x + 210} ${G - 170} L ${x + 240} ${G}`} stroke="#E57AA0" strokeWidth={8} fill="none" strokeLinejoin="round" />
          <line x1={x + 130} y1={G - 170} x2={x + 130} y2={G - 70} stroke="#B48AA6" strokeWidth={3} />
          <line x1={x + 170} y1={G - 170} x2={x + 170} y2={G - 70} stroke="#B48AA6" strokeWidth={3} />
          <rect x={x + 120} y={G - 72} width={60} height={10} rx={5} fill="#FFE58F" stroke="#E8B04B" strokeWidth={2} />
          <path d={`M ${x + w - 220} ${G} L ${x + w - 220} ${G - 150} L ${x + w - 180} ${G - 150} Q ${x + w - 120} ${G - 140} ${x + w - 60} ${G - 20} L ${x + w - 60} ${G}`} fill="none" stroke="#5CC3A0" strokeWidth={10} strokeLinejoin="round" />
          <rect x={x + w - 228} y={G - 160} width={52} height={14} rx={6} fill="#A8E6CF" />
          <circle cx={x + w - 300} cy={G - 120} r={60} fill="#9EDFC0" stroke="#5CC3A0" strokeWidth={4} />
        </g>
      )}
      {kind === 'strand' && (
        <g>
          <path d={`M ${x} ${G - 80} Q ${x + w / 4} ${G - 96} ${x + w / 2} ${G - 80} T ${x + w} ${G - 80} L ${x + w} ${G} L ${x} ${G} Z`} fill="#7FD3F2" />
          <path d={`M ${x + 20} ${G - 70} q 20 -10 40 0 M ${x + 200} ${G - 66} q 20 -10 40 0 M ${x + 380} ${G - 72} q 20 -10 40 0`} stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" />
          <rect x={x} y={G - 34} width={w} height={34} fill="#FFE9B0" />
          <line x1={x + 120} y1={G} x2={x + 120} y2={G - 150} stroke="#B98673" strokeWidth={5} />
          <path d={`M ${x + 40} ${G - 140} Q ${x + 120} ${G - 210} ${x + 200} ${G - 140} Z`} fill="#FF9EBE" stroke="#E57AA0" strokeWidth={3} />
          <path d={`M ${x + 120} ${G - 190} L ${x + 80} ${G - 140} M ${x + 120} ${G - 190} L ${x + 160} ${G - 140}`} stroke="#fff" strokeWidth={6} />
        </g>
      )}
      {kind === 'busz' && (
        <g>
          <rect x={x + 20} y={G - 190} width={w - 40} height={18} rx={9} fill={roof} stroke={line} strokeWidth={3} />
          <rect x={x + 30} y={G - 172} width={8} height={172} fill={line} />
          <rect x={x + w - 38} y={G - 172} width={8} height={172} fill={line} />
          <rect x={x + 44} y={G - 160} width={w - 88} height={110} rx={10} fill="#E3F6FF" opacity={0.7} stroke="#BDE6FF" strokeWidth={3} />
          <rect x={x + 60} y={G - 44} width={w - 120} height={12} rx={6} fill="#FFB38A" />
        </g>
      )}
      <g fill="#fff" stroke={shade(wall, -0.25)} strokeWidth={2.5}>
        {Array.from({ length: Math.floor(w / 26) }, (_, i) => {
          const px = x + i * 26 + 6;
          if (Math.abs(px + 7 - doorX) < 50) return null;
          return <path key={i} d={`M ${px} ${G} L ${px} ${G - 46} L ${px + 7} ${G - 56} L ${px + 14} ${G - 46} L ${px + 14} ${G} Z`} />;
        })}
        <rect x={x} y={G - 36} width={w} height={8} rx={4} />
      </g>
      <path d={`M ${doorX - 48} ${G} L ${doorX - 48} ${G - 120} Q ${doorX} ${G - 175} ${doorX + 48} ${G - 120} L ${doorX + 48} ${G}`} fill="none" stroke={roof} strokeWidth={10} strokeLinecap="round" />
      {[-30, 0, 30].map((d) => <circle key={d} cx={doorX + d} cy={G - 150 + Math.abs(d) * 0.6} r={7} fill={['#FF9EBE', '#FFE58F', '#A8E6CF'][(d / 30 + 1)]} stroke="#fff" strokeWidth={2} />)}
    </g>
  );
}

function LockBadge({ def, stars }: { def: BuildingDef; stars: number }) {
  return (
    <g pointerEvents="none">
      <rect x={def.x} y={GROUND_Y - def.height} width={def.width} height={def.height} rx={16} fill="#EDE4FF" opacity={0.72} />
      <g transform={`translate(${def.x + def.width / 2} ${GROUND_Y - def.height / 2})`}>
        <circle r={46} fill="#fff" stroke="#C9B6F2" strokeWidth={5} />
        <text y={-4} textAnchor="middle" fontSize={34}>🔒</text>
        <text y={30} textAnchor="middle" fontSize={22} fontWeight={700} fill="#5B3350">{stars} ⭐</text>
      </g>
    </g>
  );
}

function BuildingArtRaw({ def, lit, onOpen, locked = false }: { def: BuildingDef; lit: boolean; onOpen: () => void; locked?: boolean }) {
  if (def.style === 'kert') {
    return (
      <g className="building" onClick={onOpen}>
        <Garden def={def} />
        <g transform={`translate(${def.x + def.width / 2} ${GROUND_Y - def.height + 10})`}>
          <path d={`M ${-def.width * 0.4} -24 h ${def.width * 0.8} l -12 22 l 12 22 h ${-def.width * 0.8} l 12 -22 Z`} fill="#FFF8EE" stroke={lineColor(def.roof)} strokeWidth={3} strokeLinejoin="round" />
          <text x={0} y={8} textAnchor="middle" fontSize={24} fontWeight={600} fill="#5B3350">{def.emoji} {def.name}</text>
        </g>
        {locked && <LockBadge def={def} stars={def.unlock} />}
      </g>
    );
  }
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
      {locked && <LockBadge def={def} stars={def.unlock} />}
    </g>
  );
}

/** Az onOpen-t nem hasonlítjuk: a hívó a friss állapotot a store-ból olvassa. */
export const BuildingArt = memo(BuildingArtRaw, (a, b) => a.def === b.def && a.lit === b.lit && a.locked === b.locked);
