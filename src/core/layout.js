// Layout: sizes the stage exactly to the drawing
import { page } from './clips.js';
import { $ } from './dom.js';
import { drawSizeBar } from './sizebar.js';
import { prefs } from './state.js';
import { geo, resizeCanvas } from '../render/compose.js';
import { LINE, setBrushMax } from './tools.js';
import { pixelScale } from '../worlds/index.js';

let lastDims = '', forced = null;
// Tests: hold the stage at a given size (to compare pixels with a build whose layout differs)
export function forceStage(w, h) { forced = [w, h]; lastDims = ''; layout(); }
export const isVisual = () => $('app').classList.contains('visual');
// Size the stage to exactly the drawing: as big as the space allows, with the knobs and controls kept clear of it
export function layout() {
  if (page === 'clips') return;
  // Fill is for full screen only (v31): in the app the drawing is always a circle, and the corners of its square hold controls
  const visual = isVisual(), wide = visual && prefs.shape === 'wide';
  let aw, ah;
  if (visual) { aw = innerWidth; ah = innerHeight; }
  else { const left = $('left'); aw = left.clientWidth; ah = left.clientHeight; }
  let w, h;
  if (wide) { w = aw; h = ah; }
  else w = h = Math.min(aw, ah);
  w = Math.max(120, Math.floor(w)); h = Math.max(68, Math.floor(h));
  if (forced) [w, h] = forced;
  const st = $('stage'); st.style.width = w + 'px'; st.style.height = h + 'px';
  // Centre the drawing on the screen itself where there is room (it sits between the top rows and the pane, which are
  // not the same height): slide it within its own cell, never past the cell's edges
  if (visual) st.style.translate = '';
  else { const cell = $('left').getBoundingClientRect(), app = $('app').getBoundingClientRect(), room = Math.max(0, (cell.height - h) / 2);
    const d = Math.max(-room, Math.min(room, (app.top + app.height / 2) - (cell.top + cell.height / 2))); st.style.translate = `0 ${Math.round(d)}px`; }
  // Corner controls: as big as fits between the circle and the corner of its square (0.146 of the width)
  st.style.setProperty('--corner', Math.round(Math.max(34, Math.min(58, w * 0.146))) + 'px');
  const key = [w, h, wide, visual, window.devicePixelRatio, pixelScale()].join();
  if (key !== lastDims) { lastDims = key; resizeCanvas(w, h, wide); }
  // The largest brush is as big on screen as the size control (a button), whatever the size of the drawing
  setBrushMax((($('sizeBar').clientHeight || 54) - 4) / (2 * LINE * geo.Rcss));
  drawSizeBar();
}
// Force a resize of the canvases (after the drawing quality changes)
export function relayout() { lastDims = ''; layout(); }
