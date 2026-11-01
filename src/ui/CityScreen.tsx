import { useEffect, useRef } from 'react';
import { BuildingArt } from '../art/BuildingArt';
import { Sky, Street } from '../art/Scenery';
import {
  BUILDING_IDS, BUILDINGS, GROUND_Y, ROOM_DOOR_X, SCENE_HEIGHT, SIDEWALK_Y, STREET_WIDTH, WORKSHOP,
} from '../data/buildings';
import { moveCat } from '../sim/actions';
import { phaseOf } from '../sim/time';
import type { BuildingId } from '../sim/types';
import { useGame } from '../store/store';
import { CatSprite } from './CatSprite';
import { heldLast, useCatDrag, type Pt } from './useCatDrag';

function buildingAt(p: Pt): BuildingId | null {
  for (const id of BUILDING_IDS) {
    const b = BUILDINGS[id];
    if (p.x >= b.x && p.x <= b.x + b.width && p.y >= GROUND_Y - b.height && p.y <= GROUND_Y + 20) return id;
  }
  return null;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function CityScreen() {
  const world = useGame((s) => s.world)!;
  const selected = useGame((s) => s.selectedCatId);
  const focusCatId = useGame((s) => s.focusCatId);
  const setScreen = useGame((s) => s.setScreen);
  const act = useGame((s) => s.act);
  const svgRef = useRef<SVGSVGElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { lift, onCatPointerDown, svgHandlers } = useCatDrag(svgRef, (catId, p) => {
    const target = buildingAt(p);
    act((w) => (target ? moveCat(w, catId, target, ROOM_DOOR_X + 80) : moveCat(w, catId, 'utca', clamp(p.x, 40, STREET_WIDTH - 40))));
  });

  useEffect(() => {
    if (!focusCatId) return;
    const cat = useGame.getState().world?.cats.find((c) => c.id === focusCatId);
    const el = scrollRef.current;
    const svg = svgRef.current;
    if (cat && cat.place === 'utca' && el && svg) {
      const scale = svg.clientWidth / STREET_WIDTH;
      el.scrollTo({ left: cat.x * scale - el.clientWidth / 2, behavior: 'smooth' });
    }
    useGame.getState().focus(null);
  }, [focusCatId]);

  const phase = phaseOf(world.minute);
  const lit = phase === 'este' || phase === 'ejjel';
  const cats = heldLast(world.cats.filter((c) => c.place === 'utca'), lift?.catId);

  return (
    <div className="city-scroll" ref={scrollRef}>
      <svg ref={svgRef} className="city-svg" viewBox={`0 0 ${STREET_WIDTH} ${SCENE_HEIGHT}`} {...svgHandlers}>
        <Sky phase={phase} width={STREET_WIDTH} />
        <Street width={STREET_WIDTH} lit={lit} />
        {BUILDING_IDS.map((id) => (
          <BuildingArt key={id} def={BUILDINGS[id]} lit={lit} onOpen={() => setScreen({ kind: 'inside', building: id })} />
        ))}
        <BuildingArt def={WORKSHOP} lit={lit} onOpen={() => setScreen({ kind: 'creator' })} />
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
