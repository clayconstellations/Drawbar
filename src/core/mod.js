// Modulation: any knob on the Play tab (the four sound knobs, and the pattern knobs around the drawing) can be moved
// by its own modulator. Everything is worked out from the beat (or the clock, in free mode) and fixed seeds, so a
// piece with modulation still plays the same every time.
//   shape   sine, triangle, square, saw, or sample and hold (a new seeded value each cycle)
//   curve   skews the shape: pushes a sine, triangle or square to one side; bends the saw into a log or exponential
//           ramp; weights sample and hold toward low or high values
//   depth   how far it moves the knob, either way (negative turns the shape over, so there is no reverse saw)
//   sync    cycle length in bars (RATES), or free in cycles per second
//   euclid  (synced) "pulses" spread as evenly as they go over "length" steps of the rate; the shape starts again on
//           every pulse and stretches to fill the gap to the next one (for sample and hold: when a new value is taken)
//   jitter  each cycle's depth is cut by a seeded random share, so cycles differ in size
//   glide   (sample and hold) the share of each cycle spent sliding to the new value
// Sound knobs move smoothly. Pattern knobs move in steps on the beat grid (two per beat at most), because every change
// redraws the picture and re-reads the music; they are never drawn at reduced quality.
import { TAU, clamp, hashFrac, mod } from './math.js';
import { live, mix, modBase, score } from './state.js';
import { world } from '../worlds/index.js';

export const RATES = [[1 / 16, '1/16'], [1 / 8, '1/8'], [3 / 16, '3/16'], [1 / 4, '1/4'], [3 / 8, '3/8'], [1 / 2, '1/2'], [3 / 4, '3/4'], [1, '1 bar'], [2, '2 bars'], [4, '4 bars'], [8, '8 bars']];
export const SHAPES = ['sine', 'tri', 'square', 'saw', 'sh'];
export const SOUND = ['density', 'prob', 'space', 'tone'], PATTERN = ['copies', 'spiral', 'tiles', 'turns', 'fscale'];
const SEED = { density: 11, prob: 12, space: 13, tone: 14, copies: 21, spiral: 22, tiles: 23, turns: 24, fscale: 25 };
export const MOD_DEF = { on: false, shape: 'sine', curve: 0, depth: 0.5, sync: true, rate: 7, hz: 0.5, euc: false, len: 8, pulses: 3, jitter: 0, glide: 0 };
export const modOf = key => score.mods[key] || (score.mods[key] = { ...MOD_DEF });
export const modOn = key => !!(score.mods[key] && score.mods[key].on);
const hit = (k, n, i) => ((mod(i, n) * k) % n) < k;
// The modulator's output at beat B / second S, from -1 to 1 (depth and jitter included)
export function modOut(m, key, B, S) {
  const seed = SEED[key] || 1;
  let ph, n;
  if (m.sync) {
    const x = B / (RATES[clamp(m.rate | 0, 0, RATES.length - 1)][0] * 4);
    if (m.euc) {
      const L = Math.max(1, m.len | 0), P = clamp(m.pulses | 0, 1, L), step = Math.floor(x);
      let a = step, b = step + 1;
      while (!hit(P, L, a)) a--;
      while (!hit(P, L, b)) b++;
      ph = (x - a) / (b - a); n = a;
    } else { n = Math.floor(x); ph = x - n; }
  } else { const x = S * m.hz; n = Math.floor(x); ph = x - n; }
  const c = clamp(m.curve, -1, 1), mid = 0.5 + 0.45 * c, warp = p => p < mid ? p / mid * 0.5 : 0.5 + (p - mid) / (1 - mid) * 0.5;
  let o;
  if (m.shape === 'tri') o = 1 - 4 * Math.abs(warp(ph) - 0.5);
  else if (m.shape === 'square') o = ph < mid ? 1 : -1;
  else if (m.shape === 'saw') o = 2 * Math.pow(ph, Math.pow(2, -2.5 * c)) - 1;
  else if (m.shape === 'sh') {
    const k = Math.pow(2, -2 * c), now = Math.pow(hashFrac(seed, n, 5), k), was = Math.pow(hashFrac(seed, n - 1, 5), k);
    const t = m.glide > 0.001 ? clamp(ph / m.glide, 0, 1) : 1;
    o = 2 * (was + (now - was) * t * t * (3 - 2 * t)) - 1;
  } else o = Math.sin(TAU * warp(ph));
  return o * m.depth * (1 - clamp(m.jitter, 0, 1) * hashFrac(seed, n, 9));
}
export function rangeOf(key) {
  const L = world().limits;
  return key === 'copies' ? [0, L.copies] : key === 'tiles' ? [2, L.tiles] : key === 'turns' ? [0, L.turns] : key === 'fscale' ? [0, 100] : [0, 1];
}
// A pattern knob only matters in the pattern that shows it
const inUse = key => key === 'fscale' || (score.mode === 'kaleido' ? key === 'copies' || key === 'spiral' : score.mode === 'tiles' ? key === 'tiles' || key === 'turns' : false);
// Each frame: move what is modulated. Returns what changed, for the caller to act on.
export function modTick(B, S) {
  const ch = { space: false, tone: false, pattern: false };
  for (const k of SOUND) {
    const m = score.mods[k], v = m && m.on ? clamp(mix[k] + modOut(m, k, B, S) * 0.5, 0, 1) : mix[k];
    if (Math.abs(v - live[k]) > 0.003 || (v !== live[k] && (v === 0 || v === 1))) { live[k] = v; if (k === 'space') ch.space = true; if (k === 'tone') ch.tone = true; }
  }
  const Bq = Math.floor(B * 2) / 2, Sq = Math.floor(S * 4) / 4;
  for (const k of PATTERN) {
    const m = score.mods[k];
    if (!(m && m.on)) { if (k in modBase) { if (score[k] !== modBase[k]) { score[k] = modBase[k]; ch.pattern = true; } delete modBase[k]; } continue; }
    if (!(k in modBase)) modBase[k] = score[k];
    if (!inUse(k)) { if (score[k] !== modBase[k]) score[k] = modBase[k]; continue; }
    const [lo, hi] = rangeOf(k);
    let v = clamp(modBase[k] + modOut(m, k, Bq, Sq) * (hi - lo) * 0.5, lo, hi);
    v = k === 'spiral' ? Math.round(v * 50) / 50 : Math.round(v);
    if (v !== score[k]) { score[k] = v; ch.pattern = true; }
  }
  return ch;
}
