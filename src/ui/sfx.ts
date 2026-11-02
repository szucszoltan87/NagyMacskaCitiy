import type { SfxName } from '../sim/types';

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null;
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.12, slideTo?: number): void {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export function playSfx(name: SfxName): void {
  try {
    switch (name) {
      case 'nyam': tone(520, 0, 0.09, 'triangle'); tone(660, 0.12, 0.09, 'triangle'); break;
      case 'dorombol': for (let i = 0; i < 6; i++) tone(70 + (i % 2) * 8, i * 0.08, 0.08, 'sawtooth', 0.04); break;
      case 'erme': tone(988, 0, 0.08, 'square', 0.06); tone(1319, 0.08, 0.18, 'square', 0.06); break;
      case 'csillag': [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.08, 0.18, 'triangle', 0.1)); break;
      case 'pop': tone(400, 0, 0.08, 'sine', 0.12, 800); break;
      case 'busz': tone(330, 0, 0.25, 'square', 0.06); tone(262, 0.3, 0.35, 'square', 0.06); break;
      case 'vonat': tone(740, 0, 0.5, 'triangle', 0.08); tone(880, 0, 0.5, 'triangle', 0.06); break;
      case 'repulo': tone(200, 0, 1.2, 'sawtooth', 0.04, 600); break;
      case 'baj': tone(300, 0, 0.15, 'triangle', 0.08, 220); break;
    }
  } catch {
    // hang nélkül is megy a játék
  }
}
