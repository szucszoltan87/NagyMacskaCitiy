import type { PointerEvent } from 'react';
import { AGE_SCALE, CatFigure } from '../art/CatFigure';
import type { Cat } from '../sim/types';

function Bubble({ text, y }: { text: string; y: number }) {
  const w = Math.max(70, [...text].length * 12 + 30);
  return (
    <g transform={`translate(0 ${y})`} pointerEvents="none">
      <rect x={-w / 2} y={-34} width={w} height={40} rx={18} fill="#fff" stroke="#333" strokeWidth={2} />
      <path d="M -8 5 L 0 16 L 8 5" fill="#fff" stroke="#333" strokeWidth={2} />
      <text x={0} y={-8} textAnchor="middle" fontSize={20} fontWeight={700} fill="#333">{text}</text>
    </g>
  );
}

interface Props {
  cat: Cat;
  x: number;
  y: number;
  minute: number;
  selected: boolean;
  lifted: boolean;
  onPointerDown: (e: PointerEvent<SVGGElement>) => void;
}

export function CatSprite({ cat, x, y, minute, selected, lifted, onPointerDown }: Props) {
  const s = AGE_SCALE[cat.age];
  const lying = cat.activity === 'alszik' && !lifted;
  const bubble = cat.bubble && minute < cat.bubbleUntil ? cat.bubble : null;
  const pose = lying ? 'translate(60 -75) rotate(-90)' : lifted ? 'translate(0 -20) scale(1.08)' : undefined;
  return (
    <g
      data-cat-id={cat.id}
      onPointerDown={onPointerDown}
      style={{ transform: `translate(${x}px, ${y}px)`, transition: lifted ? 'none' : 'transform 260ms linear', touchAction: 'none', cursor: 'grab' }}
    >
      {selected && <ellipse cx={0} cy={2} rx={44} ry={11} fill="none" stroke="#FFD54F" strokeWidth={6} />}
      <g transform={pose}>
        <CatFigure looks={cat.looks} age={cat.age} activity={lifted ? 'all' : cat.activity} sick={cat.sick} facing={cat.facing} />
      </g>
      {lying
        ? <rect x={-90} y={-130} width={180} height={110} fill="transparent" />
        : <rect x={-48} y={-180 * s} width={96} height={185 * s} fill="transparent" />}
      {cat.sick && <text x={34 * s} y={-160 * s} fontSize={28}>🤒</text>}
      {lying && <text className="zzz" x={-20} y={-110} fontSize={30} fontWeight={900} fill="#5C6BC0">Zzz</text>}
      {bubble && <Bubble text={bubble} y={lying ? -120 : -185 * s} />}
    </g>
  );
}
