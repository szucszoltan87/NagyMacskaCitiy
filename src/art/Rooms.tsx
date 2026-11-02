import type { ReactElement, ReactNode } from 'react';
import { LODGE_BED_X, ROOM_DOOR_X, ROOM_FLOOR_Y, ROOM_WIDTH, type BuildingDef } from '../data/buildings';
import { SPOTS } from '../data/spots';
import type { FurnitureId, Wallpaper } from '../sim/types';
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

export function Heart({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }) {
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
    </g>
  );
}

function WallPattern({ kind, wall }: { kind: Wallpaper; wall: string }) {
  if (kind === 'sima') return null;
  const tone = shade(wall, -0.08);
  const items: ReactElement[] = [];
  if (kind === 'csik') {
    for (let i = -6; i * 60 < ROOM_WIDTH + 300; i++) items.push(<rect key={i} x={i * 60} y={-100} width={26} height={F - 20} fill={tone} />);
    return <g>{items}</g>;
  }
  for (let r = 0; r * 80 + 70 < F - 130; r++) {
    for (let c = -3; c * 80 < ROOM_WIDTH + 240; c++) {
      const x = 40 + c * 80 + (r % 2) * 40;
      const y = 80 + r * 80;
      items.push(kind === 'sziv'
        ? <Heart key={`${r}-${c}`} x={x} y={y} s={8} fill={tone} />
        : <circle key={`${r}-${c}`} cx={x} cy={y} r={6} fill={tone} />);
    }
  }
  return <g>{items}</g>;
}

export function RoomBackdrop({ def, wall = def.wall, floor = '#E9C3A4', wallpaper = 'sziv' as Wallpaper, door = true }: {
  def: BuildingDef; wall?: string; floor?: string; wallpaper?: Wallpaper; door?: boolean;
}) {
  const vx = ROOM_WIDTH / 2;
  return (
    <g>
      <rect x={-300} y={-100} width={ROOM_WIDTH + 600} height={F + 100} fill={wall} />
      <WallPattern kind={wallpaper} wall={wall} />
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
      <rect x={-300} y={F} width={ROOM_WIDTH + 600} height={400} fill={floor} />
      {Array.from({ length: 15 }, (_, i) => {
        const x0 = -300 + i * 115;
        return <line key={i} x1={x0} y1={F} x2={vx + (x0 - vx) * 2.4} y2={F + 400} stroke={shade(floor, -0.08)} strokeWidth={3} />;
      })}
      {[40, 100, 180].map((dy) => <line key={dy} x1={-300} y1={F + dy} x2={ROOM_WIDTH + 300} y2={F + dy} stroke={shade(floor, -0.06)} strokeWidth={2} />)}
      <ellipse cx={vx + 30} cy={F + 52} rx={300} ry={46} fill="#fff" />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return <circle key={i} cx={vx + 30 + Math.cos(a) * 300} cy={F + 52 + Math.sin(a) * 46} r={10} fill="#fff" />;
      })}
      <ellipse cx={vx + 30} cy={F + 52} rx={240} ry={32} fill="none" stroke={shade(def.roof, 0.6)} strokeWidth={6} strokeDasharray="14 10" />
      {door && <Door def={def} />}
    </g>
  );
}

function Door({ def }: { def: BuildingDef }) {
  return (
    <g>
      <path d={`M ${ROOM_DOOR_X - 58} ${F} L ${ROOM_DOOR_X - 58} ${F - 160} A 58 58 0 0 1 ${ROOM_DOOR_X + 58} ${F - 160} L ${ROOM_DOOR_X + 58} ${F} Z`} fill={shade(def.roof, 0.25)} stroke={lineColor(def.roof)} strokeWidth={5} />
      <Heart x={ROOM_DOOR_X} y={F - 170} s={14} fill="#fff" />
      <circle cx={ROOM_DOOR_X + 36} cy={F - 100} r={7} fill="#FFE58F" stroke={lineColor(def.roof)} strokeWidth={2} />
      <Sign x={ROOM_DOOR_X} y={F - 248} text="🚪 Ki az utcára" />
    </g>
  );
}

/* ---------------- Bútorok ---------------- */

export function FurniturePiece({ kind, x, label = true }: { kind: FurnitureId; x: number; label?: boolean }) {
  switch (kind) {
    case 'agy':
      return (
        <g>
          <path d={`M ${x - 132} ${F - 40} L ${x - 132} ${F - 150} Q ${x - 132} ${F - 196} ${x - 86} ${F - 196} Q ${x - 40} ${F - 196} ${x - 40} ${F - 150} L ${x - 40} ${F - 40} Z`} fill="#E8B4C8" stroke="#C97A9D" strokeWidth={4} />
          <Heart x={x - 86} y={F - 152} s={16} fill="#fff" />
          <rect x={x - 132} y={F - 70} width={262} height={52} rx={18} fill="#FFF1E2" stroke="#C97A9D" strokeWidth={4} />
          <rect x={x - 118} y={F - 18} width={14} height={18} rx={4} fill="#C97A9D" />
          <rect x={x + 104} y={F - 18} width={14} height={18} rx={4} fill="#C97A9D" />
          <ellipse cx={x - 92} cy={F - 80} rx={34} ry={17} fill="#fff" stroke="#E0CDE8" strokeWidth={3} />
          <path d={`M ${x - 54} ${F - 84} Q ${x + 40} ${F - 104} ${x + 130} ${F - 84} L ${x + 130} ${F - 46} Q ${x + 40} ${F - 34} ${x - 54} ${F - 46} Z`} fill="#C9B6F2" stroke="#9C82E0" strokeWidth={4} />
          {[[-20, -70], [20, -78], [60, -66], [100, -76]].map(([dx, dy]) => <circle key={dx} cx={x + dx} cy={F + dy} r={5} fill="#fff" opacity={0.8} />)}
          {label && <Sign x={x} y={F - 226} text="🛏️ Ágy" />}
        </g>
      );
    case 'huto':
      return (
        <g>
          <rect x={x - 52} y={F - 236} width={104} height={236} rx={22} fill="#BFF0DC" stroke="#5CC3A0" strokeWidth={4} />
          <line x1={x - 52} y1={F - 150} x2={x + 52} y2={F - 150} stroke="#5CC3A0" strokeWidth={4} />
          <rect x={x + 32} y={F - 214} width={9} height={42} rx={4.5} fill="#5CC3A0" />
          <rect x={x + 32} y={F - 132} width={9} height={42} rx={4.5} fill="#5CC3A0" />
          <Heart x={x - 18} y={F - 200} s={10} fill="#FF9EBE" />
          <Sparkle x={x} y={F - 110} s={10} fill="#FFE58F" />
          {label && <Sign x={x} y={F - 262} text="🧊 Hűtő" />}
        </g>
      );
    case 'mosdo':
      return (
        <g>
          <rect x={x - 75} y={F - 124} width={150} height={124} rx={14} fill="#FFF1E2" stroke="#E0B9A0" strokeWidth={4} />
          <rect x={x - 57} y={F - 98} width={52} height={72} rx={10} fill="none" stroke="#E0B9A0" strokeWidth={3} />
          <rect x={x + 5} y={F - 98} width={52} height={72} rx={10} fill="none" stroke="#E0B9A0" strokeWidth={3} />
          <rect x={x - 65} y={F - 136} width={130} height={16} rx={8} fill="#BDE6FF" stroke="#8CC8EE" strokeWidth={3} />
          <path d={`M ${x} ${F - 136} v -38 q 0 -10 10 -10 h 20`} stroke="#B0BEC5" strokeWidth={9} fill="none" strokeLinecap="round" />
          {label && <Sign x={x} y={F - 212} text="💧 Csap" />}
        </g>
      );
    case 'jatekdoboz':
      return (
        <g>
          <rect x={x - 45} y={F - 60} width={90} height={60} rx={12} fill="#FFE58F" stroke="#E8B04B" strokeWidth={4} />
          <Heart x={x} y={F - 32} s={10} fill="#FF9EBE" />
          <circle cx={x + 10} cy={F - 84} r={24} fill="#fff" stroke="#E57AA0" strokeWidth={3} />
          <path d={`M ${x + 10} ${F - 108} Q ${x - 10} ${F - 84} ${x + 10} ${F - 60} Z`} fill="#FF9EBE" />
          <path d={`M ${x + 10} ${F - 108} Q ${x + 30} ${F - 84} ${x + 10} ${F - 60} Z`} fill="#BDE6FF" />
          {label && <Sign x={x} y={F - 134} text="⚽ Labda" />}
        </g>
      );
    case 'kad':
      return (
        <g>
          <path d={`M ${x - 100} ${F - 80} L ${x + 100} ${F - 80} Q ${x + 96} ${F - 10} ${x + 60} ${F - 10} L ${x - 60} ${F - 10} Q ${x - 96} ${F - 10} ${x - 100} ${F - 80} Z`} fill="#fff" stroke="#BDE6FF" strokeWidth={5} />
          <rect x={x - 108} y={F - 90} width={216} height={14} rx={7} fill="#BDE6FF" />
          {[-60, -30, 0, 30, 60].map((d, i) => <circle key={d} cx={x + d} cy={F - 96 - (i % 2) * 10} r={12 + (i % 2) * 4} fill="#fff" stroke="#E5D9F7" strokeWidth={2} />)}
          <rect x={x - 78} y={F - 10} width={10} height={10} fill="#BDE6FF" />
          <rect x={x + 68} y={F - 10} width={10} height={10} fill="#BDE6FF" />
          {label && <Sign x={x} y={F - 140} text="🛁 Kád" />}
        </g>
      );
    case 'kanape':
      return (
        <g>
          <rect x={x - 110} y={F - 110} width={220} height={60} rx={24} fill="#C9B6F2" stroke="#9C82E0" strokeWidth={4} />
          <rect x={x - 110} y={F - 60} width={220} height={50} rx={16} fill="#D9CCF8" stroke="#9C82E0" strokeWidth={4} />
          <rect x={x - 124} y={F - 86} width={30} height={76} rx={14} fill="#C9B6F2" stroke="#9C82E0" strokeWidth={4} />
          <rect x={x + 94} y={F - 86} width={30} height={76} rx={14} fill="#C9B6F2" stroke="#9C82E0" strokeWidth={4} />
          <rect x={x - 70} y={F - 96} width={40} height={34} rx={10} fill="#FFC4D8" />
          <rect x={x - 100} y={F - 10} width={10} height={10} fill="#9C82E0" />
          <rect x={x + 90} y={F - 10} width={10} height={10} fill="#9C82E0" />
        </g>
      );
    case 'tv':
      return (
        <g>
          <rect x={x - 60} y={F - 50} width={120} height={50} rx={10} fill="#FFE58F" stroke="#E8B04B" strokeWidth={4} />
          <rect x={x - 66} y={F - 150} width={132} height={92} rx={16} fill="#6B5B95" stroke="#4E4270" strokeWidth={4} />
          <rect x={x - 54} y={F - 140} width={108} height={72} rx={10} fill="#A8E6CF" />
          <circle cx={x - 20} cy={F - 106} r={14} fill="#FFE58F" />
          <path d={`M ${x + 6} ${F - 88} q 14 -24 30 0 Z`} fill="#5CC3A0" />
          {label && <Sign x={x} y={F - 176} text="📺 Tévé" />}
        </g>
      );
    case 'konyvespolc':
      return (
        <g>
          <rect x={x - 60} y={F - 220} width={120} height={220} rx={10} fill="#E8C3A4" stroke="#C99A8B" strokeWidth={4} />
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <rect x={x - 56} y={F - 150 + r * 70} width={112} height={8} fill="#C99A8B" />
              {[0, 1, 2, 3, 4].map((b) => <rect key={b} x={x - 50 + b * 21} y={F - 196 + r * 70} width={16} height={46 - (b % 2) * 8} rx={3} fill={PASTELS[(b + r) % 5]} />)}
            </g>
          ))}
          {label && <Sign x={x} y={F - 246} text="📚 Könyvek" />}
        </g>
      );
    case 'noveny':
      return (
        <g>
          <path d={`M ${x - 26} ${F} L ${x - 32} ${F - 48} L ${x + 32} ${F - 48} L ${x + 26} ${F} Z`} fill="#FFB38A" stroke="#D9825B" strokeWidth={3} />
          {[-40, -15, 15, 40].map((a) => <ellipse key={a} cx={x + a * 0.6} cy={F - 90} rx={14} ry={36} fill="#7CCFB0" stroke="#4FA88A" strokeWidth={3} transform={`rotate(${a} ${x} ${F - 50})`} />)}
        </g>
      );
    case 'lampa':
      return (
        <g>
          <rect x={x - 4} y={F - 180} width={8} height={180} fill="#C9B6F2" />
          <ellipse cx={x} cy={F - 4} rx={26} ry={8} fill="#C9B6F2" />
          <path d={`M ${x - 40} ${F - 170} L ${x - 24} ${F - 216} L ${x + 24} ${F - 216} L ${x + 40} ${F - 170} Z`} fill="#FFE58F" stroke="#E8B04B" strokeWidth={3} />
          <circle cx={x} cy={F - 160} r={40} fill="#FFF3B0" opacity={0.35} />
        </g>
      );
    case 'szonyeg':
      return (
        <g>
          <ellipse cx={x} cy={F + 20} rx={110} ry={22} fill="#FFC4D8" stroke="#F29BB8" strokeWidth={4} />
          <ellipse cx={x} cy={F + 20} rx={80} ry={14} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="10 8" />
        </g>
      );
    case 'kep':
      return (
        <g>
          <rect x={x - 55} y={F - 360} width={110} height={90} rx={10} fill="#fff" stroke="#E8B4C8" strokeWidth={8} />
          <circle cx={x - 20} cy={F - 330} r={12} fill="#FFE58F" />
          <path d={`M ${x - 46} ${F - 282} L ${x - 10} ${F - 320} L ${x + 16} ${F - 296} L ${x + 30} ${F - 310} L ${x + 46} ${F - 282} Z`} fill="#7CCFB0" />
        </g>
      );
  }
}

/* ---------------- Boltok, helyek ---------------- */

function Shelf({ x, y, w, items, color = '#C9B6F2' }: { x: number; y: number; w: number; items: string[]; color?: string }) {
  return (
    <g pointerEvents="none">
      <rect x={x} y={y} width={w} height={14} rx={7} fill={color} stroke="#fff" strokeWidth={3} />
      {items.map((e, i) => <text key={i} x={x + (w / items.length) * (i + 0.5)} y={y - 8} fontSize={50} textAnchor="middle">{e}</text>)}
    </g>
  );
}

export function ShopFurniture() {
  const rows = [['🥕', '🍎', '🥬', '🍅'], ['🐟', '🍗', '🥚', '🧀'], ['🍝', '🥛', '🧃', '🍼']];
  return (
    <g>
      <rect x={232} y={86} width={536} height={360} rx={24} fill="#FFF8EE" stroke="#E0B9A0" strokeWidth={5} />
      {rows.map((row, r) => <Shelf key={r} x={250} y={180 + r * 110} w={500} items={row} color={PASTELS[r]} />)}
      <rect x={790} y={F - 120} width={190} height={120} rx={20} fill="#FFE58F" stroke="#E8B04B" strokeWidth={4} />
      <rect x={830} y={F - 168} width={110} height={52} rx={12} fill="#C9B6F2" stroke="#9C82E0" strokeWidth={4} />
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
      <rect x={760} y={F - 150} width={200} height={150} rx={18} fill="#FFF1E2" stroke="#E0B9A0" strokeWidth={4} />
      <rect x={780} y={F - 172} width={160} height={26} rx={8} fill="#B0BEC5" />
      <text x={830} y={F - 180} fontSize={40}>🍳</text>
      <text x={890} y={F - 180} fontSize={36}>🥘</text>
      {[310].map((tx) => (
        <g key={tx}>
          <ellipse cx={tx} cy={F - 92} rx={92} ry={18} fill="#fff" stroke="#E8B4C8" strokeWidth={3} />
          <path d={`M ${tx - 92} ${F - 92} L ${tx - 80} ${F - 58} L ${tx + 80} ${F - 58} L ${tx + 92} ${F - 92} Z`} fill="#FFC4D8" />
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
          <rect x={bx - 110} y={F - 64} width={220} height={36} rx={14} fill="#fff" stroke="#8CC8EE" strokeWidth={4} />
          <path d={`M ${bx - 40} ${F - 70} Q ${bx + 40} ${F - 84} ${bx + 110} ${F - 70} L ${bx + 110} ${F - 40} L ${bx - 40} ${F - 40} Z`} fill="#A8E6CF" stroke="#5CC3A0" strokeWidth={3} />
          <rect x={bx - 104} y={F - 28} width={10} height={28} rx={4} fill="#B0BEC5" />
          <rect x={bx + 94} y={F - 28} width={10} height={28} rx={4} fill="#B0BEC5" />
        </g>
      ))}
    </g>
  );
}

function Rack({ x, items }: { x: number; items: string[] }) {
  return (
    <g pointerEvents="none">
      <rect x={x} y={140} width={8} height={F - 140} fill="#C9B6F2" />
      <rect x={x + 252} y={140} width={8} height={F - 140} fill="#C9B6F2" />
      <rect x={x} y={136} width={260} height={10} rx={5} fill="#9C82E0" />
      {items.map((e, i) => <text key={i} x={x + 40 + i * 60} y={220} fontSize={56} textAnchor="middle">{e}</text>)}
    </g>
  );
}

export function ClothesShopScene({ items }: { items: string[] }) {
  return (
    <g>
      <Rack x={230} items={items.slice(0, 4)} />
      <g pointerEvents="none">{items.slice(4, 8).map((e, i) => <text key={i} x={270 + i * 60} y={330} fontSize={50} textAnchor="middle">{e}</text>)}</g>
      <rect x={600} y={110} width={120} height={300} rx={60} fill="#fff" stroke="#E8B4C8" strokeWidth={8} />
      <rect x={614} y={124} width={92} height={272} rx={46} fill="#DFF3FF" />
      <path d="M 630 160 L 660 130" stroke="#fff" strokeWidth={8} strokeLinecap="round" />
      <path d={`M 790 120 Q 840 300 800 ${F} L 960 ${F} Q 920 300 960 120 Z`} fill="#FFC4D8" stroke="#F29BB8" strokeWidth={3} />
      <Sign x={875} y={100} text="👗 Próbafülke" />
    </g>
  );
}

export function SalonScene() {
  return (
    <g pointerEvents="none">
      {[320, 640].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={210} rx={80} ry={100} fill="#fff" stroke="#FFB8CC" strokeWidth={10} />
          <ellipse cx={x} cy={210} rx={64} ry={84} fill="#DFF3FF" />
          <path d={`M ${x - 30} 150 L ${x} 120`} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
          <rect x={x - 60} y={F - 110} width={120} height={70} rx={24} fill="#FF9EBE" stroke="#E57AA0" strokeWidth={4} />
          <rect x={x - 10} y={F - 40} width={20} height={40} fill="#C9B6F2" />
        </g>
      ))}
      <text x={850} y={260} fontSize={60}>💅</text>
      <text x={850} y={360} fontSize={60}>✂️</text>
      <text x={480} y={110} fontSize={44}>🎀</text>
    </g>
  );
}

export function FurnitureShopScene() {
  return (
    <g pointerEvents="none">
      <FurniturePiece kind="kanape" x={330} label={false} />
      <FurniturePiece kind="lampa" x={500} label={false} />
      <FurniturePiece kind="noveny" x={600} label={false} />
      <FurniturePiece kind="kep" x={330} label={false} />
      {PASTELS.map((c, i) => (
        <g key={c} transform={`translate(${700 + (i % 3) * 80} ${F - 60 - Math.floor(i / 3) * 70})`}>
          <rect x={-26} y={-40} width={52} height={50} rx={8} fill={c} stroke="#fff" strokeWidth={3} />
          <path d="M -26 -40 Q 0 -54 26 -40" stroke="#B0BEC5" strokeWidth={3} fill="none" />
        </g>
      ))}
      <Sign x={780} y={F - 200} text="🎨 Festékek" />
    </g>
  );
}

export function OvodaScene() {
  return (
    <g pointerEvents="none">
      <Window x={460} y={110} />
      {['🧸', '🧩', '🪀', '🎨'].map((e, i) => <text key={e} x={260 + i * 70} y={F - 30} fontSize={50}>{e}</text>)}
      <rect x={720} y={F - 140} width={220} height={120} rx={20} fill="#FFE58F" stroke="#E8B04B" strokeWidth={4} />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={735 + i * 40} y={F - 130} width={8} height={100} fill="#E8B04B" />)}
      <Sign x={830} y={F - 166} text="🍼 Kiságy" />
    </g>
  );
}

export function IskolaScene() {
  return (
    <g pointerEvents="none">
      <rect x={300} y={90} width={460} height={230} rx={16} fill="#4E7A6A" stroke="#C99A8B" strokeWidth={12} />
      <text x={530} y={170} textAnchor="middle" fontSize={40} fill="#fff" fontWeight={600}>🐾 Macska-óra</text>
      <text x={530} y={230} textAnchor="middle" fontSize={30} fill="#fff">🦁 🐯 🐆 + 🧮</text>
      <text x={530} y={286} textAnchor="middle" fontSize={22} fill="#E9FBF2">Koppints lent: 📚 Óra indítása</text>
      {[300, 560, 820].map((x) => (
        <g key={x}>
          <rect x={x - 70} y={F - 80} width={140} height={16} rx={6} fill="#FFE58F" stroke="#E8B04B" strokeWidth={3} />
          <rect x={x - 60} y={F - 64} width={10} height={64} fill="#E8B04B" />
          <rect x={x + 50} y={F - 64} width={10} height={64} fill="#E8B04B" />
        </g>
      ))}
    </g>
  );
}

export function FireScene({ police }: { police: boolean }) {
  return (
    <g pointerEvents="none">
      {police ? (
        <g>
          <rect x={300} y={110} width={300} height={200} rx={14} fill="#fff" stroke="#9FA8DA" strokeWidth={8} />
          <text x={450} y={200} textAnchor="middle" fontSize={56}>🗺️</text>
          <text x={450} y={270} textAnchor="middle" fontSize={22} fill={INK}>Nyomozás 🔍</text>
          <text x={760} y={F - 30} fontSize={110}>🚓</text>
        </g>
      ) : (
        <g>
          <rect x={260} y={F - 170} width={360} height={140} rx={30} fill="#FF8A9A" stroke="#E5566C" strokeWidth={5} />
          <rect x={290} y={F - 150} width={90} height={60} rx={12} fill="#CDEBFF" />
          <rect x={400} y={F - 200} width={200} height={14} rx={7} fill="#B0BEC5" />
          <circle cx={320} cy={F - 26} r={26} fill="#6B5B95" stroke="#fff" strokeWidth={4} />
          <circle cx={560} cy={F - 26} r={26} fill="#6B5B95" stroke="#fff" strokeWidth={4} />
          <rect x={800} y={60} width={16} height={F - 60} fill="#FFE58F" stroke="#E8B04B" strokeWidth={3} />
          <text x={760} y={200} fontSize={50}>⛑️</text>
        </g>
      )}
    </g>
  );
}

export function LodgeScene() {
  return (
    <g pointerEvents="none">
      <rect x={300} y={F - 220} width={200} height={220} rx={16} fill="#BCAAA4" stroke="#8D6E63" strokeWidth={5} />
      <path d={`M 340 ${F} L 340 ${F - 110} Q 400 ${F - 160} 460 ${F - 110} L 460 ${F} Z`} fill="#5B3350" />
      <path d={`M 370 ${F - 10} Q 400 ${F - 90} 430 ${F - 10} Z`} fill="#FFB38A" />
      <path d={`M 385 ${F - 10} Q 400 ${F - 60} 415 ${F - 10} Z`} fill="#FFE58F" />
      {[-60, 0, 60].map((d) => (
        <g key={d}>
          <rect x={LODGE_BED_X + d - 40} y={F - 50} width={80} height={40} rx={12} fill="#FFF1E2" stroke="#C97A9D" strokeWidth={3} />
          <path d={`M ${LODGE_BED_X + d - 40} ${F - 46} h 80 v 18 h -80 Z`} fill={PASTELS[(d / 60 + 1)]} />
        </g>
      ))}
      <Sign x={LODGE_BED_X} y={F - 90} text="🛏️ Ágyak" />
    </g>
  );
}

export function StationScene({ kind, board }: { kind: 'busz' | 'vasut' | 'repter'; board: ReactNode }) {
  return (
    <g>
      <rect x={300} y={80} width={420} height={210} rx={18} fill="#2F2566" stroke="#C9B6F2" strokeWidth={8} />
      <g fill="#FFE58F" fontSize={24} fontWeight={600}>{board}</g>
      {kind === 'repter' ? (
        (['kapu_sz', 'kapu_os'] as const).map((k) => (
          <g key={k} pointerEvents="none">
            <path d={`M ${SPOTS[k].x - 70} ${F} L ${SPOTS[k].x - 70} ${F - 160} Q ${SPOTS[k].x} ${F - 230} ${SPOTS[k].x + 70} ${F - 160} L ${SPOTS[k].x + 70} ${F} Z`} fill="#EDE4FF" stroke="#9C82E0" strokeWidth={6} />
            <Sign x={SPOTS[k].x} y={F - 250} text={SPOTS[k].label} />
          </g>
        ))
      ) : (
        <g pointerEvents="none">
          <rect x={560} y={F - 70} width={300} height={20} rx={10} fill="#FFB38A" stroke="#D9825B" strokeWidth={3} />
          <rect x={580} y={F - 50} width={12} height={50} fill="#D9825B" />
          <rect x={828} y={F - 50} width={12} height={50} fill="#D9825B" />
          <Sign x={710} y={F - 110} text="🪑 Váró" />
        </g>
      )}
    </g>
  );
}

/* ---------------- Szabadtéri helyek ---------------- */

function OutdoorBase({ water = false }: { water?: boolean }) {
  return (
    <g>
      <rect x={-300} y={-100} width={ROOM_WIDTH + 600} height={F + 100} fill="#BDE6FF" />
      <circle cx={850} cy={110} r={50} fill="#FFE58F" stroke="#F5B94A" strokeWidth={4} />
      {[150, 450].map((x) => (
        <path key={x} d={`M ${x - 70} 140 Q ${x - 90} 120 ${x - 60} 110 Q ${x - 40} 80 ${x} 96 Q ${x + 40} 76 ${x + 60} 106 Q ${x + 90} 110 ${x + 70} 140 Z`} fill="#fff" />
      ))}
      <path d={`M -300 ${F - 120} Q 200 ${F - 220} 600 ${F - 130} T 1300 ${F - 140} L 1300 ${F} L -300 ${F} Z`} fill="#B8EBD3" />
      <rect x={-300} y={F} width={ROOM_WIDTH + 600} height={400} fill={water ? '#FFE9B0' : '#A8E6CF'} />
      {water && (
        <g>
          <path d={`M 560 ${F - 30} Q 700 ${F - 50} 860 ${F - 30} T 1300 ${F - 30} L 1300 ${F + 400} L 560 ${F + 400} Q 520 ${F + 100} 560 ${F - 30} Z`} fill="#7FD3F2" />
          {[620, 760, 900].map((x) => <path key={x} d={`M ${x} ${F + 40} q 20 -10 40 0`} stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" />)}
        </g>
      )}
      <Sign x={ROOM_DOOR_X} y={F - 40} text="🚪 Ki az utcára" />
    </g>
  );
}

export function ParkScene() {
  const h = SPOTS.hinta.x;
  const c = SPOTS.csuszda.x;
  return (
    <g>
      <OutdoorBase />
      <g pointerEvents="none">
        <path d={`M ${h - 110} ${F + 30} L ${h - 80} ${F - 270} L ${h + 80} ${F - 270} L ${h + 110} ${F + 30}`} stroke="#E57AA0" strokeWidth={12} fill="none" strokeLinejoin="round" />
        <line x1={h - 30} y1={F - 270} x2={h - 30} y2={F - 20} stroke="#B48AA6" strokeWidth={4} />
        <line x1={h + 30} y1={F - 270} x2={h + 30} y2={F - 20} stroke="#B48AA6" strokeWidth={4} />
        <rect x={h - 44} y={F - 24} width={88} height={14} rx={7} fill="#FFE58F" stroke="#E8B04B" strokeWidth={3} />
        <Sign x={h} y={F - 300} text={SPOTS.hinta.label} />
        <path d={`M ${c - 130} ${F + 30} L ${c - 130} ${F - 200} L ${c - 80} ${F - 200} Q ${c + 20} ${F - 180} ${c + 120} ${F + 20}`} fill="none" stroke="#5CC3A0" strokeWidth={16} strokeLinejoin="round" strokeLinecap="round" />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={c - 150} y1={F - 30 - i * 45} x2={c - 110} y2={F - 30 - i * 45} stroke="#A8E6CF" strokeWidth={8} />)}
        <Sign x={c} y={F - 230} text={SPOTS.csuszda.label} />
        <text x={880} y={F + 90} fontSize={44}>🌼</text>
        <text x={220} y={F + 120} fontSize={40}>🌷</text>
      </g>
    </g>
  );
}

export function StrandScene({ castle }: { castle: number }) {
  return (
    <g>
      <OutdoorBase water />
      <g pointerEvents="none">
        <line x1={300} y1={F + 60} x2={300} y2={F - 160} stroke="#B98673" strokeWidth={7} />
        <path d={`M 190 ${F - 150} Q 300 ${F - 240} 410 ${F - 150} Z`} fill="#FF9EBE" stroke="#E57AA0" strokeWidth={4} />
        <Sign x={760} y={F - 70} text={SPOTS.viz.label} />
      </g>
      <g transform={`translate(420 ${F + 90})`}>
        {castle >= 1 && <rect x={-50} y={-30} width={100} height={30} rx={4} fill="#E8C07A" />}
        {castle >= 2 && <rect x={-36} y={-60} width={72} height={30} rx={4} fill="#E8C07A" />}
        {castle >= 3 && <rect x={-20} y={-90} width={40} height={30} rx={4} fill="#E8C07A" />}
        {castle >= 4 && <path d="M 0 -90 L 0 -130 L 22 -120 L 0 -110" fill="#FF8FB4" stroke="#B98673" strokeWidth={3} />}
        <text x={70} y={-6} fontSize={36}>🪣</text>
      </g>
    </g>
  );
}

export const HOME_DROP_RADIUS = 120;
