import { GROUND_Y, SCENE_HEIGHT, SIDEWALK_BOTTOM } from '../data/buildings';
import type { DayPhase } from '../sim/time';

const SKY: Record<DayPhase, [string, string]> = {
  reggel: ['#FFD3A5', '#FFF1C9'],
  nappal: ['#7EC8F5', '#CDEFFF'],
  este: ['#F28C6A', '#FBD3A0'],
  ejjel: ['#16204A', '#3A4A85'],
};
const STARS = Array.from({ length: 60 }, (_, i) => ({ x: (i * 977) % 3000, y: ((i * 131) % 300) + 10, r: (i % 3) + 1 }));
const LAMPS = [540, 1040, 1580, 2140, 2640];

function Cloud({ x, y }: { x: number; y: number }) {
  return (
    <g fill="#fff" opacity={0.9}>
      <ellipse cx={x} cy={y} rx={60} ry={24} />
      <ellipse cx={x + 40} cy={y - 14} rx={40} ry={22} />
      <ellipse cx={x - 40} cy={y - 6} rx={34} ry={18} />
    </g>
  );
}

export function Sky({ phase, width }: { phase: DayPhase; width: number }) {
  const [top, bottom] = SKY[phase];
  const id = `sky-${phase}`;
  const night = phase === 'ejjel';
  const sunX = phase === 'reggel' ? 300 : phase === 'este' ? 2700 : 1500;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={width} height={GROUND_Y} fill={`url(#${id})`} />
      {night ? (
        <>
          {STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={0.8} />)}
          <circle cx={2600} cy={90} r={40} fill="#FFF8D6" />
        </>
      ) : (
        <>
          <circle cx={sunX} cy={phase === 'nappal' ? 80 : 160} r={50} fill="#FFE066" />
          {[200, 900, 1700, 2400].map((x, i) => <Cloud key={x} x={x} y={70 + (i % 3) * 30} />)}
        </>
      )}
      <path
        d={`M 0 ${GROUND_Y} Q 400 ${GROUND_Y - 140} 800 ${GROUND_Y} T 1600 ${GROUND_Y} T 2400 ${GROUND_Y} T 3200 ${GROUND_Y} Z`}
        fill={night ? '#2E3B6B' : '#A5D6A7'}
      />
    </g>
  );
}

export function Street({ width, lit }: { width: number; lit: boolean }) {
  return (
    <g>
      <rect x={0} y={GROUND_Y} width={width} height={SIDEWALK_BOTTOM - GROUND_Y} fill="#E8D9C0" />
      {Array.from({ length: Math.ceil(width / 80) }, (_, i) => (
        <line key={i} x1={i * 80} y1={GROUND_Y} x2={i * 80} y2={SIDEWALK_BOTTOM} stroke="#D4C2A3" strokeWidth={2} />
      ))}
      <rect x={0} y={SIDEWALK_BOTTOM} width={width} height={SCENE_HEIGHT - SIDEWALK_BOTTOM} fill="#6D6D6D" />
      {Array.from({ length: Math.ceil(width / 120) }, (_, i) => (
        <rect key={i} x={i * 120 + 20} y={SIDEWALK_BOTTOM + 16} width={60} height={6} fill="#fff" />
      ))}
      {LAMPS.map((x) => (
        <g key={x}>
          <rect x={x - 5} y={GROUND_Y - 200} width={10} height={200} fill="#455A64" />
          {lit && <circle cx={x} cy={GROUND_Y - 205} r={40} fill="#FFE680" opacity={0.35} />}
          <circle cx={x} cy={GROUND_Y - 205} r={16} fill={lit ? '#FFE680' : '#ECEFF1'} stroke="#455A64" strokeWidth={4} />
        </g>
      ))}
    </g>
  );
}
