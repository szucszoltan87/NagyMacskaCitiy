import type { ReactElement } from 'react';
import { HOME_BED_X, ROOM_DOOR_X, ROOM_FLOOR_Y, ROOM_WIDTH, type BuildingDef } from '../data/buildings';
import { lineColor, shade } from './color';
import { Sparkle } from './Scenery';

const F = ROOM_FLOOR_Y;
const PASTELS = ['#FF9EBE', '#FFE58F', '#A8E6CF', '#BDE6FF', '#C9B6F2'];
const INK = '#5B3350';

/** Kis krémszínű tábla felirattal (a megérinthető dolgok fölött). */
export function Sign({ x, y, text }: { x: number; y: number; text: string }) {
  const w = [...text].length * 12 + 28;
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <rect x={-w / 2} y={-18} width={w} height={34} rx={17} fill="#FFF8EE" stroke="#C9B6F2" strokeWidth={3} />
      <text x={0} y={6} textAnchor="middle" fontSize={19} fontWeight={600} fill={INK}>{text}</text>
    </g>
  );
}

function Heart({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }) {
  return <path d={`M ${x} ${y + s * 0.9} C ${x - s * 1.6} ${y - s * 0.2} ${x - s * 0.6} ${y - s * 1.3} ${x} ${y - s * 0.4} C ${x + s * 0.6} ${y - s * 1.3} ${x + s * 1.6} ${y - s * 0.2} ${x} ${y + s * 0.9} Z`} fill={fill} />;
}

function Window({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M ${x} ${y + 170} L ${x} ${y + 80} A 80 80 0 0 1 ${x + 160} ${y + 80} L ${x + 160} ${y + 170} Z`} fill="#CDEBFF" stroke="#fff" strokeWidth={12} />
      <circle cx={x + 50} cy={y + 70} r={16} fill="#fff" opacity={0.9} />
      <circle cx={x + 72} cy={y + 64} r={20} fill="#fff" opacity={0.9} />
      <circle cx={x + 94} cy={y + 72} r={14} fill="#fff" opacity={0.9} />
      <line x1={x + 80} y1={y + 2} x2={x + 80} y2={y + 170} stroke="#fff" strokeWidth={7} />
      <line x1={x} y1={y + 100} x2={x + 160} y2={y + 100} stroke="#fff" strokeWidth={7} />
      <path d={`M ${x - 28} ${y - 6} Q ${x + 10} ${y + 60} ${x + 4} ${y + 190} L ${x - 28} ${y + 190} Z`} fill="#FFC4D8" stroke="#F29BB8" strokeWidth={3} />
      <path d={`M ${x + 188} ${y - 6} Q ${x + 150} ${y + 60} ${x + 156} ${y + 190} L ${x + 188} ${y + 190} Z`} fill="#FFC4D8" stroke="#F29BB8" strokeWidth={3} />
      <rect x={x - 40} y={y - 16} width={240} height={14} rx={7} fill="#E8B4C8" />
      <rect x={x - 14} y={y + 168} width={188} height={14} rx={7} fill="#fff" />
      <path d={`M ${x + 120} ${y + 168} l -8 -26 l 32 0 l -8 26 Z`} fill="#FFB38A" />
      <circle cx={x + 128} cy={y + 130} r={16} fill="#9EDFC0" />
      <circle cx={x + 120} cy={y + 124} r={4} fill="#FF9EBE" />
    </g>
  );
}

export function RoomBackdrop({ def }: { def: BuildingDef }) {
  const wall = def.wall;
  const pattern: ReactElement[] = [];
  for (let r = 0; r * 80 + 70 < F - 130; r++) {
    for (let c = -3; c * 80 < ROOM_WIDTH + 240; c++) {
      const x = 40 + c * 80 + (r % 2) * 40;
      const y = 80 + r * 80;
      pattern.push(r % 2
        ? <circle key={`${r}-${c}`} cx={x} cy={y} r={5} fill={shade(wall, -0.07)} />
        : <Heart key={`${r}-${c}`} x={x} y={y} s={7} fill={shade(wall, -0.07)} />);
    }
  }
  const vx = ROOM_WIDTH / 2;
  return (
    <g>
      <rect x={-300} y={-100} width={ROOM_WIDTH + 600} height={F + 100} fill={wall} />
      {pattern}
      <path d={`M -300 40 Q ${vx} 110 ${ROOM_WIDTH + 300} 40`} stroke="#B48AA6" strokeWidth={2.5} fill="none" />
      {Array.from({ length: 16 }, (_, i) => {
        const t = (i + 0.5) / 16;
        const x = -300 + t * (ROOM_WIDTH + 600);
        const y = 40 + Math.sin(Math.PI * t) * 34;
        return <circle key={i} className="twinkle" style={{ animationDelay: `${(i % 5) * 0.4}s` }} cx={x} cy={y + 9} r={8} fill={PASTELS[i % PASTELS.length]} stroke="#fff" strokeWidth={2} />;
      })}
      <rect x={-300} y={F - 120} width={ROOM_WIDTH + 600} height={120} fill={shade(wall, 0.35)} />
      {Array.from({ length: 22 }, (_, i) => (
        <rect key={i} x={-280 + i * 74} y={F - 104} width={58} height={84} rx={8} fill="none" stroke={shade(wall, -0.08)} strokeWidth={3} />
      ))}
      <rect x={-300} y={F - 16} width={ROOM_WIDTH + 600} height={16} fill="#fff" />
      <rect x={-300} y={F} width={ROOM_WIDTH + 600} height={400} fill="#E9C3A4" />
      {Array.from({ length: 15 }, (_, i) => {
        const x0 = -300 + i * 115;
        return <line key={i} x1={x0} y1={F} x2={vx + (x0 - vx) * 2.4} y2={F + 400} stroke="#D9A989" strokeWidth={3} />;
      })}
      {[40, 100, 180].map((dy) => <line key={dy} x1={-300} y1={F + dy} x2={ROOM_WIDTH + 300} y2={F + dy} stroke="#DDB091" strokeWidth={2} />)}
      <ellipse cx={vx + 30} cy={F + 52} rx={300} ry={46} fill="#fff" />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return <circle key={i} cx={vx + 30 + Math.cos(a) * 300} cy={F + 52 + Math.sin(a) * 46} r={10} fill="#fff" />;
      })}
      <ellipse cx={vx + 30} cy={F + 52} rx={240} ry={32} fill="none" stroke={shade(def.roof, 0.6)} strokeWidth={6} strokeDasharray="14 10" />
      <g>
        <path d={`M ${ROOM_DOOR_X - 58} ${F} L ${ROOM_DOOR_X - 58} ${F - 160} A 58 58 0 0 1 ${ROOM_DOOR_X + 58} ${F - 160} L ${ROOM_DOOR_X + 58} ${F} Z`} fill={shade(def.roof, 0.25)} stroke={lineColor(def.roof)} strokeWidth={5} />
        <Heart x={ROOM_DOOR_X} y={F - 170} s={14} fill="#fff" />
        <circle cx={ROOM_DOOR_X + 36} cy={F - 100} r={7} fill="#FFE58F" stroke={lineColor(def.roof)} strokeWidth={2} />
        <Sign x={ROOM_DOOR_X} y={F - 248} text="🚪 Ki az utcára" />
      </g>
    </g>
  );
}

function ShelfDecor({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={150} height={12} rx={6} fill="#fff" stroke="#E0CDE8" strokeWidth={2} />
      <rect x={x + 12} y={y - 44} width={14} height={44} rx={3} fill="#FF9EBE" />
      <rect x={x + 28} y={y - 38} width={14} height={38} rx={3} fill="#A8E6CF" />
      <rect x={x + 44} y={y - 46} width={14} height={46} rx={3} fill="#C9B6F2" />
      <rect x={x + 76} y={y - 46} width={40} height={46} rx={6} fill="#fff" stroke="#FFB8CC" strokeWidth={4} />
      <Heart x={x + 96} y={y - 24} s={8} fill="#FF9EBE" />
      <path d={`M ${x + 124} ${y} l 2 -22 l 20 0 l 2 22 Z`} fill="#FFB38A" />
      <circle cx={x + 136} cy={y - 32} r={13} fill="#9EDFC0" />
    </g>
  );
}

export function HomeFurniture({ onBall }: { onBall: () => void }) {
  const B = HOME_BED_X;
  return (
    <g>
      <Window x={460} y={110} />
      <ShelfDecor x={215} y={150} />
      <g>
        <rect x={198} y={F - 236} width={104} height={236} rx={22} fill="#BFF0DC" stroke="#5CC3A0" strokeWidth={4} />
        <line x1={198} y1={F - 150} x2={302} y2={F - 150} stroke="#5CC3A0" strokeWidth={4} />
        <rect x={282} y={F - 214} width={9} height={42} rx={4.5} fill="#5CC3A0" />
        <rect x={282} y={F - 132} width={9} height={42} rx={4.5} fill="#5CC3A0" />
        <Heart x={232} y={F - 200} s={10} fill="#FF9EBE" />
        <Sparkle x={250} y={F - 110} s={10} fill="#FFE58F" />
        <circle cx={224} cy={F - 80} r={8} fill="#BDE6FF" />
        <Sign x={250} y={F - 262} text="🧊 Hűtő" />
      </g>
      <g>
        <rect x={330} y={F - 124} width={150} height={124} rx={14} fill="#FFF1E2" stroke="#E0B9A0" strokeWidth={4} />
        <rect x={348} y={F - 98} width={52} height={72} rx={10} fill="none" stroke="#E0B9A0" strokeWidth={3} />
        <rect x={410} y={F - 98} width={52} height={72} rx={10} fill="none" stroke="#E0B9A0" strokeWidth={3} />
        <rect x={340} y={F - 136} width={130} height={16} rx={8} fill="#BDE6FF" stroke="#8CC8EE" strokeWidth={3} />
        <path d={`M 405 ${F - 136} v -38 q 0 -10 10 -10 h 20`} stroke="#B0BEC5" strokeWidth={9} fill="none" strokeLinecap="round" />
        <Sign x={405} y={F - 212} text="💧 Csap" />
      </g>
      <g onClick={onBall} style={{ cursor: 'pointer' }}>
        <circle cx={612} cy={F - 30} r={30} fill="#fff" stroke="#E57AA0" strokeWidth={3} />
        <path d={`M 612 ${F - 60} Q 586 ${F - 30} 612 ${F} Z`} fill="#FF9EBE" />
        <path d={`M 612 ${F - 60} Q 638 ${F - 30} 612 ${F} Z`} fill="#BDE6FF" />
        <path d={`M 583 ${F - 38} Q 612 ${F - 22} 641 ${F - 38}`} stroke="#FFE58F" strokeWidth={8} fill="none" />
        <Sign x={612} y={F - 84} text="⚽ Labda" />
      </g>
      <g>
        <path d={`M ${B - 132} ${F - 40} L ${B - 132} ${F - 150} Q ${B - 132} ${F - 196} ${B - 86} ${F - 196} Q ${B - 40} ${F - 196} ${B - 40} ${F - 150} L ${B - 40} ${F - 40} Z`} fill="#E8B4C8" stroke="#C97A9D" strokeWidth={4} />
        <Heart x={B - 86} y={F - 152} s={16} fill="#fff" />
        <rect x={B - 132} y={F - 70} width={262} height={52} rx={18} fill="#FFF1E2" stroke="#C97A9D" strokeWidth={4} />
        <rect x={B - 118} y={F - 18} width={14} height={18} rx={4} fill="#C97A9D" />
        <rect x={B + 104} y={F - 18} width={14} height={18} rx={4} fill="#C97A9D" />
        <ellipse cx={B - 92} cy={F - 80} rx={34} ry={17} fill="#fff" stroke="#E0CDE8" strokeWidth={3} />
        <path d={`M ${B - 54} ${F - 84} Q ${B + 40} ${F - 104} ${B + 130} ${F - 84} L ${B + 130} ${F - 46} Q ${B + 40} ${F - 34} ${B - 54} ${F - 46} Z`} fill="#C9B6F2" stroke="#9C82E0" strokeWidth={4} />
        {[[-20, -70], [20, -78], [60, -66], [100, -76]].map(([dx, dy]) => <circle key={dx} cx={B + dx} cy={F + dy} r={5} fill="#fff" opacity={0.8} />)}
        <Sign x={B} y={F - 226} text="🛏️ Ágy" />
      </g>
    </g>
  );
}

export function ShopFurniture() {
  const rows = [['🥕', '🍎', '🥬', '🫘'], ['🐟', '🍗', '🥚', '🍞'], ['🍝', '🥛', '🧃', '🍌']];
  return (
    <g>
      <rect x={232} y={86} width={536} height={360} rx={24} fill="#FFF8EE" stroke="#E0B9A0" strokeWidth={5} />
      {rows.map((row, r) => (
        <g key={r}>
          <rect x={250} y={180 + r * 110} width={500} height={16} rx={8} fill={PASTELS[r]} stroke="#fff" strokeWidth={3} />
          {row.map((e, i) => <text key={i} x={310 + i * 126} y={172 + r * 110} fontSize={60} textAnchor="middle">{e}</text>)}
        </g>
      ))}
      <rect x={790} y={F - 120} width={190} height={120} rx={20} fill="#FFE58F" stroke="#E8B04B" strokeWidth={4} />
      <rect x={830} y={F - 168} width={110} height={52} rx={12} fill="#C9B6F2" stroke="#9C82E0" strokeWidth={4} />
      <rect x={846} y={F - 156} width={78} height={22} rx={6} fill="#EDE4FF" />
      <Sign x={885} y={F - 58} text="💰 Kassza" />
    </g>
  );
}

export function RestaurantFurniture() {
  return (
    <g>
      <rect x={370} y={84} width={320} height={184} rx={20} fill="#6B5B95" stroke="#FFE58F" strokeWidth={10} />
      <text x={530} y={134} textAnchor="middle" fontSize={32} fill="#fff" fontWeight={600}>🍽️ Menü</text>
      <text x={530} y={186} textAnchor="middle" fontSize={36}>🍲 🍉 🍕 🍣 🍔</text>
      <text x={530} y={236} textAnchor="middle" fontSize={18} fill="#fff">🥕 vega · 🍖 húsos · 😋 mindenkinek</text>
      {[310, 750].map((tx) => (
        <g key={tx}>
          <ellipse cx={tx} cy={F - 92} rx={92} ry={18} fill="#fff" stroke="#E8B4C8" strokeWidth={3} />
          <path d={`M ${tx - 92} ${F - 92} L ${tx - 80} ${F - 58} L ${tx + 80} ${F - 58} L ${tx + 92} ${F - 92} Z`} fill="#FFC4D8" />
          {[-60, -20, 20, 60].map((d) => <rect key={d} x={tx + d - 7} y={F - 88} width={14} height={28} fill="#fff" opacity={0.7} />)}
          <rect x={tx - 9} y={F - 58} width={18} height={58} rx={6} fill="#C99A8B" />
          <text x={tx} y={F - 104} textAnchor="middle" fontSize={32}>🌷</text>
        </g>
      ))}
    </g>
  );
}

export function HospitalFurniture() {
  return (
    <g>
      <g transform="translate(530 170)">
        <circle r={62} fill="#fff" stroke="#BDE6FF" strokeWidth={8} />
        <rect x={-14} y={-38} width={28} height={76} rx={8} fill="#FF8A9A" />
        <rect x={-38} y={-14} width={76} height={28} rx={8} fill="#FF8A9A" />
      </g>
      <rect x={760} y={120} width={130} height={170} rx={16} fill="#fff" stroke="#BDE6FF" strokeWidth={5} />
      <text x={825} y={190} textAnchor="middle" fontSize={44}>💊</text>
      <text x={825} y={256} textAnchor="middle" fontSize={40}>🩹</text>
      {[330, 760].map((bx) => (
        <g key={bx}>
          <path d={`M ${bx - 110} ${F - 30} L ${bx - 110} ${F - 120} Q ${bx - 110} ${F - 150} ${bx - 80} ${F - 150} Q ${bx - 50} ${F - 150} ${bx - 50} ${F - 120} L ${bx - 50} ${F - 30} Z`} fill="#BDE6FF" stroke="#8CC8EE" strokeWidth={4} />
          <rect x={bx - 110} y={F - 64} width={220} height={36} rx={14} fill="#fff" stroke="#8CC8EE" strokeWidth={4} />
          <path d={`M ${bx - 40} ${F - 70} Q ${bx + 40} ${F - 84} ${bx + 110} ${F - 70} L ${bx + 110} ${F - 40} L ${bx - 40} ${F - 40} Z`} fill="#A8E6CF" stroke="#5CC3A0" strokeWidth={3} />
          <rect x={bx - 104} y={F - 28} width={10} height={28} rx={4} fill="#B0BEC5" />
          <rect x={bx + 94} y={F - 28} width={10} height={28} rx={4} fill="#B0BEC5" />
        </g>
      ))}
    </g>
  );
}
