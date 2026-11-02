import { useId } from 'react';
import type { Activity, AgeStage, EarKind, HairId, Looks, Outfit, PatternKind, Sex } from '../sim/types';
import { FaceWear, Hair, HeadWear, LegWear, Nails, SleeveWear, TorsoWear } from './Clothes';
import { lineColor, shade } from './color';

export const AGE_SCALE: Record<AgeStage, number> = { baba: 0.6, gyerek: 0.8, felnott: 1 };

const HEAD_Y = -118;
const INNER_EAR = '#FFB8CC';
const EYE_DARK = '#3A2433';
const BLUSH = '#FF9FB8';

const BODY_SPOTS: Array<[number, number]> = [[-15, -72], [12, -66], [-18, -50], [17, -46], [-8, -38], [6, -78]];
const HEAD_SPOTS: Array<[number, number]> = [[-26, -147], [24, -146], [-8, -153], [10, -154], [-42, -128], [42, -127]];

function PatternMarks({ kind, color, area }: { kind: PatternKind; color: string; area: 'body' | 'head' }) {
  if (kind === 'nincs') return null;
  if (kind === 'csikos') {
    const paths = area === 'head'
      ? ['M -10 -159 Q -6 -150 -9 -142', 'M 0 -160 Q 4 -151 1 -143', 'M 10 -159 Q 14 -150 11 -142',
        'M -47 -122 Q -38 -121 -33 -126', 'M -47 -110 Q -39 -109 -35 -113', 'M 47 -122 Q 38 -121 33 -126', 'M 47 -110 Q 39 -109 35 -113']
      : ['M -27 -70 Q -16 -66 -12 -72', 'M 27 -70 Q 16 -66 12 -72', 'M -28 -54 Q -16 -50 -12 -56', 'M 28 -54 Q 16 -50 12 -56', 'M -28 -40 Q -18 -36 -14 -42', 'M 28 -40 Q 18 -36 14 -42'];
    return (
      <g stroke={color} strokeWidth={3.8} strokeLinecap="round" fill="none">
        {paths.map((d) => <path key={d} d={d} />)}
      </g>
    );
  }
  const spots = area === 'head' ? HEAD_SPOTS : BODY_SPOTS;
  if (kind === 'pottyos') {
    return <g fill={color}>{spots.map(([x, y]) => <circle key={`${x},${y}`} cx={x} cy={y} r={3} />)}</g>;
  }
  if (kind === 'rozettas') {
    return (
      <g stroke={color} strokeWidth={2.2} fill={color} fillOpacity={0.12}>
        {spots.map(([x, y]) => <circle key={`${x},${y}`} cx={x} cy={y} r={4.5} />)}
      </g>
    );
  }
  return (
    <g stroke={color} strokeWidth={2.5} fill={color} fillOpacity={0.25}>
      {spots.slice(0, 5).map(([x, y]) => <ellipse key={`${x},${y}`} cx={x} cy={y} rx={9} ry={5.5} transform={`rotate(25 ${x} ${y})`} />)}
    </g>
  );
}

function Ears({ kind, fur, line }: { kind: EarKind; fur: string; line: string }) {
  if (kind === 'kerek') {
    return (
      <g>
        {[-1, 1].map((s) => (
          <g key={s} className={s === 1 ? 'ear-twitch' : undefined}>
            <circle cx={32 * s} cy={-150} r={16} fill={fur} stroke={line} strokeWidth={2.5} />
            <circle cx={32 * s} cy={-150} r={9} fill={INNER_EAR} />
          </g>
        ))}
      </g>
    );
  }
  const tall = kind === 'nagy' ? 42 : 30;
  const w = kind === 'nagy' ? 18 : 15;
  return (
    <g>
      {[-1, 1].map((s) => {
        const bx = 28 * s;
        const by = -142;
        const tx = bx + 6 * s;
        const ty = by - tall;
        return (
          <g key={s} className={s === 1 ? 'ear-twitch' : undefined}>
            <path d={`M ${bx - w} ${by} Q ${tx - 2 * s} ${ty - 4} ${tx} ${ty} Q ${tx + 2 * s} ${ty + 4} ${bx + w} ${by} Z`} fill={fur} stroke={line} strokeWidth={2.5} strokeLinejoin="round" />
            <path d={`M ${bx - w * 0.5} ${by - 2} Q ${tx} ${ty + 10} ${tx} ${ty + 12} Q ${tx} ${ty + 10} ${bx + w * 0.5} ${by - 2} Z`} fill={INNER_EAR} />
            {kind === 'pamacsos' && <path d={`M ${tx} ${ty} q ${3 * s} -8 ${1 * s} -14`} stroke={line} strokeWidth={3.5} strokeLinecap="round" fill="none" />}
          </g>
        );
      })}
    </g>
  );
}

function Eye({ x, lashes, gid }: { x: number; lashes: boolean; gid: string }) {
  const y = HEAD_Y + 4;
  const out = x < 0 ? -1 : 1;
  return (
    <g>
      {lashes && (
        <g stroke={EYE_DARK} strokeWidth={2.6} strokeLinecap="round" fill="none">
          <path d={`M ${x + 9.5 * out} ${y - 8} q ${3 * out} -2 ${5 * out} -4.5`} />
          <path d={`M ${x + 11.2 * out} ${y - 3} q ${3 * out} -0.5 ${5.5 * out} -2.5`} />
        </g>
      )}
      <ellipse cx={x} cy={y} rx={11.5} ry={13.5} fill={EYE_DARK} />
      <ellipse cx={x} cy={y + 1.2} rx={9.6} ry={11.4} fill={`url(#${gid})`} />
      <ellipse cx={x} cy={y + 1} rx={4.2} ry={5.6} fill="#2A1A24" opacity={0.7} />
      <circle cx={x - 3.6} cy={y - 5.2} r={4.6} fill="#fff" />
      <circle cx={x + 4} cy={y + 5.4} r={2.2} fill="#fff" />
      <path d={`M ${x + 4.6} ${y - 8.6} l 0.8 1.9 l 1.9 0.8 l -1.9 0.8 l -0.8 1.9 l -0.8 -1.9 l -1.9 -0.8 l 1.9 -0.8 Z`} fill="#fff" />
    </g>
  );
}

interface Props {
  looks: Looks;
  age: AgeStage;
  activity: Activity;
  sick: boolean;
  facing: 1 | -1;
  sex?: Sex;
  outfit?: Outfit;
  hair?: HairId;
  hairColor?: string;
  nails?: string | null;
  pregnant?: boolean;
}

const NO_OUTFIT: Outfit = {};

export function CatFigure({ looks, age, activity, sick, facing, sex = 'lany', outfit = NO_OUTFIT, hair = 'nincs', hairColor = '#6D4C41', nails = null, pregnant = false }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const { fur, belly, pattern, patternColor, eyes } = looks;
  const line = lineColor(fur);
  const sleeping = activity === 'alszik';
  const furShadow = shade(fur, -0.18);
  const gid = `i${uid}`;
  return (
    <g transform={`scale(${AGE_SCALE[age]})`}>
      <g transform={`scale(${facing} 1)`} className={`cat${activity === 'setal' ? ' walking' : ''}`}>
        <defs>
          <clipPath id={`b${uid}`}><path d="M -16 -84 Q -25 -84 -26 -66 L -28 -40 Q -28 -27 -14 -27 L 14 -27 Q 28 -27 28 -40 L 26 -66 Q 25 -84 16 -84 Z" /></clipPath>
          <clipPath id={`h${uid}`}><ellipse cx={0} cy={HEAD_Y} rx={47} ry={41} /></clipPath>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={shade(eyes, -0.3)} />
            <stop offset="0.55" stopColor={eyes} />
            <stop offset="1" stopColor={shade(eyes, 0.55)} />
          </linearGradient>
        </defs>
        <ellipse cx={0} cy={2} rx={30} ry={6} fill="rgba(91,51,80,0.16)" />
        <g className="tail">
          <path d="M 18 -40 C 48 -40 56 -70 44 -88 C 38 -98 44 -108 54 -104" stroke={line} strokeWidth={16} fill="none" strokeLinecap="round" />
          <path d="M 18 -40 C 48 -40 56 -70 44 -88 C 38 -98 44 -108 54 -104" stroke={fur} strokeWidth={11} fill="none" strokeLinecap="round" />
          {pattern === 'csikos' && <path d="M 46 -64 l 8 3 M 48 -78 l 8 0 M 44 -92 l 7 -3" stroke={patternColor} strokeWidth={3.5} strokeLinecap="round" />}
        </g>
        {[-1, 1].map((s) => (
          <g key={s} className={`leg ${s < 0 ? 'leg-l' : 'leg-r'}`}>
            <rect x={s < 0 ? -18 : 4} y={-34} width={14} height={32} rx={7} fill={fur} stroke={line} strokeWidth={2.5} />
            <ellipse cx={s < 0 ? -9 : 13} cy={-3} rx={10} ry={6.5} fill={shade(belly, -0.03)} stroke={line} strokeWidth={2.5} />
            <LegWear outfit={outfit} side={s as -1 | 1} />
          </g>
        ))}
        <g className="bob">
          <path d="M -16 -84 Q -25 -84 -26 -66 L -28 -40 Q -28 -27 -14 -27 L 14 -27 Q 28 -27 28 -40 L 26 -66 Q 25 -84 16 -84 Z" fill={fur} stroke={line} strokeWidth={2.5} />
          <g clipPath={`url(#b${uid})`}>
            <ellipse cx={2} cy={-50} rx={14} ry={19} fill={belly} />
            <PatternMarks kind={pattern} color={patternColor} area="body" />
            <ellipse cx={0} cy={-82} rx={24} ry={7} fill={furShadow} opacity={0.6} />
          </g>
          {pregnant && (
            <g>
              <ellipse cx={4} cy={-52} rx={26} ry={22} fill={fur} stroke={line} strokeWidth={2.5} />
              <ellipse cx={6} cy={-50} rx={17} ry={15} fill={belly} />
              <path d="M 6 -46 c -3 -4 -8 -1 -5 3 l 5 5 l 5 -5 c 3 -4 -2 -7 -5 -3 Z" fill="#FF8FB4" />
            </g>
          )}
          <TorsoWear outfit={outfit} />
          {[-1, 1].map((s) => (
            <g key={s} className={`arm ${s < 0 ? 'arm-l' : 'arm-r'}`}>
              <rect x={s < 0 ? -33 : 22} y={-80} width={11} height={30} rx={5.5} fill={fur} stroke={line} strokeWidth={2.5} />
              <SleeveWear outfit={outfit} side={s as -1 | 1} />
              <circle cx={s < 0 ? -27.5 : 27.5} cy={-51} r={6.5} fill={shade(belly, -0.03)} stroke={line} strokeWidth={2.5} />
            </g>
          ))}
          {looks.mane && (
            <g fill={shade(fur, -0.32)} stroke={line} strokeWidth={2.5}>
              {Array.from({ length: 14 }, (_, i) => {
                const a = (i / 14) * Math.PI * 2;
                return <circle key={i} cx={Math.cos(a) * 46} cy={HEAD_Y + 4 + Math.sin(a) * 42} r={15} />;
              })}
            </g>
          )}
          <Ears kind={looks.ears} fur={fur} line={line} />
          {[-1, 1].map((s) => (
            <path key={s} d={`M ${44 * s} -112 L ${55 * s} -104 L ${45 * s} -101 L ${52 * s} -93 L ${40 * s} -94 Z`} fill={fur} stroke={line} strokeWidth={2.5} strokeLinejoin="round" />
          ))}
          <ellipse cx={0} cy={HEAD_Y} rx={47} ry={41} fill={fur} stroke={line} strokeWidth={2.5} />
          <g clipPath={`url(#h${uid})`}>
            <PatternMarks kind={pattern} color={patternColor} area="head" />
            <ellipse cx={-20} cy={-144} rx={13} ry={6} fill="#fff" opacity={0.3} transform="rotate(-20 -20 -144)" />
          </g>
          <path d="M -9 -157 Q -6 -170 2 -162 Q 6 -172 12 -160" stroke={line} strokeWidth={6.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M -9 -157 Q -6 -170 2 -162 Q 6 -172 12 -160" stroke={fur} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Hair hair={hair} color={hairColor} />
          <ellipse cx={0} cy={-96} rx={15} ry={9.5} fill={belly} />
          {sleeping ? (
            <g stroke={EYE_DARK} strokeWidth={3} fill="none" strokeLinecap="round">
              <path d="M -26 -113 Q -17 -105 -8 -113" />
              <path d="M 8 -113 Q 17 -105 26 -113" />
            </g>
          ) : (
            <g className="eyes">
              <Eye x={-17} lashes={sex === 'lany'} gid={gid} />
              <Eye x={17} lashes={sex === 'lany'} gid={gid} />
            </g>
          )}
          <path d="M -4.5 -103 Q 0 -105.5 4.5 -103 Q 1.5 -97.5 0 -97.5 Q -1.5 -97.5 -4.5 -103 Z" fill="#F48FB1" stroke={line} strokeWidth={1.5} strokeLinejoin="round" />
          {sick ? (
            <path d="M -7 -91 q 2.3 -2.5 4.6 0 q 2.3 2.5 4.6 0 q 2.3 -2.5 4.6 0" stroke={EYE_DARK} strokeWidth={2} fill="none" strokeLinecap="round" />
          ) : (
            <path d="M -7.5 -94 Q -3.7 -89 0 -94 Q 3.7 -89 7.5 -94" stroke={EYE_DARK} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          )}
          <g stroke="#ffffffcc" strokeWidth={1.4} strokeLinecap="round">
            <path d="M -16 -98 L -30 -101" /><path d="M -16 -95 L -29 -93" />
            <path d="M 16 -98 L 30 -101" /><path d="M 16 -95 L 29 -93" />
          </g>
          {!sick && [-1, 1].map((s) => (
            <g key={s}>
              <ellipse cx={31 * s} cy={-100} rx={8.5} ry={5} fill={BLUSH} opacity={0.6} />
              <path d={`M ${27 * s} -102 l ${-1.5 * s} 3 M ${31 * s} -102 l ${-1.5 * s} 3 M ${35 * s} -102 l ${-1.5 * s} 3`} stroke="#fff" strokeWidth={1.2} strokeLinecap="round" opacity={0.8} />
            </g>
          ))}
          <FaceWear outfit={outfit} />
          <HeadWear outfit={outfit} />
          {nails && <Nails color={nails} at="hand" />}
          {sick && (
            <>
              <ellipse cx={0} cy={HEAD_Y} rx={45} ry={39} fill="#9CCC65" opacity={0.25} />
              <path d="M 40 -150 q 5 8 0 11 q -5 -3 0 -11 Z" fill="#81D4FA" stroke="#4FA3D1" strokeWidth={1.5} />
            </>
          )}
        </g>
      </g>
    </g>
  );
}
