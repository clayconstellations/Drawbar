// Maps 000-999: seeded per-map choices (effects, mixing matrix W, mod targets, drum kit and params, tone curves, instruments, rotation response)
import { TAU, hash32, mulberry32 } from '../core/math.js';
import { score } from '../core/state.js';
import { FAMS, FAMS2, FX, LINE_POOLS, MODT, SCALE_DEFS, SPACE_FX } from './vocab.js';

export function makeMap(n) {
  const r = mulberry32(hash32(n, 0x9e37)), R = (a, b) => a + r() * (b - a);
  const pick = a => a[Math.floor(r() * a.length)];
  const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const fx = shuffle(FX).slice(0, 2 + Math.floor(r() * 3));
  if (!fx.some(e => SPACE_FX.includes(e))) fx[0] = pick(SPACE_FX);
  const W = Array.from({ length: 5 + FX.length }, () => Array.from({ length: 9 }, () => (r() * 2 - 1) * 1.5));
  const targets = shuffle(Object.keys(MODT).filter(k => { const t = MODT[k]; return !t.fx || fx.includes(t.fx); }));
  const density = 0.35 + 0.65 * r();
  const kit = pick(['hand', 'acoustic', 'electro', 'lofi', 'lofi']), lofi = kit === 'lofi';
  const tone = {};
  // Tone knob: each family darkens its own way and at its own rate
  for (const f of FAMS) tone[f] = { m: f === 'drums' || f === 'drones' ? pick(['lp', 'shelf']) : pick(['env', 'lp', 'shelf']), e: R(0.5, 2.3), floor: R(0.06, 0.3), hz: R(1500, 5000), q: R(0.5, 1.3), tc: R(0.04, 0.35) };
  // v35 additions, all from a generator of their own (so every older choice in the map stays as it was).
  //   synth: FM, additive or wavetable tones, each in 15% of maps: they take over the Brush's instrument, and in half
  //          of those maps one other tool's too
  //   dx:    busier hi-hats in 35% of maps (ratchets in 35% of those), kicks and snares on a 3/16 pulse in 30%,
  //          a snare roll that grows louder in 13%
  const x = mulberry32(hash32(n, 0x5e35)), X = (a, b) => a + x() * (b - a), xpick = a => a[Math.floor(x() * a.length)];
  const u = x(), synth = u < 0.15 ? 'fm' : u < 0.3 ? 'add' : u < 0.45 ? 'wt' : null, also = x() < 0.5 ? xpick(['beads', 'loop']) : null;
  const spec = () => { const tilt = X(0.6, 2.2), odd = x() < 0.4 ? X(0.1, 0.6) : 1, a = Array.from({ length: 12 }, (_, k) => Math.pow(k + 1, -tilt) * (k % 2 ? odd : 1) * (0.4 + 0.6 * x())); a[0] = 1; const e = Math.sqrt(a.reduce((p, c) => p + c * c, 0)); return a.map(v => v / e); };   // unit energy: as loud whatever the spectrum
  const syn = {
    ratio: xpick([0.5, 1, 1, 2, 2, 3, 3.5, 5, 7]), index: X(0.8, 4.5), idxDec: X(0.08, 1.1), sus: X(0.05, 0.5), ratio2: xpick([1, 2, 3, 4]), index2: x() < 0.4 ? X(0.3, 1.5) : 0,
    att: x() < 0.7 ? X(0.002, 0.012) : X(0.03, 0.18), hold: X(0.3, 0.85), rel: X(0.25, 1.2),
    amps: spec(), stretch: x() < 0.3 ? X(0.0002, 0.0012) : 0, spread: X(0, 0.6), dec: X(0.6, 2.8), damp: X(0.1, 0.7),
    waveA: spec(), waveB: spec(), morph: X(0.25, 1.2), detune: X(2, 11),
  };
  for (const f of FAMS2) tone[f] = { m: xpick(['env', 'lp', 'shelf']), e: X(0.5, 2.3), floor: X(0.06, 0.3), hz: X(1500, 5000), q: X(0.5, 1.3), tc: X(0.04, 0.35) };
  const hatBusy = x() < 0.35, ratchet = x() < 0.35, sync = x() < 0.3, roll = x() < 0.13;
  const dx = {
    hatK: hatBusy ? xpick([8, 8, 10, 12, 16]) : 0, ratchet: hatBusy && ratchet ? xpick([2, 2, 3]) : 0, ratchetP: X(0.15, 0.35),
    kick316: sync ? xpick([[0, 3, 6], [0, 3, 6, 11], [0, 6, 9], [0, 3, 8, 11, 14], [0, 3, 6, 9, 12]]) : null, snare316: sync ? xpick([[4, 10], [6, 12], [3, 12], [4, 7, 12], [6, 15]]) : null,
    roll: roll ? xpick([4, 6, 8, 8]) : 0, rollEvery: xpick([1, 2, 2]),
  };
  const lineInst = { glow: pick(LINE_POOLS.glow), beads: pick(LINE_POOLS.beads), loop: pick(LINE_POOLS.loop) };
  if (synth) { lineInst.glow = synth; if (also) lineInst[also] = synth; }
  // v36. Voices: the map's four instruments (the three it already had, topped up), no longer tied to a tool. Each
  // note goes to the voice that scores highest for it (see assignVoices in arranger.js): vw holds, per voice, weights
  // for what the stroke is like, how high the note is, and a slow wave along the pattern (vk, vph) that hands phrases
  // from one voice to another.
  const voices = [...new Set([lineInst.glow, lineInst.beads, lineInst.loop])];
  for (const v of ['glass', 'wave', 'pad', 'bell', 'wood', 'pluck', 'piano'].map(v => [v, x()]).sort((a, b) => a[1] - b[1])) if (voices.length < 4 && !voices.includes(v[0])) voices.push(v[0]);
  const vw = voices.map(() => Array.from({ length: 12 }, () => x() * 2 - 1)), vk = voices.map(() => xpick([1, 2, 2, 3, 4])), vph = voices.map(() => x());
  // Vibe: effects that colour some of the voices (targets), each present in only some maps
  const P = (p, a, b) => { const on = x() < p, v = X(a, b); return on ? v : 0; };
  const nT = xpick([1, 2, 2, 3, 4, 4]), t0 = Math.floor(x() * 4);
  const vibe = {
    targets: voices.filter((_, i) => (i - t0 + 4) % 4 < nT),
    tape: P(0.3, 0.4, 1), sat: P(0.3, 0.3, 0.8), phaser: P(0.25, 0.4, 0.9), phRate: X(0.08, 0.5), phBase: X(350, 1100), lossy: P(0.15, 0.4, 0.85),
    harm: (() => { const on = x() < 0.25, up = P(0.6, 0.2, 0.45), down = P(0.4, 0.2, 0.4), fifth = P(0.4, 0.15, 0.35); return on ? { up: up || (down || fifth ? 0 : 0.3), down, fifth } : null; })(),
    grainfb: (() => { const on = x() < 0.25, dir = x() < 0.5 ? 1 : -1, amt = X(0.25, 0.5); return on ? { dir, amt } : null; })(),
    texture: P(0.2, 0.3, 0.7),
    glitch: (() => { const on = x() < 0.2, p = X(0.08, 0.22), slice = xpick([0.25, 0.125, 0.125, 0.0625]), len = xpick([0.5, 1, 1, 2]); return on ? { p, slice, len } : null; })(),
  };
  // v38: in 20% of maps the drums get effects too, from a generator of its own (so nothing older moves): echoes
  // through the map's delay, a bigger room, or a copy through the vibe chain (when the map's chain does something)
  const y = mulberry32(hash32(n, 0x5e38)), dOn = y() < 0.2, yd = y(), yr = y(), yv = y(), ya = y(), chain = vibe.sat > 0 || vibe.phaser > 0 || vibe.lossy > 0 || !!vibe.glitch;
  const dfx = { delay: dOn && yd < 0.5 ? 0.2 + 0.25 * ya : 0, room: dOn && yr < 0.4 ? 0.2 + 0.25 * ya : 0, vibe: dOn && chain && yv < 0.6 ? 0.5 + 0.4 * ya : 0 };
  if (dOn && !dfx.delay && !dfx.room && !dfx.vibe) dfx.delay = 0.2 + 0.25 * ya;
  return { dfx,
    n, fx, W, targets, density, kit, tone, synth, syn, dx, voices, vw, vk, vph, vibe,
    lineInst,
    canonInt: pick([2, 4, -3, 5]),
    low: 38 + Math.floor(r() * 10), span: 8 + Math.floor(r() * 9),
    invert: r() < 0.35, hy: r(),
    colorMod: Array.from({ length: 7 }, () => ({ oct: pick([-1, 0, 0, 0, 1]), deg: Math.floor(r() * 3), bright: 0.6 + r() * 0.7 })),
    modStart: density < 0.55 ? 1 : 2 + Math.floor(r() * 3), modMul: 0.6 + r() * 0.9,
    delayBeats: pick([0.75, 0.5, 1, 1.5]), tremBeats: pick([0.25, 0.5, 1]), grainPitch: pick([0, 12, -12]),
    drumPerm: r() < 0.7 ? [0, 1, 2, 3] : shuffle([0, 1, 2, 3]),
    drumK: [1.2, 0.8, 2.5, 1.5].map(v => v * (0.6 + r() * 0.8)),
    maxLoops: pick([2, 3, 3]), swing: r() * 0.5, fmRatio: pick([1, 2, 3, 4]),
    dr: {
      kick: { mul: R(1.8, 5), sweep: R(0.02, 0.12), dec: R(0.18, 0.8), click: R(0, 0.4), drive: lofi ? R(0.2, 1) : R(0, 0.5), tri: r() < 0.3 },
      snare: { tone: R(0, 1), toneDec: R(0.04, 0.2), nDec: R(0.05, 0.32), nFreq: R(900, 5200), nQ: R(0.5, 2.2), snap: R(0, 1), claps: pick([1, 1, 2, 3, 4]), rim: R(0, 1), dust: R(0, 1), beef: R(0, 1), lp: R(1600, 6000) },
      hat: { metal: R(0, 1), freq: R(5000, 11000), q: R(0.5, 3), dec: R(0.02, 0.1), open: R(0.12, 0.45), openProb: R(0, 0.35) },
      perc: pick(['rim', 'shaker', 'tom']),
      busLP: lofi ? R(1800, 4500) : R(4500, 10000), drive: lofi ? R(0.35, 1) : R(0, 0.3),
    },
    root: 0, scale: SCALE_DEFS[0],
    rot: (() => {
      const q = mulberry32(hash32(n, 0x707)), Q = (a, b) => a + q() * (b - a), fxKeys = ['delay', 'reverb', 'gran', 'shim'];
      const a = Math.floor(q() * 4); let b = Math.floor(q() * 3); if (b >= a) b++;
      return { pitch: Q(0.3, 1.3), pan: Q(0.15, 0.45), gate: q() < 0.35 ? -2 : Q(-0.8, -0.2), gateA: Q(0, TAU), swing: Q(0, 0.6), fx: [[fxKeys[a], Q(0, TAU), Q(0.3, 0.7)], [fxKeys[b], Q(0, TAU), Q(0.2, 0.5)]] };
    })(),
  };
}
export function applyKeyScale() { MAP.root = score.key; MAP.scale = SCALE_DEFS[score.scale]; }
export let MAP = makeMap(score.map);
export function useMap(n) { MAP = makeMap(n); }
applyKeyScale();
