import { useRef } from 'react';
import { HomeFurniture, HospitalFurniture, RestaurantFurniture, RoomBackdrop, ShopFurniture } from '../art/Rooms';
import { BUILDINGS, HOME_BED_X, isHome, ROOM_DOOR_X, ROOM_FLOOR_Y, ROOM_HEIGHT, ROOM_WIDTH } from '../data/buildings';
import { moveCat, playBall, putToBed } from '../sim/actions';
import type { BuildingId } from '../sim/types';
import { useGame } from '../store/store';
import { CatSprite } from './CatSprite';
import { HomeTray, HospitalTray, RestaurantTray, ShopTray } from './trays';
import { heldLast, useCatDrag } from './useCatDrag';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function InsideScreen({ building }: { building: BuildingId }) {
  const world = useGame((s) => s.world)!;
  const selected = useGame((s) => s.selectedCatId);
  const act = useGame((s) => s.act);
  const svgRef = useRef<SVGSVGElement>(null);
  const def = BUILDINGS[building];
  const home = isHome(building);

  const { lift, onCatPointerDown, svgHandlers } = useCatDrag(svgRef, (catId, p) => {
    act((w) => {
      if (p.x < ROOM_DOOR_X + 70) return moveCat(w, catId, 'utca', def.doorX);
      if (home && Math.abs(p.x - HOME_BED_X) < 120 && p.y > ROOM_FLOOR_Y - 200) {
        moveCat(w, catId, building, HOME_BED_X);
        return putToBed(w, catId);
      }
      return moveCat(w, catId, building, clamp(p.x, ROOM_DOOR_X + 80, ROOM_WIDTH - 60));
    });
  });

  const cats = heldLast(world.cats.filter((c) => c.place === building), lift?.catId);

  return (
    <>
      <svg
        ref={svgRef}
        className="room-svg"
        viewBox={`0 0 ${ROOM_WIDTH} ${ROOM_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        {...svgHandlers}
      >
        <RoomBackdrop def={def} />
        {home && <HomeFurniture onBall={() => act((w) => playBall(w, building))} />}
        {building === 'bolt' && <ShopFurniture />}
        {building === 'etterem' && <RestaurantFurniture />}
        {building === 'korhaz' && <HospitalFurniture />}
        {cats.map((c) => {
          const l = lift?.catId === c.id ? lift.p : null;
          return (
            <CatSprite
              key={c.id}
              cat={c}
              x={l ? l.x : c.x}
              y={l ? l.y + 60 : c.activity === 'alszik' ? ROOM_FLOOR_Y - 20 : ROOM_FLOOR_Y + 40}
              minute={world.minute}
              selected={c.id === selected}
              lifted={!!l}
              onPointerDown={onCatPointerDown(c.id)}
            />
          );
        })}
      </svg>
      {cats.length === 0 && <div className="room-hint">Most nincs itt senki. Az utcán húzz ide egy macskát! 🐾</div>}
      {home && <HomeTray />}
      {building === 'bolt' && <ShopTray />}
      {building === 'etterem' && <RestaurantTray />}
      {building === 'korhaz' && <HospitalTray />}
    </>
  );
}
