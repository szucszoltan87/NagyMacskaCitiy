import type { PointerEvent } from 'react';
import { AGE_SCALE, CatFigure } from '../art/CatFigure';
import { Sparkle } from '../art/Scenery';
import type { Cat } from '../sim/types';

function Bubble({ text, y }: { text: string; y: number }) {
  const w = Math.max(76, [...text].length * 12 + 34);
  return (
    <g transform={`translate(0 ${y})`} pointerEvents="none">
      <rect x={-w / 2} y={-36} width={w} height={42} rx={21} fill="#fff" stroke="#C9B6F2" strokeWidth={3.5} />
      <path d="M -9 5 Q -2 10 0 18 Q 4 10 9 5" fill="#fff" stroke="#C9B6F2" strokeWidth={3.5} strokeLinejoin="round" />
      <rect x={-12} y={1} width={24} height={6} fill="#fff" />
      <text x={0} y={-8} textAnchor="middle" fontSize={20} fontWeight={600} fill="#5B3350">{text}</text>
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
  const pose = lying ? 'translate(70 -70) rotate(-90)' : lifted ? 'translate(0 -20) scale(1.08) rotate(-4)' : undefined;
  return (
    <g
      data-cat-id={cat.id}
      onPointerDown={onPointerDown}
      style={{ transform: `translate(${x}px, ${y}px)`, transition: lifted ? 'none' : 'transform 260ms linear', touchAction: 'none', cursor: 'grab' }}
    >
      {selected && (
        <g>
          <ellipse className="sel-ring" cx={0} cy={2} rx={46} ry={12} fill="#FFE58F" fillOpacity={0.35} stroke="#FFB84D" strokeWidth={4} strokeDasharray="10 7" />
          <Sparkle x={-46} y={-14} s={8} fill="#FFD166" className="twinkle" />
          <Sparkle x={48} y={-24} s={6} fill="#FF9EBE" className="twinkle" delay={0.8} />
        </g>
      )}
      <g transform={pose}>
        <CatFigure looks={cat.looks} age={cat.age} activity={lifted ? 'all' : cat.activity} sick={cat.sick} facing={cat.facing} sex={cat.sex} />
      </g>
      {lying
        ? <rect x={-100} y={-130} width={200} height={120} fill="transparent" />
        : <rect x={-52} y={-182 * s} width={104} height={186 * s} fill="transparent" />}
      {lying && <text className="zzz" x={-16} y={-128} fontSize={30} fontWeight={700} fill="#9C82E0">Zzz</text>}
      {bubble && <Bubble text={bubble} y={lying ? -138 : -188 * s} />}
    </g>
  );
}
