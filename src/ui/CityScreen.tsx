import { useEffect, useMemo, useRef } from 'react';
import { BuildingArt } from '../art/BuildingArt';
import { CatFigure } from '../art/CatFigure';
import { defaultLooks } from '../sim/cats';
import { Backdrop, Sky, Street, StreetFront } from '../art/Scenery';
import {
  BUILDING_IDS, BUILDINGS, GROUND_Y, ROOM_DOOR_X, SCENE_HEIGHT, SIDEWALK_BOTTOM, SIDEWALK_Y, STREETS, WORKSHOP, type BuildingDef,
} from '../data/buildings';
import { ROUTES } from '../data/transport';
import { moveCat } from '../sim/actions';
import { buildSnowman, findOcelot, giraffeCount, localDoneToday, meetWild, ocelotX, SNOWMAN_STEPS } from '../sim/local';
import { buildingOpen } from '../sim/progress';
import { dayOf, minuteOfDay, phaseOf } from '../sim/time';
import type { BuildingId, SpeciesId, StreetId, World } from '../sim/types';
import { useGame } from '../store/store';
import { CatSprite } from './CatSprite';
import { heldLast, useCatDrag, type Pt } from './useCatDrag';

const WILD: Partial<Record<StreetId, Array<[SpeciesId, number]>>> = {
  hoshegy: [['hoparduc', 2050], ['hiuz', 2250]],
  szavanna: [['oroszlan', 1850], ['gepard', 2050], ['szerval', 2200], ['karakal', 2320], ['leopard', 1730]],
  oserdo: [['jaguar', 1800], ['tigris', 2000], ['fekete_parduc', 2150], ['kodfoltos_parduc', 2300]],
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function streetBuildings(street: StreetId): BuildingDef[] {
  const list = BUILDING_IDS.map((id) => BUILDINGS[id]).filter((b) => b.street === street);
  if (street === 'belvaros') list.push(WORKSHOP);
  return list.sort((a, b) => a.x - b.x);
}

function gaps(list: BuildingDef[], width: number): number[] {
  const xs: number[] = [];
  for (let i = 0; i < list.length - 1; i++) {
    const end = list[i].x + list[i].width;
    if (list[i + 1].x - end >= 80) xs.push((end + list[i + 1].x) / 2);
  }
  const last = list[list.length - 1];
  if (last && width - (last.x + last.width) > 200) xs.push(last.x + last.width + 120);
  return xs;
}

function Vehicle({ world, street }: { world: World; street: StreetId }) {
  const m = minuteOfDay(world.minute);
  const parked = ROUTES.filter((r) => BUILDINGS[r.from].street === street && r.departures.some((d) => m >= d - 8 && m < d));
  const seen = new Set<string>();
  return (
    <g pointerEvents="none">
      {parked.map((r) => {
        if (seen.has(r.from)) return null;
        seen.add(r.from);
        const x = BUILDINGS[r.from].doorX;
        const y = SIDEWALK_BOTTOM + 8;
        if (r.mode === 'busz') {
          return (
            <g key={r.from} transform={`translate(${x - 150} ${y - 120})`}>
              <rect width={300} height={120} rx={30} fill="#FFE58F" stroke="#E8B04B" strokeWidth={5} />
              {[0, 1, 2, 3].map((i) => <rect key={i} x={24 + i * 64} y={20} width={50} height={44} rx={12} fill="#CDEBFF" stroke="#E8B04B" strokeWidth={3} />)}
              <circle cx={70} cy={120} r={22} fill="#6B5B95" stroke="#fff" strokeWidth={4} />
              <circle cx={230} cy={120} r={22} fill="#6B5B95" stroke="#fff" strokeWidth={4} />
              <text x={150} y={100} textAnchor="middle" fontSize={20} fontWeight={700} fill="#8A6079">🚌 Busz</text>
            </g>
          );
        }
        if (r.mode === 'vonat') {
          return (
            <g key={r.from} transform={`translate(${x - 260} ${y - 130})`}>
              {[0, 1].map((k) => (
                <g key={k} transform={`translate(${k * 260} 0)`}>
                  <rect width={240} height={110} rx={24} fill={k ? '#BDE6FF' : '#FF9EBE'} stroke="#8A6079" strokeWidth={4} />
                  {[0, 1, 2].map((i) => <rect key={i} x={24 + i * 70} y={20} width={50} height={40} rx={10} fill="#fff" />)}
                  <circle cx={50} cy={112} r={18} fill="#6B5B95" />
                  <circle cx={190} cy={112} r={18} fill="#6B5B95" />
                </g>
              ))}
              <rect x={-20} y={-30} width={40} height={40} rx={8} fill="#FF9EBE" stroke="#8A6079" strokeWidth={4} />
            </g>
          );
        }
        return (
          <g key={r.from} transform={`translate(${x} ${GROUND_Y - 330})`}>
            <ellipse cx={0} cy={0} rx={170} ry={36} fill="#fff" stroke="#9C82E0" strokeWidth={5} />
            <path d="M -40 -6 L -90 -80 L -50 -80 L 20 -6 Z" fill="#C9B6F2" stroke="#9C82E0" strokeWidth={4} />
            <path d="M 140 -10 L 160 -60 L 180 -60 L 170 -6 Z" fill="#FF9EBE" stroke="#E57AA0" strokeWidth={3} />
            {[-100, -60, -20, 20, 60, 100].map((d) => <circle key={d} cx={d} cy={-6} r={8} fill="#CDEBFF" />)}
            <text x={0} y={70} textAnchor="middle" fontSize={22} fontWeight={700} fill="#5B3350">✈️ Hamarosan indul!</text>
          </g>
        );
      })}
    </g>
  );
}

function LocalSpots({ world, street }: { world: World; street: StreetId }) {
  const act = useGame((s) => s.act);
  const openModal = useGame((s) => s.openModal);
  const day = dayOf(world.minute);
  if (street === 'hoshegy') {
    const n = localDoneToday(world, 'hoshegy') ? SNOWMAN_STEPS : world.snowman;
    return (
      <g className="building" onClick={() => act((w) => buildSnowman(w))} transform={`translate(1880 ${GROUND_Y + 20})`}>
        <ellipse cx={0} cy={10} rx={110} ry={26} fill="#fff" stroke="#DCE6FF" strokeWidth={4} />
        {n >= 1 && <circle cx={0} cy={-36} r={44} fill="#fff" stroke="#BCCBEA" strokeWidth={4} />}
        {n >= 2 && <circle cx={0} cy={-106} r={32} fill="#fff" stroke="#BCCBEA" strokeWidth={4} />}
        {n >= 3 && (
          <g>
            <circle cx={0} cy={-156} r={24} fill="#fff" stroke="#BCCBEA" strokeWidth={4} />
            <circle cx={-8} cy={-160} r={3.5} fill="#5B3350" /><circle cx={8} cy={-160} r={3.5} fill="#5B3350" />
            <path d="M 0 -152 l 18 4 l -18 4 Z" fill="#FF9C8A" />
            <path d="M -24 -132 Q 0 -122 24 -132" stroke="#FF8FB4" strokeWidth={8} fill="none" />
          </g>
        )}
        <g transform="translate(0 -230)">
          <rect x={-110} y={-22} width={220} height={40} rx={20} fill="#FFF8EE" stroke="#C9B6F2" strokeWidth={3} />
          <text y={6} textAnchor="middle" fontSize={20} fontWeight={600} fill="#5B3350">⛄ Hóember ({n}/{SNOWMAN_STEPS})</text>
        </g>
      </g>
    );
  }
  if (street === 'szavanna') {
    const count = giraffeCount(day);
    return (
      <g>
        {Array.from({ length: count }, (_, i) => (
          <g key={i} transform={`translate(${1650 + i * 115} ${GROUND_Y - 10 - (i % 2) * 20}) scale(${0.8 + (i % 3) * 0.1})`} pointerEvents="none">
            <path d="M -30 0 L -26 -60 M 26 0 L 22 -60" stroke="#E8B04B" strokeWidth={8} strokeLinecap="round" />
            <ellipse cx={0} cy={-70} rx={42} ry={22} fill="#FFD66B" stroke="#E8B04B" strokeWidth={3} />
            <path d="M 30 -80 L 50 -190" stroke="#FFD66B" strokeWidth={16} strokeLinecap="round" />
            <ellipse cx={58} cy={-196} rx={18} ry={12} fill="#FFD66B" stroke="#E8B04B" strokeWidth={3} />
            <circle cx={62} cy={-200} r={2.5} fill="#5B3350" />
            {[[-14, -74], [8, -66], [22, -78], [38, -130], [44, -160]].map(([x, y]) => <circle key={`${x}`} cx={x} cy={y} r={6} fill="#E8A24B" />)}
          </g>
        ))}
        <g className="building" onClick={() => openModal({ kind: 'zsiraf' })} transform={`translate(2280 ${GROUND_Y + 30})`}>
          <rect x={-6} y={-90} width={12} height={90} fill="#B98673" />
          <rect x={-110} y={-130} width={220} height={50} rx={20} fill="#FFF8EE" stroke="#E8B04B" strokeWidth={4} />
          <text y={-98} textAnchor="middle" fontSize={21} fontWeight={600} fill="#5B3350">🦒 Hány zsiráf van?</text>
        </g>
      </g>
    );
  }
  if (street === 'oserdo') {
    const x = ocelotX(day);
    const found = localDoneToday(world, 'oserdo');
    return (
      <g>
        <g className="building" onClick={() => act((w) => findOcelot(w))} transform={`translate(${x} ${GROUND_Y + 10})`}>
          {!found && (
            <g transform="translate(0 -40) scale(0.3)">
              <CatFigure looks={defaultLooks('ocelot', 'lany', 'felnott')} age="felnott" activity="all" sick={false} facing={1} />
            </g>
          )}
          <g fill="#5CC3A0" stroke="#3FA582" strokeWidth={3}>
            <circle cx={-34} cy={-20} r={30} /><circle cx={30} cy={-18} r={32} /><circle cx={-4} cy={-40} r={30} />
          </g>
          {!found && <ellipse cx={-2} cy={-44} rx={14} ry={9} fill="#D9A85F" opacity={0.9} />}
        </g>
        <g transform={`translate(2280 ${GROUND_Y - 160})`} pointerEvents="none">
          <rect x={-130} y={-22} width={260} height={40} rx={20} fill="#FFF8EE" stroke="#5CC3A0" strokeWidth={3} />
          <text y={6} textAnchor="middle" fontSize={19} fontWeight={600} fill="#5B3350">{found ? '✅ Megtaláltad ma az ocelotot!' : '🔍 Hol bújt el az ocelot?'}</text>
        </g>
      </g>
    );
  }
  return null;
}

export function CityScreen({ street }: { street: StreetId }) {
  const world = useGame((s) => s.world)!;
  const selected = useGame((s) => s.selectedCatId);
  const focusCatId = useGame((s) => s.focusCatId);
  const setScreen = useGame((s) => s.setScreen);
  const act = useGame((s) => s.act);
  const showToast = useGame((s) => s.showToast);
  const svgRef = useRef<SVGSVGElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const def = STREETS[street];
  const width = def.width;
  const list = useMemo(() => streetBuildings(street), [street]);
  const xs = useMemo(() => gaps(list, width), [list, width]);

  const buildingAt = (p: Pt): BuildingId | null => {
    for (const b of list) {
      if (b.id === 'muhely') continue;
      if (p.x >= b.x && p.x <= b.x + b.width && p.y >= GROUND_Y - b.height && p.y <= GROUND_Y + 20) return b.id;
    }
    return null;
  };

  const { lift, onCatPointerDown, svgHandlers } = useCatDrag(svgRef, (catId, p) => {
    const target = buildingAt(p);
    act((w) => (target ? moveCat(w, catId, target, ROOM_DOOR_X + 80) : moveCat(w, catId, 'utca', clamp(p.x, 40, width - 40), street)));
  });

  useEffect(() => {
    if (!focusCatId) return;
    const cat = useGame.getState().world?.cats.find((c) => c.id === focusCatId);
    const el = scrollRef.current;
    const svg = svgRef.current;
    if (cat && cat.place === 'utca' && el && svg) {
      const scale = svg.clientWidth / width;
      el.scrollTo({ left: cat.x * scale - el.clientWidth / 2, behavior: 'smooth' });
    }
    useGame.getState().focus(null);
  }, [focusCatId, width]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0 });
  }, [street]);

  const phase = phaseOf(world.minute);
  const lit = phase === 'este' || phase === 'ejjel';
  const cats = heldLast(world.cats.filter((c) => c.place === 'utca' && c.street === street), lift?.catId);
  const open = (b: BuildingDef) => {
    if (b.id === 'muhely') return setScreen({ kind: 'creator' });
    if (!buildingOpen(world, b.id)) return showToast(`🔒 Még ${b.unlock - world.stars} ⭐ kell! Teljesíts feladatokat a 📋 táblán.`);
    setScreen({ kind: 'inside', building: b.id });
  };

  return (
    <div className="city-scroll" ref={scrollRef}>
      <svg ref={svgRef} className="city-svg" style={{ width: `calc(100dvh * ${width} / 700)` }} viewBox={`0 0 ${width} ${SCENE_HEIGHT}`} {...svgHandlers}>
        <Sky phase={phase} width={width} scenery={def.scenery} />
        <Backdrop night={phase === 'ejjel'} xs={xs} scenery={def.scenery} />
        <Street width={width} scenery={def.scenery} />
        {(WILD[street] ?? []).map(([sp, x]) => (
          <g key={sp} className="building" transform={`translate(${x} ${GROUND_Y - 6}) scale(0.5)`} onClick={() => act((w) => meetWild(w, sp))} opacity={0.92}>
            <CatFigure looks={defaultLooks(sp, 'fiu', 'felnott')} age="felnott" activity="all" sick={false} facing={-1} />
          </g>
        ))}
        {list.map((b) => (
          <BuildingArt key={b.id} def={b} lit={lit} locked={b.id !== 'muhely' && !buildingOpen(world, b.id)} onOpen={() => open(b)} />
        ))}
        <LocalSpots world={world} street={street} />
        <StreetFront lit={lit} xs={xs} scenery={def.scenery} width={width} />
        <Vehicle world={world} street={street} />
        {cats.map((c) => {
          const l = lift?.catId === c.id ? lift.p : null;
          return (
            <CatSprite
              key={c.id}
              cat={c}
              x={l ? l.x : c.x}
              y={l ? l.y + 60 : SIDEWALK_Y}
              minute={world.minute}
              selected={c.id === selected}
              lifted={!!l}
              onPointerDown={onCatPointerDown(c.id)}
            />
          );
        })}
      </svg>
    </div>
  );
}

