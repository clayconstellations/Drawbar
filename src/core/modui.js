// The modulation editor (Play pane). It always shows the modulator of the knob touched last: one of the four sound
// knobs, or a pattern knob in a corner of the drawing. Every control keeps its place; those that do not apply are dimmed.
import { $ } from './dom.js';
import { P1, P2, knob, pm } from './knobs.js';
import { MOD_DEF, RATES, SHAPES, modOf, modOn } from './mod.js';
import { checkpoint, ui } from './state.js';
import { accent } from '../worlds/index.js';

const NAMES = { density: 'Density', prob: 'Probability', space: 'Space', tone: 'Tone', copies: 'Copies', spiral: 'Spiral', tiles: 'Tiles', turns: 'Turns', fscale: 'Size' };
const DEST = { knDensity: () => 'density', knProb: () => 'prob', knSpace: () => 'space', knTone: () => 'tone', pk1: () => P1[pm()][0], pk2: () => P2[pm()][0], pk3: () => 'fscale' };
const ICON = {
  sine: "<path d='M3 12c2.5-8 5-8 7.5 0s5 8 7.5 0 2-3 3-4'/>", tri: "<path d='M3 16l4.5-8 4.5 8 4.5-8 4.500 8'/>".replace('4.500', '4.5'),
  square: "<path d='M3 16V8h6v8h6V8h6v8'/>", saw: "<path d='M3 16L10 8v8l7-8v8l4-4.5'/>", sh: "<path d='M3 14h4V8h4v9h4v-6h4v3h2'/>",
};
const LABEL = { sine: 'Sine', tri: 'Triangle', square: 'Square', saw: 'Saw', sh: 'Sample and hold' };
const key = () => ui.modKey || 'density', m = () => modOf(key());
const knobs = [];
const HZ = [0.05, 12], toHz = p => HZ[0] * Math.pow(HZ[1] / HZ[0], p), fromHz = hz => Math.log(hz / HZ[0]) / Math.log(HZ[1] / HZ[0]);
export function syncMod() {
  const k = key(), md = m(), on = md.on;
  $('modName').textContent = NAMES[k]; $('modOn').setAttribute('aria-pressed', String(on));
  for (const b of $('modShape').children) b.setAttribute('aria-pressed', String(b.dataset.v === md.shape));
  $('modSync').setAttribute('aria-pressed', String(md.sync)); $('modSync').textContent = md.sync ? 'Sync' : 'Free';
  $('modEuc').setAttribute('aria-pressed', String(md.sync && md.euc)); $('modEuc').disabled = !md.sync;
  $('mdGlide').setAttribute('aria-disabled', String(md.shape !== 'sh'));
  $('mdLen').setAttribute('aria-disabled', String(!(md.sync && md.euc))); $('mdPulses').setAttribute('aria-disabled', String(!(md.sync && md.euc)));
  for (const id in DEST) { const el = $(id), dk = DEST[id](); el.classList.toggle('target', dk === k); el.classList.toggle('modded', modOn(dk)); }
  for (const kn of knobs) kn.draw();
}
export function initMod() {
  $('modShape').innerHTML = SHAPES.map(s => `<button data-v="${s}" aria-label="${LABEL[s]}" title="${LABEL[s]}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICON[s]}</svg></button>`).join('');
  // Touching a knob that can be modulated makes it the one the editor shows
  for (const id in DEST) $(id).addEventListener('pointerdown', () => { const k = DEST[id](); if (k !== ui.modKey) { ui.modKey = k; syncMod(); } }, true);
  const edit = fn => { checkpoint(); fn(m()); syncMod(); };
  $('modOn').addEventListener('click', () => edit(md => { md.on = !md.on; }));
  $('modShape').addEventListener('click', e => { const v = e.target.closest('button')?.dataset.v; if (v) edit(md => { md.shape = v; }); });
  $('modSync').addEventListener('click', () => edit(md => { md.sync = !md.sync; }));
  $('modEuc').addEventListener('click', () => edit(md => { md.euc = !md.euc; }));
  const mk = (id, o) => knobs.push(knob($(id), { px: 150, color: accent, onStart: checkpoint, ...o }));
  mk('mdDepth', { range: () => [-1, 1], def: () => MOD_DEF.depth, get: () => m().depth, set: v => { m().depth = Math.round(v * 100) / 100; }, fmt: v => Math.round(v * 100) });
  mk('mdRate', { range: () => m().sync ? [0, RATES.length - 1] : [0, 1], int: () => m().sync, def: () => m().sync ? MOD_DEF.rate : fromHz(MOD_DEF.hz),
    get: () => m().sync ? m().rate : fromHz(m().hz), set: v => { if (m().sync) m().rate = v; else m().hz = Math.round(toHz(v) * 100) / 100; },
    fmt: v => m().sync ? RATES[v][1].replace(' bars', '').replace(' bar', '') : (toHz(v) < 1 ? toHz(v).toFixed(2) : toHz(v).toFixed(1)) });
  mk('mdCurve', { range: () => [-1, 1], def: () => 0, get: () => m().curve, set: v => { m().curve = Math.round(v * 100) / 100; }, fmt: v => Math.round(v * 100) });
  mk('mdJitter', { range: () => [0, 1], def: () => 0, get: () => m().jitter, set: v => { m().jitter = Math.round(v * 100) / 100; }, fmt: v => Math.round(v * 100) });
  mk('mdGlide', { range: () => [0, 1], def: () => 0, get: () => m().glide, set: v => { m().glide = Math.round(v * 100) / 100; }, fmt: v => Math.round(v * 100) });
  mk('mdLen', { range: () => [1, 16], int: true, def: () => MOD_DEF.len, get: () => m().len, set: v => { m().len = v; m().pulses = Math.min(m().pulses, v); for (const kn of knobs) kn.draw(); }, fmt: v => v });
  mk('mdPulses', { range: () => [1, Math.max(1, m().len)], int: true, def: () => MOD_DEF.pulses, get: () => Math.min(m().pulses, m().len), set: v => { m().pulses = v; }, fmt: v => v });
  syncMod();
}
