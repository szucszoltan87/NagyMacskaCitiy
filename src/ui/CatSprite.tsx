import type { PointerEvent } from 'react';
import { AGE_SCALE, CatFigure } from '../art/CatFigure';
import { catLook } from '../art/catProps';
import { Sparkle } from '../art/Scenery';
import { wishIcon } from './catStatus';
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

function Thought({ icon, y }: { icon: string; y: number }) {
  return (
    <g transform={`translate(34 ${y})`} pointerEvents="none">
      <g className="float-soft">
        <circle cx={-14} cy={18} r={4} fill="#fff" stroke="#C9B6F2" strokeWidth={2} />
        <circle cx={-6} cy={8} r={6} fill="#fff" stroke="#C9B6F2" strokeWidth={2} />
        <circle cx={10} cy={-14} r={20} fill="#fff" stroke="#C9B6F2" strokeWidth={3} />
        <text x={10} y={-6} textAnchor="middle" fontSize={22}>{icon}</text>
      </g>
    </g>
  );
}

function Tree() {
  return (
    <g pointerEvents="none">
      <path d="M -14 0 Q -10 -120 -6 -200 L 10 -200 Q 14 -120 18 0 Z" fill="#B98673" stroke="#8D5F52" strokeWidth={3} />
      <path d="M 4 -150 Q 40 -170 60 -160" stroke="#8D5F52" strokeWidth={8} fill="none" strokeLinecap="round" />
      <g fill="#9EDFC0" stroke="#5CC3A0" strokeWidth={3}>
        <circle cx={-50} cy={-250} r={50} />
        <circle cx={50} cy={-255} r={52} />
        <circle cx={0} cy={-300} r={56} />
        <circle cx={-10} cy={-220} r={44} />
        <circle cx={40} cy={-210} r={38} />
      </g>
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
  const stuck = cat.stuck && !lifted;
  const swim = cat.activity === 'uszik' && !lifted;
  const play = cat.activity === 'jatszik' && !lifted;
  const lift = stuck ? -190 : 0;
  const pose = lying ? 'translate(70 -70) rotate(-90)' : lifted ? 'translate(0 -20) scale(1.08) rotate(-4)' : `translate(0 ${lift})`;
  const playClass = play ? (cat.spot === 'hinta' ? 'swing' : 'bounce') : swim ? 'bob-water' : undefined;
  const top = lift - 186 * s;
  return (
    <g
      data-cat-id={cat.id}
      onPointerDown={onPointerDown}
      style={{ transform: `translate(${x}px, ${y}px)`, transition: lifted ? 'none' : 'transform 260ms linear', touchAction: 'none', cursor: 'grab' }}
    >
      {stuck && <Tree />}
      {selected && (
        <g>
          <ellipse className="sel-ring" cx={0} cy={2} rx={46} ry={12} fill="#FFE58F" fillOpacity={0.35} stroke="#FFB84D" strokeWidth={4} strokeDasharray="10 7" />
          <Sparkle x={-46} y={-14} s={8} fill="#FFD166" className="twinkle" />
          <Sparkle x={48} y={-24} s={6} fill="#FF9EBE" className="twinkle" delay={0.8} />
        </g>
      )}
      <g transform={pose}>
        <g className={playClass}>
          <CatFigure {...catLook(cat)} activity={lifted ? 'all' : cat.activity} facing={cat.facing} />
        </g>
      </g>
      {swim && (
        <g pointerEvents="none">
          <path d="M -70 -40 Q -52 -50 -35 -40 T 0 -40 T 35 -40 T 70 -40 L 70 10 L -70 10 Z" fill="#7FD3F2" opacity={0.85} />
          <path d="M -60 -38 q 10 -6 20 0 M 10 -38 q 10 -6 20 0" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" />
        </g>
      )}
      {lying
        ? <rect x={-100} y={-130} width={200} height={120} fill="transparent" />
        : <rect x={-52} y={lift - 182 * s} width={104} height={186 * s} fill="transparent" />}
      {lying && <text className="zzz" x={-16} y={-128} fontSize={30} fontWeight={700} fill="#9C82E0">Zzz</text>}
      {cat.activity === 'dolgozik' && !bubble && <text x={30} y={top + 20} fontSize={24} pointerEvents="none">💼</text>}
      {bubble
        ? <Bubble text={bubble} y={lying ? -138 : top - 2} />
        : cat.wish && !lying && <Thought icon={wishIcon(cat.wish)} y={top} />}
    </g>
  );
}
