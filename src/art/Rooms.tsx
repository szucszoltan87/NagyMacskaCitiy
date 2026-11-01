import type { ReactElement } from 'react';
import { HOME_BED_X, ROOM_DOOR_X, ROOM_FLOOR_Y, ROOM_HEIGHT, ROOM_WIDTH, type BuildingDef } from '../data/buildings';
import { shade } from './color';

const F = ROOM_FLOOR_Y;

export function RoomBackdrop({ def }: { def: BuildingDef }) {
  const dots: ReactElement[] = [];
  for (let r = 0; r * 70 + 40 < F - 30; r++) {
    for (let c = 0; c * 70 < ROOM_WIDTH; c++) {
      const x = 40 + c * 70 + (r % 2) * 35;
      const y = 40 + r * 70;
      dots.push(<circle key={`${r}-${c}`} cx={x} cy={y} r={5} fill={shade(def.wall, -0.1)} />);
    }
  }
  return (
    <g>
      <rect x={0} y={0} width={ROOM_WIDTH} height={F} fill={def.wall} />
      {dots}
      <rect x={0} y={F} width={ROOM_WIDTH} height={ROOM_HEIGHT - F} fill="#C99A6B" />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={0} y1={F + 30 * (i + 1)} x2={ROOM_WIDTH} y2={F + 30 * (i + 1)} stroke="#B5865A" strokeWidth={2} />
      ))}
      <rect x={0} y={F - 14} width={ROOM_WIDTH} height={14} fill={shade(def.wall, -0.3)} />
      <rect x={ROOM_DOOR_X - 55} y={F - 210} width={110} height={210} rx={12} fill={shade(def.roof, -0.1)} stroke={shade(def.roof, -0.4)} strokeWidth={4} />
      <circle cx={ROOM_DOOR_X + 35} cy={F - 105} r={6} fill="#FFD54F" />
      <text x={ROOM_DOOR_X} y={F - 225} textAnchor="middle" fontSize={22} fontWeight={800}>🚪 Ki az utcára</text>
    </g>
  );
}

export function HomeFurniture({ onBall }: { onBall: () => void }) {
  const B = HOME_BED_X;
  return (
    <g>
      <rect x={430} y={120} width={180} height={140} rx={10} fill="#BFE6FF" stroke="#fff" strokeWidth={10} />
      <rect x={200} y={F - 230} width={100} height={230} rx={14} fill="#ECEFF1" stroke="#90A4AE" strokeWidth={4} />
      <line x1={200} y1={F - 150} x2={300} y2={F - 150} stroke="#90A4AE" strokeWidth={4} />
      <rect x={282} y={F - 210} width={8} height={40} rx={4} fill="#90A4AE" />
      <text x={250} y={F - 245} textAnchor="middle" fontSize={22} fontWeight={800}>🧊 Hűtő</text>
      <rect x={330} y={F - 120} width={150} height={120} rx={8} fill="#BCAAA4" stroke="#8D6E63" strokeWidth={4} />
      <rect x={345} y={F - 130} width={120} height={14} rx={6} fill="#90A4AE" />
      <path d={`M 405 ${F - 130} v -40 h 30`} stroke="#78909C" strokeWidth={8} fill="none" strokeLinecap="round" />
      <text x={405} y={F - 185} textAnchor="middle" fontSize={22} fontWeight={800}>💧 Csap</text>
      <g onClick={onBall} style={{ cursor: 'pointer' }}>
        <circle cx={600} cy={F - 28} r={28} fill="#EF5350" stroke="#B71C1C" strokeWidth={3} />
        <path d={`M 572 ${F - 28} Q 600 ${F - 48} 628 ${F - 28}`} stroke="#fff" strokeWidth={5} fill="none" />
        <text x={600} y={F - 70} textAnchor="middle" fontSize={20} fontWeight={800}>⚽ Labda</text>
      </g>
      <rect x={B - 130} y={F - 140} width={22} height={140} rx={8} fill="#8D6E63" />
      <rect x={B - 120} y={F - 60} width={240} height={60} rx={10} fill="#A1887F" />
      <rect x={B - 115} y={F - 82} width={230} height={26} rx={10} fill="#FFFFFF" />
      <ellipse cx={B - 90} cy={F - 88} rx={26} ry={14} fill="#FFF8E1" stroke="#E0E0E0" strokeWidth={2} />
      <text x={B} y={F - 160} textAnchor="middle" fontSize={22} fontWeight={800}>🛏️ Ágy</text>
    </g>
  );
}

export function ShopFurniture() {
  const rows = [['🥕', '🍎', '🥬', '🫘'], ['🐟', '🍗', '🥚', '🍞'], ['🍝', '🥛', '🧃', '🍌']];
  return (
    <g>
      {rows.map((row, r) => (
        <g key={r}>
          <rect x={250} y={140 + r * 110} width={500} height={14} rx={6} fill="#8D6E63" />
          {row.map((e, i) => <text key={i} x={300 + i * 130} y={130 + r * 110} fontSize={56} textAnchor="middle">{e}</text>)}
        </g>
      ))}
      <rect x={780} y={F - 110} width={190} height={110} rx={10} fill="#FFB74D" stroke="#E65100" strokeWidth={4} />
      <text x={875} y={F - 50} textAnchor="middle" fontSize={26} fontWeight={800}>💰 Kassza</text>
    </g>
  );
}

export function RestaurantFurniture() {
  return (
    <g>
      <rect x={380} y={90} width={300} height={170} rx={12} fill="#37474F" stroke="#8D6E63" strokeWidth={10} />
      <text x={530} y={140} textAnchor="middle" fontSize={32} fill="#fff" fontWeight={800}>🍽️ Menü</text>
      <text x={530} y={190} textAnchor="middle" fontSize={34}>🍲 🍉 🍕 🍣 🍔</text>
      <text x={530} y={235} textAnchor="middle" fontSize={18} fill="#fff">🥕 vega · 🍖 húsos · 😋 mindenkinek</text>
      {[320, 720].map((tx) => (
        <g key={tx}>
          <rect x={tx - 70} y={F - 90} width={140} height={14} rx={6} fill="#A1887F" />
          <rect x={tx - 8} y={F - 80} width={16} height={80} fill="#8D6E63" />
          <text x={tx} y={F - 96} textAnchor="middle" fontSize={30}>🕯️</text>
        </g>
      ))}
    </g>
  );
}

export function HospitalFurniture() {
  return (
    <g>
      <g transform="translate(500 150)">
        <rect x={-40} y={-40} width={80} height={80} rx={10} fill="#fff" />
        <rect x={-12} y={-30} width={24} height={60} fill="#E53935" />
        <rect x={-30} y={-12} width={60} height={24} fill="#E53935" />
      </g>
      {[350, 750].map((bx) => (
        <g key={bx}>
          <rect x={bx - 100} y={F - 70} width={200} height={20} rx={8} fill="#E3F2FD" stroke="#90CAF9" strokeWidth={3} />
          <rect x={bx - 100} y={F - 50} width={10} height={50} fill="#90A4AE" />
          <rect x={bx + 90} y={F - 50} width={10} height={50} fill="#90A4AE" />
        </g>
      ))}
    </g>
  );
}
