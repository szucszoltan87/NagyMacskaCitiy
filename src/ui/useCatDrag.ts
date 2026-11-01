import { useRef, useState, type PointerEvent, type RefObject } from 'react';
import { petCat } from '../sim/actions';
import { useGame } from '../store/store';

export interface Pt { x: number; y: number }

export function toSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number): Pt {
  const m = svg.getScreenCTM();
  if (!m) return { x: 0, y: 0 };
  const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
  return { x: p.x, y: p.y };
}

/** Macska húzása egy SVG jelenetben. Koppintás = kiválasztás + simogatás. */
export function useCatDrag(svgRef: RefObject<SVGSVGElement | null>, onDrop: (catId: string, p: Pt) => void) {
  const drag = useRef<{ catId: string; pointerId: number; sx: number; sy: number; moved: boolean } | null>(null);
  const [lift, setLift] = useState<{ catId: string; p: Pt } | null>(null);

  const onCatPointerDown = (catId: string) => (e: PointerEvent<SVGGElement>) => {
    e.stopPropagation();
    svgRef.current?.setPointerCapture(e.pointerId);
    drag.current = { catId, pointerId: e.pointerId, sx: e.clientX, sy: e.clientY, moved: false };
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    const svg = svgRef.current;
    if (!d || !svg || e.pointerId !== d.pointerId) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 10) return;
    if (!d.moved) {
      d.moved = true;
      useGame.getState().hold(d.catId);
    }
    setLift({ catId: d.catId, p: toSvgPoint(svg, e.clientX, e.clientY) });
  };

  const finish = (e: PointerEvent<SVGSVGElement>, cancelled: boolean) => {
    const d = drag.current;
    const svg = svgRef.current;
    if (!d || !svg || e.pointerId !== d.pointerId) return;
    drag.current = null;
    setLift(null);
    const game = useGame.getState();
    game.hold(null);
    if (cancelled) return;
    if (d.moved) {
      onDrop(d.catId, toSvgPoint(svg, e.clientX, e.clientY));
    } else {
      game.select(d.catId);
      game.act((w) => petCat(w, d.catId));
    }
  };

  return {
    lift,
    onCatPointerDown,
    svgHandlers: {
      onPointerMove,
      onPointerUp: (e: PointerEvent<SVGSVGElement>) => finish(e, false),
      onPointerCancel: (e: PointerEvent<SVGSVGElement>) => finish(e, true),
    },
  };
}

/** A kézben tartott macska legyen legfelül. */
export function heldLast<T extends { id: string }>(items: T[], heldId: string | undefined): T[] {
  if (!heldId) return items;
  return [...items.filter((c) => c.id !== heldId), ...items.filter((c) => c.id === heldId)];
}
