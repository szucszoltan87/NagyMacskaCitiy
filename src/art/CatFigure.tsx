import { useId } from 'react';
import type { Activity, AgeStage, EarKind, Looks, PatternKind } from '../sim/types';
import { shade } from './color';

export const AGE_SCALE: Record<AgeStage, number> = { baba: 0.55, gyerek: 0.75, felnott: 1 };

const BODY_SPOTS: Array<[number, number]> = [[-12, -78], [10, -70], [-6, -58], [14, -50], [-14, -46], [4, -86]];
const HEAD_SPOTS: Array<[number, number]> = [[-22, -138], [20, -136], [-8, -148], [10, -150], [-27, -120], [27, -118]];

function PatternMarks({ kind, color, area }: { kind: PatternKind; color: string; area: 'body' | 'head' }) {
  if (kind === 'nincs') return null;
  if (kind === 'csikos') {
    const paths = area === 'head'
      ? ['M -10 -156 Q -6 -146 -10 -138', 'M 0 -158 Q 4 -148 0 -140', 'M 10 -156 Q 14 -146 10 -138', 'M -38 -128 Q -28 -126 -22 -130', 'M 38 -128 Q 28 -126 22 -130']
      : ['M -26 -80 Q -12 -76 -6 -82', 'M 26 -80 Q 12 -76 6 -82', 'M -26 -64 Q -12 -60 -6 -66', 'M 26 -64 Q 12 -60 6 -66', 'M -26 -48 Q -14 -44 -8 -50', 'M 26 -48 Q 14 -44 8 -50'];
    return (
      <g stroke={color} strokeWidth={4} strokeLinecap="round" fill="none">
        {paths.map((d) => <path key={d} d={d} />)}
      </g>
    );
  }
  const spots = area === 'head' ? HEAD_SPOTS : BODY_SPOTS;
  if (kind === 'pottyos') {
    return <g fill={color}>{spots.map(([x, y]) => <circle key={`${x},${y}`} cx={x} cy={y} r={2.8} />)}</g>;
  }
  if (kind === 'rozettas') {
    return (
      <g stroke={color} strokeWidth={2.2} fill={color} fillOpacity={0.18}>
        {spots.map(([x, y]) => <circle key={`${x},${y}`} cx={x} cy={y} r={4.5} />)}
      </g>
    );
  }
  return (
    <g stroke={color} strokeWidth={2.5} fill={color} fillOpacity={0.25}>
      {spots.slice(0, 4).map(([x, y]) => <ellipse key={`${x},${y}`} cx={x} cy={y} rx={8} ry={5} transform={`rotate(25 ${x} ${y})`} />)}
    </g>
  );
}

function Ears({ kind, fur }: { kind: EarKind; fur: string }) {
  const inner = '#F6C1CC';
  if (kind === 'kerek') {
    return (
      <g>
        {[-1, 1].map((s) => (
          <g key={s}>
            <circle cx={26 * s} cy={-150} r={13} fill={fur} />
            <circle cx={26 * s} cy={-150} r={7} fill={inner} />
          </g>
        ))}
      </g>
    );
  }
  const tall = kind === 'nagy' ? 30 : 20;
  const w = kind === 'nagy' ? 15 : 13;
  return (
    <g>
      {[-1, 1].map((s) => {
        const bx = 24 * s;
        const by = -144;
        const tx = bx + 4 * s;
        const ty = by - tall - 10;
        return (
          <g key={s}>
            <polygon points={`${bx - w},${by} ${tx},${ty} ${bx + w},${by}`} fill={fur} stroke={fur} strokeWidth={6} strokeLinejoin="round" />
            <polygon points={`${bx - w * 0.5},${by - 2} ${tx},${ty + 10} ${bx + w * 0.5},${by - 2}`} fill={inner} />
            {kind === 'pamacsos' && <path d={`M ${tx} ${ty} l ${2 * s} -12`} stroke="#222" strokeWidth={3} strokeLinecap="round" />}
          </g>
        );
      })}
    </g>
  );
}

interface Props {
  looks: Looks;
  age: AgeStage;
  activity: Activity;
  sick: boolean;
  facing: 1 | -1;
}

export function CatFigure({ looks, age, activity, sick, facing }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const { fur, belly, pattern, patternColor, eyes } = looks;
  const outline = shade(fur, -0.35);
  const sleeping = activity === 'alszik';
  return (
    <g transform={`scale(${AGE_SCALE[age]})`}>
      <g transform={`scale(${facing} 1)`} className={`cat${activity === 'setal' ? ' walking' : ''}`}>
        <defs>
          <clipPath id={`b${uid}`}><rect x={-24} y={-92} width={48} height={58} rx={22} /></clipPath>
          <clipPath id={`h${uid}`}><ellipse cx={0} cy={-124} rx={38} ry={34} /></clipPath>
        </defs>
        <ellipse cx={0} cy={2} rx={30} ry={6} fill="rgba(0,0,0,0.15)" />
        <path className="tail" d="M 16 -50 Q 52 -48 48 -86 Q 46 -100 56 -104" stroke={fur} strokeWidth={9} fill="none" strokeLinecap="round" />
        <rect className="leg leg-l" x={-18} y={-40} width={15} height={40} rx={7} fill={fur} stroke={outline} strokeWidth={1.5} />
        <rect className="leg leg-r" x={3} y={-40} width={15} height={40} rx={7} fill={fur} stroke={outline} strokeWidth={1.5} />
        <rect x={-24} y={-92} width={48} height={58} rx={22} fill={fur} stroke={outline} strokeWidth={1.5} />
        <g clipPath={`url(#b${uid})`}>
          <ellipse cx={0} cy={-58} rx={14} ry={22} fill={belly} />
          <PatternMarks kind={pattern} color={patternColor} area="body" />
        </g>
        <rect className="arm arm-l" x={-33} y={-88} width={12} height={36} rx={6} fill={fur} stroke={outline} strokeWidth={1.5} />
        <rect className="arm arm-r" x={21} y={-88} width={12} height={36} rx={6} fill={fur} stroke={outline} strokeWidth={1.5} />
        {looks.mane && <circle cx={0} cy={-122} r={48} fill={shade(fur, -0.3)} />}
        <Ears kind={looks.ears} fur={fur} />
        <ellipse cx={0} cy={-124} rx={38} ry={34} fill={fur} stroke={outline} strokeWidth={1.5} />
        <g clipPath={`url(#h${uid})`}><PatternMarks kind={pattern} color={patternColor} area="head" /></g>
        <ellipse cx={0} cy={-108} rx={19} ry={13} fill={belly} />
        {sleeping ? (
          <g stroke="#3b2a20" strokeWidth={3} fill="none" strokeLinecap="round">
            <path d="M -21 -126 Q -14 -120 -7 -126" />
            <path d="M 7 -126 Q 14 -120 21 -126" />
          </g>
        ) : (
          <g className="eyes">
            {[-14, 14].map((x) => (
              <g key={x}>
                <ellipse cx={x} cy={-127} rx={9} ry={11} fill="#fff" />
                <circle cx={x} cy={-126} r={7} fill={eyes} />
                <ellipse cx={x} cy={-126} rx={3} ry={5} fill="#1b1b1b" />
                <circle cx={x + 3} cy={-130} r={2.5} fill="#fff" />
              </g>
            ))}
          </g>
        )}
        <path d="M -5 -113 L 5 -113 L 0 -107 Z" fill="#E88A9A" />
        <path d="M 0 -107 Q -4 -101 -9 -104 M 0 -107 Q 4 -101 9 -104" stroke="#5a3a2a" strokeWidth={2} fill="none" strokeLinecap="round" />
        <g stroke="#ffffffcc" strokeWidth={1.2}>
          <path d="M -20 -110 L -40 -114" /><path d="M -20 -106 L -40 -104" />
          <path d="M 20 -110 L 40 -114" /><path d="M 20 -106 L 40 -104" />
        </g>
        {!sick && <circle cx={-26} cy={-112} r={5} fill="#FF9AA8" opacity={0.5} />}
        {!sick && <circle cx={26} cy={-112} r={5} fill="#FF9AA8" opacity={0.5} />}
        {sick && <ellipse cx={0} cy={-120} rx={36} ry={30} fill="#7CB342" opacity={0.25} />}
      </g>
    </g>
  );
}
