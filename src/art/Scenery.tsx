import { GROUND_Y, SCENE_HEIGHT, SIDEWALK_BOTTOM } from '../data/buildings';
import type { DayPhase } from '../sim/time';

const SKY: Record<DayPhase, [string, string]> = {
  reggel: ['#FFD6E4', '#FFF3D6'],
  nappal: ['#A8DBFF', '#FFEAF4'],
  este: ['#C9A6E8', '#FFD2B0'],
  ejjel: ['#2F2566', '#7C63B4'],
};
const PASTELS = ['#FF9EBE', '#FFE58F', '#A8E6CF', '#BDE6FF', '#C9B6F2'];
const LINE = '#8A6079';

export const TREE_XS = [540, 1040, 1580, 2140, 2640];
const STARS = Array.from({ length: 46 }, (_, i) => ({ x: (i * 977 + 120) % 3000, y: ((i * 131) % 300) + 20, s: (i % 3) * 2 + 5, d: (i % 7) * 0.35 }));

export function Sparkle({ x, y, s, fill = '#fff', className, delay = 0 }: { x: number; y: number; s: number; fill?: string; className?: string; delay?: number }) {
  return (
    <path
      className={className}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
      d={`M ${x} ${y - s} Q ${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y} Q ${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s} Q ${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y} Q ${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s} Z`}
      fill={fill}
    />
  );
}

function Cloud({ x, y, s = 1, night }: { x: number; y: number; s?: number; night: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={night ? 0.35 : 0.95}>
      <g className="drift">
      <path
        d="M -70 20 Q -92 20 -88 0 Q -84 -22 -58 -16 Q -50 -46 -16 -40 Q 4 -62 32 -42 Q 66 -50 70 -18 Q 96 -14 88 8 Q 84 22 62 20 Z"
        fill="#fff" stroke="#E5D9F7" strokeWidth={4} strokeLinejoin="round"
      />
      </g>
    </g>
  );
}

function Sun({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={-5} y={-74} width={10} height={20} rx={5} fill="#FFD66B" transform={`rotate(${i * 36})`} />
      ))}
      <circle r={48} fill="#FFE58F" stroke="#F5B94A" strokeWidth={4} />
      <path d="M -18 -4 q 6 -7 12 0 M 6 -4 q 6 -7 12 0" stroke={LINE} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <path d="M -8 10 q 8 8 16 0" stroke={LINE} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <ellipse cx={-26} cy={8} rx={8} ry={5} fill="#FF9FB8" opacity={0.6} />
      <ellipse cx={26} cy={8} rx={8} ry={5} fill="#FF9FB8" opacity={0.6} />
    </g>
  );
}

function Moon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={70} fill="#FFF6C9" opacity={0.15} />
      <path d="M 10 -44 A 44 44 0 1 0 40 30 A 36 36 0 1 1 10 -44 Z" fill="#FFF3B0" stroke="#F2D27A" strokeWidth={4} strokeLinejoin="round" />
      <path d="M -22 2 q 5 5 10 0" stroke={LINE} strokeWidth={3} fill="none" strokeLinecap="round" />
      <ellipse cx={-24} cy={12} rx={6} ry={4} fill="#FF9FB8" opacity={0.6} />
    </g>
  );
}

function LollipopTree({ x, y, s, c }: { x: number; y: number; s: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-4} y={-10} width={8} height={30} rx={4} fill="#C99A8B" />
      <circle cy={-26} r={24} fill={c} stroke="#ffffff99" strokeWidth={3} />
    </g>
  );
}

export function Sky({ phase, width }: { phase: DayPhase; width: number }) {
  const [top, bottom] = SKY[phase];
  const id = `sky-${phase}`;
  const night = phase === 'ejjel';
  const sunX = phase === 'reggel' ? 320 : phase === 'este' ? 2650 : 1480;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={width} height={GROUND_Y + 10} fill={`url(#${id})`} />
      {night
        ? (
          <>
            {STARS.map((s, i) => <Sparkle key={i} x={s.x} y={s.y} s={s.s} fill="#FFF6C9" className="twinkle" delay={s.d} />)}
            <Moon x={2560} y={110} />
          </>
        )
        : <Sun x={sunX} y={phase === 'nappal' ? 100 : 170} />}
      {[160, 820, 1350, 1960, 2480].map((x, i) => <Cloud key={x} x={x} y={80 + (i % 3) * 40} s={0.9 + (i % 2) * 0.35} night={night} />)}
      <path
        d={`M 0 ${GROUND_Y - 120} Q 300 ${GROUND_Y - 230} 650 ${GROUND_Y - 130} T 1350 ${GROUND_Y - 140} T 2050 ${GROUND_Y - 120} T 2750 ${GROUND_Y - 150} T 3450 ${GROUND_Y - 130} L ${width} ${GROUND_Y} L 0 ${GROUND_Y} Z`}
        fill={night ? '#4B3F86' : '#D7F2E4'}
      />
      <path
        d={`M 0 ${GROUND_Y - 50} Q 250 ${GROUND_Y - 140} 520 ${GROUND_Y - 70} T 1100 ${GROUND_Y - 80} T 1700 ${GROUND_Y - 60} T 2300 ${GROUND_Y - 90} T 2900 ${GROUND_Y - 60} T 3500 ${GROUND_Y - 70} L ${width} ${GROUND_Y} L 0 ${GROUND_Y} Z`}
        fill={night ? '#5E4F9A' : '#B8EBD3'}
      />
      {Array.from({ length: 22 }, (_, i) => (
        <LollipopTree key={i} x={60 + i * 140 + (i % 3) * 23} y={GROUND_Y - 70 - (i % 4) * 14} s={0.8 + (i % 3) * 0.2} c={night ? '#6E62A8' : ['#9EDFC0', '#C6EAA6', '#FFC4D8'][i % 3]} />
      ))}
    </g>
  );
}

/** Cseresznyefák a házak között (a házak mögött). */
export function Backdrop({ night }: { night: boolean }) {
  return (
    <g>
      {TREE_XS.map((x, i) => (
        <g key={x} transform={`translate(${x - 34} ${GROUND_Y})`}>
          <path d="M -9 0 Q -6 -80 -2 -140 L 6 -140 Q 8 -80 11 0 Z" fill="#B98673" stroke="#8D5F52" strokeWidth={3} />
          <g fill={night ? '#B48AC4' : '#FFC4D8'} stroke={night ? '#8E6AA6' : '#F29BB8'} strokeWidth={3}>
            <circle cx={-40} cy={-170} r={38} />
            <circle cx={36} cy={-176} r={40} />
            <circle cx={0} cy={-212} r={44} />
            <circle cx={-12} cy={-150} r={34} />
            <circle cx={24} cy={-142} r={30} />
          </g>
          {[[-30, -190], [22, -205], [40, -160], [-8, -160], [-46, -150], [6, -232], [-56, -178], [58, -186]].map(([fx, fy], k) => (
            <g key={k}>
              <circle cx={fx} cy={fy} r={7} fill={night ? '#D7B8E6' : '#FF9EBE'} />
              <circle cx={fx} cy={fy} r={2.5} fill="#fff" />
            </g>
          ))}
          {!night && [0, 1, 2].map((k) => (
            <ellipse key={k} className="petal" style={{ animationDelay: `${(i * 3 + k * 3) % 9}s` }} cx={-20 + k * 30} cy={-150} rx={5} ry={3} fill="#FFB3CB" />
          ))}
        </g>
      ))}
    </g>
  );
}

export function Street({ width }: { width: number }) {
  const tiles = Math.ceil(width / 60);
  return (
    <g>
      <rect x={0} y={GROUND_Y} width={width} height={SIDEWALK_BOTTOM - GROUND_Y} fill="#FFF1E2" />
      {Array.from({ length: tiles }, (_, i) => (
        <g key={i}>
          <rect x={i * 60 + 4} y={GROUND_Y + 8} width={52} height={38} rx={10} fill={i % 2 ? '#FFE3EC' : '#FFF8F0'} />
          <rect x={i * 60 + 34} y={GROUND_Y + 52} width={52} height={38} rx={10} fill={i % 2 ? '#FFF8F0' : '#EFE6FF'} />
        </g>
      ))}
      <rect x={0} y={SIDEWALK_BOTTOM - 8} width={width} height={10} fill="#FFB8CC" />
      <rect x={0} y={SIDEWALK_BOTTOM + 2} width={width} height={SCENE_HEIGHT - SIDEWALK_BOTTOM} fill="#D9CFEA" />
      {Array.from({ length: Math.ceil(width / 120) }, (_, i) => (
        <rect key={i} x={i * 120 + 30} y={SIDEWALK_BOTTOM + 18} width={60} height={7} rx={3.5} fill="#fff" />
      ))}
    </g>
  );
}

/** Lámpák és zászlófüzérek az épületek előtt. */
export function StreetFront({ lit }: { lit: boolean }) {
  const head = GROUND_Y - 190;
  return (
    <g>
      {TREE_XS.slice(0, -1).map((x, i) => {
        const x2 = TREE_XS[i + 1];
        const n = Math.floor((x2 - x) / 34);
        const pt = (t: number) => ({ x: x + (x2 - x) * t, y: head + 8 + Math.sin(Math.PI * t) * 46 });
        return (
          <g key={x}>
            <path d={`M ${x} ${head + 8} Q ${(x + x2) / 2} ${head + 100} ${x2} ${head + 8}`} stroke="#B48AA6" strokeWidth={2.5} fill="none" />
            {Array.from({ length: n - 1 }, (_, k) => {
              const p = pt((k + 1) / n);
              return <path key={k} className="sway" d={`M ${p.x - 10} ${p.y} L ${p.x + 10} ${p.y} L ${p.x} ${p.y + 22} Z`} fill={PASTELS[(k + i) % PASTELS.length]} stroke="#fff" strokeWidth={1.5} />;
            })}
          </g>
        );
      })}
      {TREE_XS.map((x) => (
        <g key={x}>
          <rect x={x - 6} y={head} width={12} height={GROUND_Y - head + 40} rx={6} fill="#A8E6CF" stroke="#6FBF9F" strokeWidth={2.5} />
          <ellipse cx={x} cy={GROUND_Y + 40} rx={20} ry={7} fill="#6FBF9F" />
          {lit && <circle cx={x} cy={head - 14} r={46} fill="#FFE9A8" opacity={0.35} />}
          <path d={`M ${x - 18} ${head - 2} Q ${x - 20} ${head - 34} ${x} ${head - 36} Q ${x + 20} ${head - 34} ${x + 18} ${head - 2} Z`} fill={lit ? '#FFE58F' : '#FFF8EE'} stroke="#6FBF9F" strokeWidth={3} />
          <path d={`M ${x - 22} ${head - 30} Q ${x} ${head - 52} ${x + 22} ${head - 30} Z`} fill="#FF9EBE" stroke="#E57AA0" strokeWidth={2.5} />
        </g>
      ))}
    </g>
  );
}
