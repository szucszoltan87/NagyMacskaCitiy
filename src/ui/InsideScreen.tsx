import { memo, useRef, useState, type PointerEvent } from 'react';
import {
  ClothesShopScene, FireScene, FurniturePiece, FurnitureShopScene, HospitalFurniture, IskolaScene, LodgeScene, OvodaScene, ParkScene,
  RestaurantFurniture, RoomBackdrop, SalonScene, ShopFurniture, StationScene, StrandScene,
} from '../art/Rooms';
import { BUILDINGS, isHome, isLodge, ROOM_DOOR_X, ROOM_FLOOR_Y, ROOM_HEIGHT, ROOM_WIDTH } from '../data/buildings';
import { CLOTHES, CLOTHING_IDS } from '../data/clothes';
import { FURNITURE } from '../data/furniture';
import { MODE_LABEL, nextDeparture, routesFrom } from '../data/transport';
import { SPOTS } from '../data/spots';
import { moveCat, playBall, putToBed, readBook, useSpot, watchTv } from '../sim/actions';
import { findTeddy } from '../sim/events';
import { moveFurniture, storeFurniture } from '../sim/homes';
import { buildSandcastle } from '../sim/local';
import { formatClock } from '../sim/time';
import type { BuildingId, FurnitureId, HomeId, World } from '../sim/types';
import { useGame } from '../store/store';
import { CatSprite } from './CatSprite';
import {
  ClothesShopTray, EditTray, EventTray, FurnitureShopTray, HomeTray, HospitalTray, InfoTray, MealTray, SalonTray, ShopTray, TimetableTray, WorkerInfo,
} from './trays';
import { heldLast, toSvgPoint, useCatDrag, type Pt } from './useCatDrag';

const F = ROOM_FLOOR_Y;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function Board({ world, building }: { world: World; building: BuildingId }) {
  return (
    <>
      {routesFrom(building).slice(0, 3).map((r, i) => {
        const t = nextDeparture(r, world.minute);
        return (
          <text key={`${r.to}`} x={330} y={140 + i * 56}>
            {MODE_LABEL[r.mode].emoji} {formatClock(t)} → {BUILDINGS[r.to].name}
          </text>
        );
      })}
      <text x={510} y={270} fontSize={20} fill="#C9B6F2" textAnchor="middle">🕐 Most: {formatClock(world.minute)}</text>
    </>
  );
}

function SceneRaw({ world, building, onTap }: { world: World; building: BuildingId; onTap: (kind: FurnitureId | 'homok') => void }) {
  const def = BUILDINGS[building];
  if (def.kind === 'park') return <ParkScene />;
  if (def.kind === 'strand') {
    return (
      <g>
        <StrandScene castle={world.sandcastle} />
        <rect className="building" x={330} y={F + 20} width={200} height={110} fill="transparent" onClick={() => onTap('homok')} />
      </g>
    );
  }
  const backdrop = isHome(building)
    ? <RoomBackdrop def={def} wall={world.homes[building].wall} floor={world.homes[building].floor} wallpaper={world.homes[building].wallpaper} />
    : <RoomBackdrop def={def} wallpaper={def.kind === 'iskola' || def.kind === 'korhaz' ? 'sima' : 'sziv'} />;
  let inner = null;
  switch (def.kind) {
    case 'bolt': inner = <ShopFurniture />; break;
    case 'etterem': inner = <RestaurantFurniture />; break;
    case 'korhaz': inner = <HospitalFurniture />; break;
    case 'ruhabolt':
    case 'helyibolt': inner = <ClothesShopScene items={CLOTHING_IDS.filter((id) => CLOTHES[id].shops.includes(building)).map((id) => CLOTHES[id].emoji)} />; break;
    case 'fodrasz': inner = <SalonScene />; break;
    case 'butorbolt': inner = <FurnitureShopScene />; break;
    case 'ovoda': inner = <OvodaScene />; break;
    case 'iskola': inner = <IskolaScene />; break;
    case 'tuzoltosag': inner = <FireScene police={false} />; break;
    case 'rendorseg': inner = <FireScene police />; break;
    case 'szallas': inner = <LodgeScene />; break;
    case 'busz':
    case 'vasut':
    case 'repter': inner = <StationScene kind={def.kind} board={<Board world={world} building={building} />} />; break;
    default: break;
  }
  return <g>{backdrop}{inner}</g>;
}

/** Csak akkor rajzoljuk újra, ha a hely kinézete változik (nem minden lépésnél). */
const Scene = memo(SceneRaw, (a, b) => {
  if (a.building !== b.building) return false;
  const k = BUILDINGS[a.building].kind;
  if (k === 'otthon') return JSON.stringify(a.world.homes[a.building as HomeId]) === JSON.stringify(b.world.homes[b.building as HomeId]);
  if (k === 'strand') return a.world.sandcastle === b.world.sandcastle;
  if (k === 'busz' || k === 'vasut' || k === 'repter') return Math.floor(a.world.minute) === Math.floor(b.world.minute);
  return true;
});

export function InsideScreen({ building }: { building: BuildingId }) {
  const world = useGame((s) => s.world)!;
  const selected = useGame((s) => s.selectedCatId);
  const act = useGame((s) => s.act);
  const openModal = useGame((s) => s.openModal);
  const svgRef = useRef<SVGSVGElement>(null);
  const [editing, setEditing] = useState(false);
  const [furn, setFurn] = useState<{ uid: string; x: number; pointerId: number } | null>(null);
  const def = BUILDINGS[building];
  const home = isHome(building) ? (building as HomeId) : null;
  const items = home ? world.homes[home].items : [];

  const dropCat = (catId: string, p: Pt) => {
    act((w) => {
      if (p.x < ROOM_DOOR_X + 70) return moveCat(w, catId, 'utca', def.doorX);
      if (home || isLodge(building)) {
        const bed = home ? items.find((i) => i.kind === 'agy' && Math.abs(p.x - i.x) < 130) : Math.abs(p.x - 800) < 140 ? { x: 800 } : null;
        if (bed && p.y > F - 220 && p.y < F + 30) {
          moveCat(w, catId, building, bed.x);
          return putToBed(w, catId);
        }
        const tub = home && items.find((i) => i.kind === 'kad' && Math.abs(p.x - i.x) < 110);
        if (tub && p.y > F - 160) {
          moveCat(w, catId, building, tub.x);
          return useSpot(w, catId, 'kad', tub.x);
        }
      }
      const r = moveCat(w, catId, building, clamp(p.x, ROOM_DOOR_X + 80, ROOM_WIDTH - 60));
      if (!r.ok) return r;
      if (def.kind === 'park') {
        if (Math.abs(p.x - SPOTS.hinta.x) < 110) return useSpot(w, catId, 'hinta');
        if (Math.abs(p.x - SPOTS.csuszda.x) < 140) return useSpot(w, catId, 'csuszda');
      }
      if (def.kind === 'strand' && p.x > 580) return useSpot(w, catId, 'viz', clamp(p.x, 620, 940));
      if (building === 'repter_pv') {
        if (Math.abs(p.x - SPOTS.kapu_sz.x) < 90) return useSpot(w, catId, 'kapu_sz');
        if (Math.abs(p.x - SPOTS.kapu_os.x) < 90) return useSpot(w, catId, 'kapu_os');
      }
      return r;
    });
  };

  const { lift, onCatPointerDown, svgHandlers } = useCatDrag(svgRef, dropCat);

  const onFurnDown = (uid: string, x: number) => (e: PointerEvent<SVGGElement>) => {
    if (!editing) return;
    e.stopPropagation();
    svgRef.current?.setPointerCapture(e.pointerId);
    setFurn({ uid, x, pointerId: e.pointerId });
  };
  const handlers = {
    onPointerMove: (e: PointerEvent<SVGSVGElement>) => {
      if (furn && svgRef.current && e.pointerId === furn.pointerId) setFurn({ ...furn, x: toSvgPoint(svgRef.current, e.clientX, e.clientY).x });
      else svgHandlers.onPointerMove(e);
    },
    onPointerUp: (e: PointerEvent<SVGSVGElement>) => {
      if (furn && home && e.pointerId === furn.pointerId) {
        const tray = document.querySelector('.tray')?.getBoundingClientRect();
        const toStock = !!tray && e.clientY > tray.top;
        const f = furn;
        setFurn(null);
        act((w) => (toStock ? storeFurniture(w, home, f.uid) : moveFurniture(w, home, f.uid, f.x)));
      } else svgHandlers.onPointerUp(e);
    },
    onPointerCancel: (e: PointerEvent<SVGSVGElement>) => {
      setFurn(null);
      svgHandlers.onPointerCancel(e);
    },
  };

  const tapFurniture = (kind: FurnitureId | 'homok') => {
    if (editing) return;
    if (kind === 'jatekdoboz') act((w) => playBall(w, building));
    else if (kind === 'tv') act((w) => watchTv(w, building));
    else if (kind === 'konyvespolc') act((w) => readBook(w, building));
    else if (kind === 'homok') act((w) => buildSandcastle(w));
  };

  const cats = heldLast(world.cats.filter((c) => c.place === building), lift?.catId);
  const teddyHere = world.event?.kind === 'macko' && world.event.building === building;
  const sorted = [...items].sort((a, b) => (a.kind === 'szonyeg' ? -1 : 0) - (b.kind === 'szonyeg' ? -1 : 0));

  let tray = null;
  if (home) {
    tray = editing
      ? <EditTray home={home} onDone={() => setEditing(false)} />
      : <HomeTray home={building} onEdit={() => { setEditing(true); useGame.getState().select(null); }} />;
  } else if (isLodge(building)) tray = <MealTray building={building} />;
  else {
    switch (def.kind) {
      case 'bolt': tray = <ShopTray />; break;
      case 'etterem':
      case 'strand': tray = <MealTray building={building} />; break;
      case 'korhaz': tray = <HospitalTray />; break;
      case 'ruhabolt':
      case 'helyibolt': tray = <ClothesShopTray building={building} />; break;
      case 'fodrasz': tray = <SalonTray />; break;
      case 'butorbolt': tray = <FurnitureShopTray />; break;
      case 'iskola': tray = <InfoTray title="🏫 Iskola" text="A gyerekek reggel 8-tól 2-ig maguktól jönnek, ha van tanár. Óra: kérdések a nagymacskákról és számolás!" action={{ label: 'Óra indítása', emoji: '📚', onClick: () => openModal({ kind: 'lecke' }) }} />; break;
      case 'ovoda': tray = <InfoTray title="🧸 Óvoda" text="Hozd ide a babákat! Ha van óvónő, nem lesznek éhesek, és jól érzik magukat. 🍼" />; break;
      case 'park': tray = <InfoTray title="🌳 Park és játszótér" text="Húzd a macskát a hintára vagy a csúszdára! 🎠🛝" />; break;
      case 'tuzoltosag':
      case 'rendorseg': tray = <EventTray building={building} />; break;
      case 'busz':
      case 'vasut':
      case 'repter': tray = <TimetableTray building={building} />; break;
      default: break;
    }
  }

  return (
    <>
      <svg
        ref={svgRef}
        className="room-svg"
        viewBox={`0 0 ${ROOM_WIDTH} ${ROOM_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        {...handlers}
      >
        <Scene world={world} building={building} onTap={tapFurniture} />
        {sorted.map((it) => {
          const x = furn?.uid === it.uid ? furn.x : it.x;
          const fd = FURNITURE[it.kind];
          return (
            <g key={it.uid} className="furniture" onPointerDown={onFurnDown(it.uid, it.x)} onClick={() => tapFurniture(it.kind)}>
              <FurniturePiece kind={it.kind} x={x} label={!editing} />
              {editing && <rect x={x - fd.width / 2 - 8} y={F - fd.height - 14} width={fd.width + 16} height={fd.height + 24} rx={14} fill="#FF8FB4" fillOpacity={0.12} stroke="#FF8FB4" strokeWidth={4} strokeDasharray="12 8" />}
            </g>
          );
        })}
        {teddyHere && (
          <text
            className="building"
            x={880}
            y={F - 4}
            fontSize={56}
            onClick={() => act((w) => {
              const msg = findTeddy(w);
              return msg ? { ok: true, message: msg, sfx: 'csillag' } : undefined;
            })}
          >🧸</text>
        )}
        {!editing && cats.map((c) => {
          const l = lift?.catId === c.id ? lift.p : null;
          return (
            <CatSprite
              key={c.id}
              cat={c}
              x={l ? l.x : c.x}
              y={l ? l.y + 60 : c.activity === 'alszik' ? F - 20 : c.activity === 'uszik' ? F + 70 : c.spot === 'hinta' ? F - 4 : F + 40}
              minute={world.minute}
              selected={c.id === selected}
              lifted={!!l}
              onPointerDown={onCatPointerDown(c.id)}
            />
          );
        })}
      </svg>
      {cats.length === 0 && !editing && <div className="room-hint">Most nincs itt senki. Az utcán húzz ide egy macskát! 🐾</div>}
      {def.job && !editing && <div className="worker-pill"><WorkerInfo building={building} /></div>}
      {tray}
    </>
  );
}
