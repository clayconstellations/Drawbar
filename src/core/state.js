// State: score (everything saved with a piece), mix (the four macro knobs), ui, prefs, undo/redo
export const score = { mode: 'kaleido', copies: 4, spiral: 0, tiles: 3, turns: 1, mirror: true, fscale: 50, frot: false, fmirror: false, timing: 'clocked', inst: 'both', world: 'classic', pixel: false, fx: 'smear', map: 417, tempo: 92, key: 2, scale: 2, mods: {}, strokes: [] };
export const MIX_DEF = { density: 1, prob: 1, space: 0.5, tone: 0.7 };
export const mix = { ...MIX_DEF };
// Modulation (core/mod.js). live: the sound knobs as they are right now (the knob's own value, moved by its modulator);
// the sound engine reads these. modBase: the knob's own value for a modulated pattern knob, while score holds where the
// modulator has put it. gv / sv read and write a setting's own value either way.
export const live = { ...MIX_DEF };
export const modBase = {};
export const gv = k => k in modBase ? modBase[k] : score[k];
export const sv = (k, v) => { if (k in modBase) modBase[k] = v; else score[k] = v; };
export const ui = { tool: 'glow', color: 1, brushV: 50, eraseV: 45, tint: '#ee3b3f', opts: {}, tab: 'draw', modKey: 'density' };   // opts: brush options in hand, per kind of brush (brushopts.js)
export const prefs = { rTempo: true, rMode: false, rFolds: true, glide: 1200, shape: 'circle', volTones: 80, volDrums: 80, world: 'paint', smooth: false, light: false };
try { Object.assign(prefs, JSON.parse(localStorage.getItem('visual-score-prefs') || '{}')); } catch (e) {}
// Line smoothing is off by default since v34 (once, for everyone; it can be turned back on in Preferences)
if (!prefs.smooth34) { prefs.smooth34 = true; prefs.smooth = false; }
export const savePrefs = () => { try { localStorage.setItem('visual-score-prefs', JSON.stringify(prefs)); } catch (e) {} };
let nextId = 1;
export const takeId = () => nextId++;
export const seeId = id => { nextId = Math.max(nextId, id + 1); };
export const undoStack = [], redoStack = [];
export const SET_KEYS = ['map', 'key', 'scale', 'tempo', 'mode', 'copies', 'spiral', 'tiles', 'turns', 'mirror', 'fscale', 'frot', 'fmirror', 'timing', 'inst', 'world', 'pixel', 'fx', 'mods'];
export const snap = () => ({
  set: Object.fromEntries(SET_KEYS.map(k => [k, k === 'mods' ? JSON.parse(JSON.stringify(score.mods || {})) : gv(k)])),
  strokes: score.strokes.map(s => ({ id: s.id, tool: s.tool, color: s.color, size: s.size, fx: s.fx, tint: s.tint, head: s.head, pt: s.pt, seed: s.seed, L0: s.L0, pts: s.pts.map(p => p.slice()), start: s.start, startBeat: s.startBeat })),
});
export function checkpoint() { undoStack.push(snap()); redoStack.length = 0; if (undoStack.length > 120) undoStack.shift(); }
