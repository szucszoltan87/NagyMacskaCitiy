import type { HairId, Outfit } from '../sim/types';
import { lineColor, shade } from './color';

const W = 2.5;

function Sparkles({ pts }: { pts: Array<[number, number]> }) {
  return (
    <g fill="#fff">
      {pts.map(([x, y]) => (
        <path key={`${x},${y}`} d={`M ${x} ${y - 3} l 0.9 2.1 l 2.1 0.9 l -2.1 0.9 l -0.9 2.1 l -0.9 -2.1 l -2.1 -0.9 l 2.1 -0.9 Z`} />
      ))}
    </g>
  );
}

/** Felsőtest: póló, ing, pulóver, kabátok, egyberuhák felső része, táska pántja. */
export function TorsoWear({ outfit }: { outfit: Outfit }) {
  const top = outfit.egyberuha ?? outfit.felso;
  const bottom = outfit.egyberuha ? null : outfit.also;
  const parts = [];
  if (bottom && (bottom.id === 'nadrag' || bottom.id === 'rovidnadrag')) {
    const l = lineColor(bottom.color);
    parts.push(<path key="hip" d="M -28 -42 L 28 -42 L 28 -38 Q 28 -27 14 -27 L -14 -27 Q -28 -27 -28 -38 Z" fill={bottom.color} stroke={l} strokeWidth={W} />);
  }
  if (top) {
    const c = top.color;
    const l = lineColor(c);
    const bottomY = { polo: -50, ing: -40, pulover: -36, kabat: -30, hokabat: -30, esokabat: -30, ruha: -46, hercegnoruha: -46 }[top.id as string] ?? -50;
    parts.push(
      <path key="top" d={`M -17 -85 Q -27 -84 -27 -66 L -28 ${bottomY} L 28 ${bottomY} L 27 -66 Q 27 -84 17 -85 Q 0 -78 -17 -85 Z`} fill={c} stroke={l} strokeWidth={W} strokeLinejoin="round" />,
    );
    if (top.id === 'ing') {
      parts.push(<path key="col" d="M -12 -83 L 0 -74 L 12 -83 L 6 -70 L 0 -74 L -6 -70 Z" fill="#fff" stroke={l} strokeWidth={2} />);
      parts.push(<g key="btn" fill={l}>{[-66, -56, -46].map((y) => <circle key={y} cx={0} cy={y} r={2} />)}</g>);
    }
    if (top.id === 'polo') parts.push(<circle key="star" cx={6} cy={-64} r={6} fill={shade(c, 0.5)} />);
    if (top.id === 'pulover') parts.push(<rect key="hem" x={-28} y={-42} width={56} height={6} fill={shade(c, -0.15)} />);
    if (top.id === 'kabat' || top.id === 'esokabat' || top.id === 'hokabat') {
      parts.push(<line key="zip" x1={0} y1={-78} x2={0} y2={-31} stroke={l} strokeWidth={2} />);
      parts.push(<g key="btn" fill={shade(c, -0.3)}>{[-68, -56, -44].map((y) => <circle key={y} cx={5} cy={y} r={2.4} />)}</g>);
    }
    if (top.id === 'hokabat') {
      parts.push(<g key="fur" fill="#fff" stroke="#E0E0E0" strokeWidth={1.5}>{[-24, -12, 0, 12, 24].map((x) => <circle key={x} cx={x} cy={-31} r={5} />)}</g>);
    }
    if (top.id === 'ruha' || top.id === 'hercegnoruha') {
      const len = top.id === 'ruha' ? -16 : -4;
      const wide = top.id === 'ruha' ? 40 : 48;
      parts.push(
        <path key="skirt" d={`M -26 -50 L 26 -50 L ${wide} ${len} Q 0 ${len + 8} ${-wide} ${len} Z`} fill={c} stroke={l} strokeWidth={W} strokeLinejoin="round" />,
      );
      parts.push(<path key="belt" d="M -27 -52 L 27 -52 L 27 -46 L -27 -46 Z" fill={shade(c, 0.45)} />);
      parts.push(<path key="bow" d="M 0 -49 l -8 -5 l 0 10 Z M 0 -49 l 8 -5 l 0 10 Z" fill={shade(c, -0.25)} />);
      if (top.id === 'hercegnoruha') parts.push(<Sparkles key="sp" pts={[[-20, -30], [10, -20], [30, -12], [-34, -10], [0, -38]]} />);
    }
  }
  if (bottom?.id === 'szoknya') {
    const l = lineColor(bottom.color);
    parts.push(<path key="skirt" d="M -27 -48 L 27 -48 L 38 -18 Q 30 -12 22 -18 Q 13 -12 5 -18 Q -4 -12 -12 -18 Q -21 -12 -30 -18 Q -36 -14 -38 -18 Z" fill={bottom.color} stroke={l} strokeWidth={W} strokeLinejoin="round" />);
  }
  if (outfit.kieg?.id === 'taska') {
    const c = outfit.kieg.color;
    parts.push(<path key="strap" d="M -18 -82 L 24 -40" stroke={shade(c, -0.25)} strokeWidth={4} />);
    parts.push(<rect key="bag" x={14} y={-46} width={22} height={18} rx={6} fill={c} stroke={lineColor(c)} strokeWidth={W} />);
  }
  return <g>{parts}</g>;
}

export function SleeveWear({ outfit, side }: { outfit: Outfit; side: -1 | 1 }) {
  const top = outfit.egyberuha ?? outfit.felso;
  if (!top) return null;
  const long = ['ing', 'pulover', 'kabat', 'hokabat', 'esokabat'].includes(top.id);
  const x = side < 0 ? -34 : 21;
  const h = long ? 25 : top.id === 'ruha' || top.id === 'hercegnoruha' ? 10 : 13;
  return <rect x={x} y={-81} width={13} height={h} rx={5} fill={top.color} stroke={lineColor(top.color)} strokeWidth={W} />;
}

export function LegWear({ outfit, side }: { outfit: Outfit; side: -1 | 1 }) {
  const parts = [];
  const x = side < 0 ? -19 : 3;
  const bottom = outfit.egyberuha ? null : outfit.also;
  if (bottom && (bottom.id === 'nadrag' || bottom.id === 'rovidnadrag')) {
    const h = bottom.id === 'nadrag' ? 26 : 10;
    parts.push(<rect key="leg" x={x} y={-35} width={16} height={h} rx={5} fill={bottom.color} stroke={lineColor(bottom.color)} strokeWidth={W} />);
  }
  const shoe = outfit.cipo;
  if (shoe) {
    const c = shoe.color;
    const l = lineColor(c);
    const cx = side < 0 ? -9 : 13;
    if (shoe.id === 'csizma' || shoe.id === 'gumicsizma') {
      parts.push(<rect key="boot" x={x} y={-20} width={16} height={16} rx={4} fill={c} stroke={l} strokeWidth={W} />);
      parts.push(<ellipse key="foot" cx={cx} cy={-3} rx={11} ry={7} fill={c} stroke={l} strokeWidth={W} />);
      if (shoe.id === 'gumicsizma') parts.push(<path key="shine" d={`M ${x + 4} -16 v 8`} stroke="#fff" strokeWidth={2.5} strokeLinecap="round" opacity={0.8} />);
      if (shoe.id === 'csizma') parts.push(<rect key="cuff" x={x - 1} y={-22} width={18} height={5} rx={2.5} fill="#fff" />);
    } else if (shoe.id === 'szandal') {
      parts.push(<path key="strap" d={`M ${cx - 8} -6 L ${cx + 8} -6 M ${cx - 4} -9 L ${cx - 4} -1 M ${cx + 4} -9 L ${cx + 4} -1`} stroke={c} strokeWidth={3} strokeLinecap="round" />);
    } else {
      parts.push(<ellipse key="shoe" cx={cx + 1} cy={-3} rx={11.5} ry={7} fill={c} stroke={l} strokeWidth={W} />);
      parts.push(<path key="sole" d={`M ${cx - 9} 1 L ${cx + 11} 1`} stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />);
    }
  }
  return <g>{parts}</g>;
}

export function Nails({ color, at }: { color: string; at: 'hand' | 'foot'; side?: -1 | 1 }) {
  const pts: Array<[number, number]> = at === 'hand' ? [[-31, -46], [-27.5, -45], [-24, -46], [24, -46], [27.5, -45], [31, -46]] : [[-15, 2], [-9, 3], [-3, 2], [8, 2], [14, 3], [20, 2]];
  return (
    <g>
      {pts.map(([x, y]) => <circle key={`${x},${y}`} cx={x} cy={y} r={1.9} fill={color} stroke="#fff" strokeWidth={0.8} />)}
    </g>
  );
}

export function Hair({ hair, color }: { hair: HairId; color: string }) {
  if (hair === 'nincs') return null;
  const l = lineColor(color);
  const p = { fill: color, stroke: l, strokeWidth: W, strokeLinejoin: 'round' as const };
  switch (hair) {
    case 'frufru':
      return <path {...p} d="M -34 -146 Q -30 -166 0 -164 Q 30 -166 34 -146 L 24 -150 L 18 -138 L 10 -150 L 2 -136 L -6 -150 L -14 -138 L -20 -150 Z" />;
    case 'konty':
      return (
        <g>
          <circle {...p} cx={0} cy={-170} r={17} />
          <path d="M -10 -158 Q 0 -152 10 -158" stroke={shade(color, -0.3)} strokeWidth={4} fill="none" />
          <circle cx={-6} cy={-176} r={4} fill="#fff" opacity={0.5} />
        </g>
      );
    case 'copf':
      return (
        <g>
          {[-1, 1].map((s) => (
            <g key={s}>
              <ellipse {...p} cx={52 * s} cy={-120} rx={12} ry={24} transform={`rotate(${-15 * s} ${52 * s} -120)`} />
              <circle cx={46 * s} cy={-142} r={6} fill="#FF8FB4" stroke="#fff" strokeWidth={2} />
            </g>
          ))}
        </g>
      );
    case 'tuskes':
      return <path {...p} d="M -30 -150 L -26 -172 L -14 -156 L -6 -180 L 4 -158 L 14 -178 L 18 -156 L 30 -168 L 30 -148 Q 0 -158 -30 -150 Z" />;
    case 'gondor':
      return <g {...p}>{[-30, -18, -6, 6, 18, 30].map((x, i) => <circle key={x} cx={x} cy={-154 - (i % 2) * 6 - (Math.abs(x) < 20 ? 6 : 0)} r={11} />)}</g>;
    case 'hosszu':
      return (
        <g>
          {[-1, 1].map((s) => <path key={s} {...p} d={`M ${40 * s} -150 Q ${58 * s} -120 ${52 * s} -86 Q ${44 * s} -80 ${38 * s} -88 Q ${44 * s} -118 ${30 * s} -146 Z`} />)}
          <path {...p} d="M -38 -146 Q 0 -176 38 -146 Q 20 -154 0 -150 Q -20 -154 -38 -146 Z" />
        </g>
      );
  }
}

export function HeadWear({ outfit }: { outfit: Outfit }) {
  const hat = outfit.fej;
  if (!hat) return null;
  const c = hat.color;
  const l = lineColor(c);
  switch (hat.id) {
    case 'masni':
      return (
        <g transform="translate(26 -154) rotate(15)">
          <path d="M 0 0 L -16 -10 Q -20 0 -16 10 Z M 0 0 L 16 -10 Q 20 0 16 10 Z" fill={c} stroke={l} strokeWidth={W} strokeLinejoin="round" />
          <circle r={5} fill={shade(c, -0.15)} stroke={l} strokeWidth={2} />
        </g>
      );
    case 'sapka':
      return (
        <g>
          <path d="M -44 -132 Q -46 -178 0 -180 Q 46 -178 44 -132 Z" fill={c} stroke={l} strokeWidth={W} />
          <rect x={-46} y={-140} width={92} height={13} rx={6} fill={shade(c, -0.15)} stroke={l} strokeWidth={W} />
          <circle cx={0} cy={-184} r={10} fill="#fff" stroke="#E0E0E0" strokeWidth={2} />
        </g>
      );
    case 'korona':
      return (
        <g>
          <path d="M -24 -150 L -26 -178 L -13 -164 L 0 -184 L 13 -164 L 26 -178 L 24 -150 Z" fill={c} stroke={shade(c, -0.4)} strokeWidth={W} strokeLinejoin="round" />
          <circle cx={0} cy={-162} r={4} fill="#FF8FB4" />
          <circle cx={-14} cy={-157} r={3} fill="#A8E6CF" />
          <circle cx={14} cy={-157} r={3} fill="#BDE6FF" />
        </g>
      );
    case 'baseball':
      return (
        <g>
          <path d="M -42 -140 Q -42 -176 0 -176 Q 42 -176 42 -140 Z" fill={c} stroke={l} strokeWidth={W} />
          <path d="M 30 -142 Q 62 -144 70 -136 Q 50 -132 30 -136 Z" fill={shade(c, -0.15)} stroke={l} strokeWidth={W} />
          <circle cx={0} cy={-176} r={4} fill={shade(c, -0.2)} />
        </g>
      );
    case 'szalmakalap':
    case 'szafarikalap':
      return (
        <g>
          <ellipse cx={0} cy={-146} rx={66} ry={12} fill={c} stroke={l} strokeWidth={W} />
          <path d="M -32 -148 Q -32 -186 0 -186 Q 32 -186 32 -148 Z" fill={c} stroke={l} strokeWidth={W} />
          <rect x={-32} y={-160} width={64} height={9} fill={hat.id === 'szalmakalap' ? '#FF8FB4' : shade(c, -0.35)} />
          {hat.id === 'szalmakalap' && <circle cx={26} cy={-156} r={7} fill="#FFE58F" stroke="#fff" strokeWidth={2} />}
        </g>
      );
    case 'virag':
      return (
        <g transform="translate(-32 -150)">
          {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={0} cy={-8} rx={6} ry={9} fill={c} stroke={l} strokeWidth={1.5} transform={`rotate(${a})`} />)}
          <circle r={5} fill="#FFE58F" />
        </g>
      );
    default:
      return null;
  }
}

/** Arc előtti kiegészítők: szemüveg, sál, nyaklánc, esernyő. */
export function FaceWear({ outfit }: { outfit: Outfit }) {
  const k = outfit.kieg;
  if (!k) return null;
  const c = k.color;
  const l = lineColor(c);
  switch (k.id) {
    case 'napszemuveg':
      return (
        <g>
          <path d="M -31 -122 h 26 v 10 q -13 10 -26 0 Z M 5 -122 h 26 v 10 q -13 10 -26 0 Z" fill={c} stroke={l} strokeWidth={2} />
          <path d="M -5 -119 h 10" stroke={l} strokeWidth={2.5} />
          <path d="M -26 -119 l 6 -2" stroke="#fff" strokeWidth={2} opacity={0.7} />
        </g>
      );
    case 'szemuveg':
      return (
        <g fill="none" stroke={c} strokeWidth={3}>
          <circle cx={-17} cy={-114} r={15} />
          <circle cx={17} cy={-114} r={15} />
          <path d="M -2 -116 h 4" />
        </g>
      );
    case 'sal':
      return (
        <g>
          <path d="M -30 -84 Q 0 -72 30 -84 L 30 -74 Q 0 -62 -30 -74 Z" fill={c} stroke={l} strokeWidth={W} />
          <path d="M 14 -72 L 22 -46 L 10 -46 L 6 -70 Z" fill={c} stroke={l} strokeWidth={W} strokeLinejoin="round" />
          <path d="M 10 -50 h 12" stroke="#fff" strokeWidth={2} />
        </g>
      );
    case 'nyaklanc':
      return (
        <g>
          <path d="M -20 -80 Q 0 -66 20 -80" stroke={c} strokeWidth={2.5} fill="none" />
          <path d="M 0 -66 c -4 -5 -10 -1 -6 4 l 6 6 l 6 -6 c 4 -5 -2 -9 -6 -4 Z" fill="#FF8FB4" stroke="#fff" strokeWidth={1} />
        </g>
      );
    case 'esernyo':
      return (
        <g>
          <path d="M 28 -50 L 28 -200" stroke="#8D6E63" strokeWidth={3} />
          <path d="M -50 -196 Q 28 -270 106 -196 Q 93 -206 80 -196 Q 67 -206 54 -196 Q 41 -206 28 -196 Q 15 -206 2 -196 Q -11 -206 -24 -196 Q -37 -206 -50 -196 Z" fill={c} stroke={l} strokeWidth={W} strokeLinejoin="round" />
        </g>
      );
    default:
      return null;
  }
}
