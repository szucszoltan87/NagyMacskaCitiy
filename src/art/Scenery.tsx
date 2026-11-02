import { GROUND_Y, SCENE_HEIGHT, SIDEWALK_BOTTOM, type StreetDef } from '../data/buildings';
import type { DayPhase } from '../sim/time';

export type SceneryKind = StreetDef['scenery'];

const SKY: Record<SceneryKind, Record<DayPhase, [string, string]>> = {
  varos: { reggel: ['#FFD6E4', '#FFF3D6'], nappal: ['#A8DBFF', '#FFEAF4'], este: ['#C9A6E8', '#FFD2B0'], ejjel: ['#2F2566', '#7C63B4'] },
  park: { reggel: ['#FFE1EA', '#FFF7DA'], nappal: ['#9FD8FF', '#E9FFF4'], este: ['#C9A6E8', '#FFD2B0'], ejjel: ['#2F2566', '#7C63B4'] },
  ho: { reggel: ['#D9D2FF', '#FFF2F6'], nappal: ['#BFE3FF', '#F4FAFF'], este: ['#B9A6E8', '#FFD9E6'], ejjel: ['#24306A', '#6A7DC0'] },
  szavanna: { reggel: ['#FFCFA8', '#FFF1CC'], nappal: ['#FFD9A0', '#FFF6DE'], este: ['#F6A07A', '#FFD38A'], ejjel: ['#3A2560', '#8A5A8C'] },
  dzsungel: { reggel: ['#CDEFD9', '#FFF6DA'], nappal: ['#A6E3D0', '#EEFFF6'], este: ['#B9A6D8', '#FFD9B0'], ejjel: ['#1E3A4A', '#4A6E7C'] },
};
const PASTELS = ['#FF9EBE', '#FFE58F', '#A8E6CF', '#BDE6FF', '#C9B6F2'];
const LINE = '#8A6079';

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

function Acacia({ x, y, s, night }: { x: number; y: number; s: number; night: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -8 0 Q -4 -80 -30 -140 M 0 0 Q 4 -90 40 -150" stroke="#8D6E63" strokeWidth={14} fill="none" strokeLinecap="round" />
      <ellipse cx={0} cy={-160} rx={130} ry={34} fill={night ? '#4E5A3E' : '#9CCB6B'} stroke={night ? '#3A4430' : '#6FA34A'} strokeWidth={4} />
      <ellipse cx={-20} cy={-176} rx={80} ry={22} fill={night ? '#5E6A4A' : '#B4DC85'} />
    </g>
  );
}

function Palm({ x, y, s, night }: { x: number; y: number; s: number; night: boolean }) {
  const leaf = night ? '#2E6B55' : '#5CC3A0';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -6 0 Q -14 -120 6 -230 L 18 -230 Q 4 -120 10 0 Z" fill="#B98673" stroke="#8D5F52" strokeWidth={3} />
      {[-150, -110, -60, -20, 25].map((a) => (
        <path key={a} d="M 12 -230 Q 70 -270 130 -220 Q 70 -240 12 -222 Z" fill={leaf} stroke={night ? '#21503F' : '#3FA582'} strokeWidth={3} transform={`rotate(${a + 60} 12 -230)`} />
      ))}
      <circle cx={8} cy={-222} r={9} fill="#C99A8B" />
      <circle cx={20} cy={-218} r={9} fill="#C99A8B" />
    </g>
  );
}

function FarLayer({ scenery, width, night }: { scenery: SceneryKind; width: number; night: boolean }) {
  const G = GROUND_Y;
  if (scenery === 'ho') {
    return (
      <g>
        {Array.from({ length: Math.ceil(width / 420) + 1 }, (_, i) => {
          const x = i * 420 - 60;
          const h = 230 + (i % 3) * 60;
          return (
            <g key={i}>
              <path d={`M ${x} ${G} L ${x + 230} ${G - h} L ${x + 460} ${G} Z`} fill={night ? '#46508F' : '#C7C3F0'} />
              <path d={`M ${x + 230} ${G - h} L ${x + 180} ${G - h + 70} Q ${x + 205} ${G - h + 56} ${x + 230} ${G - h + 72} Q ${x + 255} ${G - h + 56} ${x + 280} ${G - h + 70} Z`} fill="#fff" />
            </g>
          );
        })}
        <path d={`M 0 ${G - 40} Q 400 ${G - 110} 800 ${G - 50} T 1600 ${G - 50} T 2400 ${G - 60} T 3200 ${G - 40} L ${width} ${G} L 0 ${G} Z`} fill={night ? '#8C95C9' : '#F4F8FF'} />
      </g>
    );
  }
  if (scenery === 'szavanna') {
    return (
      <g>
        <rect x={0} y={G - 90} width={width} height={100} fill={night ? '#6E4E6A' : '#F6D58A'} />
        <path d={`M 0 ${G - 90} Q 600 ${G - 130} 1200 ${G - 92} T 2400 ${G - 96} L ${width} ${G - 90} L ${width} ${G} L 0 ${G} Z`} fill={night ? '#7E5A6E' : '#F1C46E'} />
        {Array.from({ length: Math.ceil(width / 500) }, (_, i) => <Acacia key={i} x={200 + i * 500 + (i % 2) * 120} y={G - 80} s={0.55} night={night} />)}
      </g>
    );
  }
  if (scenery === 'dzsungel') {
    return (
      <g>
        <path d={`M 0 ${G - 160} Q 300 ${G - 280} 600 ${G - 170} T 1200 ${G - 180} T 1800 ${G - 160} T 2400 ${G - 190} L ${width} ${G} L 0 ${G} Z`} fill={night ? '#2C5A55' : '#8FD3B0'} />
        {Array.from({ length: Math.ceil(width / 160) }, (_, i) => <Palm key={i} x={60 + i * 160 + (i % 3) * 30} y={G - 40} s={0.55} night={night} />)}
      </g>
    );
  }
  const hills = Math.ceil(width / 700) + 1;
  const back = Array.from({ length: hills }, (_, i) => `T ${(i + 1) * 700 + 650} ${G - 120 - (i % 2) * 30}`).join(' ');
  const front = Array.from({ length: hills }, (_, i) => `T ${(i + 1) * 600 + 520} ${G - 60 - (i % 2) * 20}`).join(' ');
  return (
    <g>
      <path d={`M 0 ${G - 120} Q 300 ${G - 230} 650 ${G - 130} ${back} L ${width} ${G} L 0 ${G} Z`} fill={night ? '#4B3F86' : '#D7F2E4'} />
      <path d={`M 0 ${G - 50} Q 250 ${G - 140} 520 ${G - 70} ${front} L ${width} ${G} L 0 ${G} Z`} fill={night ? '#5E4F9A' : '#B8EBD3'} />
      {Array.from({ length: Math.ceil(width / 140) }, (_, i) => (
        <LollipopTree key={i} x={60 + i * 140 + (i % 3) * 23} y={G - 70 - (i % 4) * 14} s={0.8 + (i % 3) * 0.2} c={night ? '#6E62A8' : ['#9EDFC0', '#C6EAA6', '#FFC4D8'][i % 3]} />
      ))}
    </g>
  );
}

export function Sky({ phase, width, scenery = 'varos' }: { phase: DayPhase; width: number; scenery?: SceneryKind }) {
  const [top, bottom] = SKY[scenery][phase];
  const id = `sky-${scenery}-${phase}`;
  const night = phase === 'ejjel';
  const sunX = phase === 'reggel' ? 320 : phase === 'este' ? width - 350 : width / 2;
  const stars = Math.ceil(width / 65);
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
            {Array.from({ length: stars }, (_, i) => (
              <Sparkle key={i} x={(i * 977 + 120) % width} y={((i * 131) % 300) + 20} s={(i % 3) * 2 + 5} fill="#FFF6C9" className="twinkle" delay={(i % 7) * 0.35} />
            ))}
            <Moon x={width - 440} y={110} />
          </>
        )
        : <Sun x={sunX} y={phase === 'nappal' ? 100 : 170} />}
      {Array.from({ length: Math.ceil(width / 620) }, (_, i) => <Cloud key={i} x={160 + i * 620} y={80 + (i % 3) * 40} s={0.9 + (i % 2) * 0.35} night={night} />)}
      <FarLayer scenery={scenery} width={width} night={night} />
    </g>
  );
}

function SnowPine({ x, night }: { x: number; night: boolean }) {
  return (
    <g transform={`translate(${x} ${GROUND_Y})`}>
      <rect x={-8} y={-30} width={16} height={30} rx={4} fill="#A1887F" />
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <path d={`M ${-80 + k * 18} ${-30 - k * 70} L 0 ${-140 - k * 70} L ${80 - k * 18} ${-30 - k * 70} Z`} fill={night ? '#3E6E68' : '#7CCFB0'} stroke={night ? '#2E5450' : '#4FA88A'} strokeWidth={3} strokeLinejoin="round" />
          <path d={`M ${-40 + k * 9} ${-85 - k * 70} L 0 ${-140 - k * 70} L ${40 - k * 9} ${-85 - k * 70} Q 20 ${-78 - k * 70} 0 ${-88 - k * 70} Q -20 ${-78 - k * 70} ${-40 + k * 9} ${-85 - k * 70} Z`} fill="#fff" />
        </g>
      ))}
    </g>
  );
}

function CherryTree({ x, night, i }: { x: number; night: boolean; i: number }) {
  return (
    <g transform={`translate(${x} ${GROUND_Y})`}>
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
  );
}

function RoundTree({ x, night }: { x: number; night: boolean }) {
  return (
    <g transform={`translate(${x} ${GROUND_Y})`}>
      <path d="M -10 0 Q -6 -70 -3 -120 L 7 -120 Q 9 -70 12 0 Z" fill="#B98673" stroke="#8D5F52" strokeWidth={3} />
      <circle cx={0} cy={-180} r={78} fill={night ? '#3E6E68' : '#9EDFC0'} stroke={night ? '#2E5450' : '#5CC3A0'} strokeWidth={4} />
      {[[-30, -200], [24, -160], [30, -214], [-20, -150]].map(([fx, fy]) => <circle key={`${fx}`} cx={fx} cy={fy} r={8} fill={night ? '#D7B8E6' : '#FFE58F'} stroke="#fff" strokeWidth={2} />)}
    </g>
  );
}

/** Fák az épületek között (az épületek mögött). */
export function Backdrop({ night, xs, scenery = 'varos' }: { night: boolean; xs: number[]; scenery?: SceneryKind }) {
  return (
    <g>
      {xs.map((x, i) => {
        const tx = x - 34;
        if (scenery === 'park') return <RoundTree key={x} x={tx} night={night} />;
        if (scenery === 'ho') return <SnowPine key={x} x={tx} night={night} />;
        if (scenery === 'szavanna') return <Acacia key={x} x={tx} y={GROUND_Y} s={1} night={night} />;
        if (scenery === 'dzsungel') return <Palm key={x} x={tx} y={GROUND_Y} s={1} night={night} />;
        return <CherryTree key={x} x={tx} night={night} i={i} />;
      })}
    </g>
  );
}

export function Street({ width, scenery = 'varos' }: { width: number; scenery?: SceneryKind }) {
  const G = GROUND_Y;
  if (scenery === 'ho' || scenery === 'szavanna' || scenery === 'dzsungel') {
    const ground = scenery === 'ho' ? '#FFFFFF' : scenery === 'szavanna' ? '#F3D9A0' : '#9EDFC0';
    const path = scenery === 'ho' ? '#E6EEFF' : scenery === 'szavanna' ? '#E8C07A' : '#D8B892';
    return (
      <g>
        <rect x={0} y={G} width={width} height={SCENE_HEIGHT - G} fill={ground} />
        <path d={`M 0 ${G + 40} Q ${width / 4} ${G + 20} ${width / 2} ${G + 45} T ${width} ${G + 40} L ${width} ${G + 110} Q ${width / 2} ${G + 130} 0 ${G + 110} Z`} fill={path} />
        {Array.from({ length: Math.ceil(width / 90) }, (_, i) => {
          const x = i * 90 + (i % 3) * 20;
          const y = G + 16 + (i % 4) * 30;
          if (scenery === 'ho') return <circle key={i} cx={x} cy={y} r={4} fill="#DCE6FF" />;
          if (scenery === 'szavanna') return <path key={i} d={`M ${x} ${y + 10} l -6 -16 M ${x} ${y + 10} l 0 -20 M ${x} ${y + 10} l 6 -16`} stroke="#C79A4A" strokeWidth={3} strokeLinecap="round" />;
          return <path key={i} d={`M ${x} ${y} q 10 -14 20 0 q -10 6 -20 0 Z`} fill="#5CC3A0" />;
        })}
      </g>
    );
  }
  const tiles = Math.ceil(width / 60);
  const [a, b, c] = scenery === 'park' ? ['#E9FBF2', '#FFF8F0', '#FFF3C9'] : ['#FFE3EC', '#FFF8F0', '#EFE6FF'];
  return (
    <g>
      <rect x={0} y={G} width={width} height={SIDEWALK_BOTTOM - G} fill="#FFF1E2" />
      {Array.from({ length: tiles }, (_, i) => (
        <g key={i}>
          <rect x={i * 60 + 4} y={G + 8} width={52} height={38} rx={10} fill={i % 2 ? a : b} />
          <rect x={i * 60 + 34} y={G + 52} width={52} height={38} rx={10} fill={i % 2 ? b : c} />
        </g>
      ))}
      <rect x={0} y={SIDEWALK_BOTTOM - 8} width={width} height={10} fill={scenery === 'park' ? '#A8E6CF' : '#FFB8CC'} />
      <rect x={0} y={SIDEWALK_BOTTOM + 2} width={width} height={SCENE_HEIGHT - SIDEWALK_BOTTOM} fill="#D9CFEA" />
      {Array.from({ length: Math.ceil(width / 120) }, (_, i) => (
        <rect key={i} x={i * 120 + 30} y={SIDEWALK_BOTTOM + 18} width={60} height={7} rx={3.5} fill="#fff" />
      ))}
    </g>
  );
}

/** Lámpák, zászlófüzérek, hóesés, eső. */
export function StreetFront({ lit, xs, scenery = 'varos', width }: { lit: boolean; xs: number[]; scenery?: SceneryKind; width: number }) {
  if (scenery === 'ho' || scenery === 'dzsungel') {
    const n = Math.ceil(width / 50);
    return (
      <g pointerEvents="none">
        {Array.from({ length: n }, (_, i) => {
          const x = (i * 211) % width;
          const delay = `${(i % 9) * 0.7}s`;
          return scenery === 'ho'
            ? <circle key={i} className="snow" style={{ animationDelay: delay }} cx={x} cy={-10} r={3 + (i % 3)} fill="#fff" opacity={0.9} />
            : <line key={i} className="rain" style={{ animationDelay: delay }} x1={x} y1={-20} x2={x - 6} y2={0} stroke="#9AD9F2" strokeWidth={3} strokeLinecap="round" />;
        })}
        {scenery === 'dzsungel' && Array.from({ length: Math.ceil(width / 260) }, (_, i) => (
          <path key={`v${i}`} className="sway" d={`M ${i * 260 + 40} 0 Q ${i * 260 + 60} 80 ${i * 260 + 30} 160`} stroke="#3FA582" strokeWidth={5} fill="none" />
        ))}
      </g>
    );
  }
  if (scenery === 'szavanna') return null;
  const head = GROUND_Y - 190;
  return (
    <g>
      {xs.slice(0, -1).map((x, i) => {
        const x2 = xs[i + 1];
        if (x2 - x > 900) return null;
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
      {xs.map((x) => (
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
