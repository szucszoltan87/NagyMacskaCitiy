import { useRef, useState, type PointerEvent } from 'react';
import { useGame } from '../store/store';

export interface TrayItem {
  key: string;
  emoji: string;
  label: string;
  sub?: string;
  disabled?: boolean;
}

function catIdAt(x: number, y: number): string | null {
  for (const el of document.elementsFromPoint(x, y)) {
    const host = el.closest('[data-cat-id]');
    if (host) return host.getAttribute('data-cat-id');
  }
  return null;
}

export function ItemTray({ title, items, empty, onUse }: {
  title: string;
  items: TrayItem[];
  empty?: string;
  onUse: (key: string, catId: string) => void;
}) {
  const selected = useGame((s) => s.selectedCatId);
  const start = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const [ghost, setGhost] = useState<{ emoji: string; x: number; y: number } | null>(null);

  const onDown = (item: TrayItem) => (e: PointerEvent<HTMLButtonElement>) => {
    if (item.disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY, moved: false };
  };
  const onMove = (item: TrayItem) => (e: PointerEvent<HTMLButtonElement>) => {
    const s = start.current;
    if (!s) return;
    if (!s.moved && Math.hypot(e.clientX - s.x, e.clientY - s.y) < 10) return;
    s.moved = true;
    setGhost({ emoji: item.emoji, x: e.clientX, y: e.clientY });
  };
  const onUp = (item: TrayItem) => (e: PointerEvent<HTMLButtonElement>) => {
    const s = start.current;
    start.current = null;
    setGhost(null);
    if (!s) return;
    const toast = useGame.getState().showToast;
    if (s.moved) {
      const catId = catIdAt(e.clientX, e.clientY);
      if (catId) onUse(item.key, catId);
      else toast('Húzd rá egy macskára! 🐾');
    } else if (selected) {
      onUse(item.key, selected);
    } else {
      toast('Koppints egy macskára, vagy húzd rá az ételt! 🐾');
    }
  };
  const cancel = () => {
    start.current = null;
    setGhost(null);
  };

  return (
    <div className="tray">
      <div className="tray-title">{title}</div>
      <div className="tray-items">
        {items.length === 0 && empty && <div className="tray-empty">{empty}</div>}
        {items.map((it) => (
          <button
            key={it.key}
            className="tray-item"
            disabled={it.disabled}
            onPointerDown={onDown(it)}
            onPointerMove={onMove(it)}
            onPointerUp={onUp(it)}
            onPointerCancel={cancel}
          >
            <span className="tray-emoji">{it.emoji}</span>
            <span>{it.label}</span>
            {it.sub && <small>{it.sub}</small>}
          </button>
        ))}
      </div>
      {ghost && <div className="ghost" style={{ left: ghost.x, top: ghost.y }}>{ghost.emoji}</div>}
    </div>
  );
}
