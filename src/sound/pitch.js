// Pitch: always snaps to octaves (this fixed clashing parts)
import { toneIdx } from '../styles/index.js';
import { MAP } from './maps.js';
import { INST_OCT } from './vocab.js';
import { world } from '../worlds/index.js';

export function scaleMidi(deg, base) { const sc = MAP.scale, L = sc.length, o = Math.floor(deg / L); return 12 * Math.round(base / 12) + MAP.root + 12 * o + sc[deg - o * L]; }
// Active notes (MAP.harm): which of the scale's degrees are in play at this beat, and the nearest one to d.
const sets = new Map();
function activeSet(step, L) {
  const key = step.r + ':' + step.size + ':' + L;
  let set = sets.get(key);
  if (!set) {
    const count = Math.min(L, 3 + Math.round(step.size * (L - 3))), root = Math.floor(step.r * L) % L;
    set = new Set();
    // stacked from the step's first note, every other degree (thirds in a seven-note scale), then the gaps
    for (let k = 0, d = root; set.size < count && k < 4 * L; k++) { if (!set.has(d)) set.add(d); d = (d + (set.size < Math.ceil(L / 2) + 1 ? 2 : 1)) % L; }
    for (let d = root; set.size < count; d = (d + 1) % L) set.add(d);
    sets.set(key, set);
  }
  return set;
}
export function activeDeg(d, beat) {
  const H = MAP.harm;
  if (!H || beat == null || world().legacy) return d;
  const L = MAP.scale.length, set = activeSet(H.steps[((Math.floor(beat / 4 / H.bars) % H.steps.length) + H.steps.length) % H.steps.length], L);
  for (let k = 0; k < L; k++) for (const o of k ? [-k, k] : [0]) if (set.has((((d + o) % L) + L) % L)) return d + o;
  return d;
}
export function lineNote(ev, inst, beat) {
  const L = MAP.scale.length, cm = MAP.colorMod[toneIdx(ev.s) % 7];
  const d = Math.round((MAP.invert ? 1 - ev.h : ev.h) * MAP.span) + cm.deg + (cm.oct + (ev.oct || 0)) * L + (ev.shift || 0);
  return scaleMidi(activeDeg(d, beat), MAP.low + 12 * (INST_OCT[inst] || 0));
}
