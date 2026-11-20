// The drawing op language: every material is a list of these ops, run by drawShape(ctx, shape, ops).
// A shape holds paths keyed by width factor k (1 = the stroke's own outline), keyed extra pieces and an optional ink outline.
import { TAU } from '../core/math.js';
import { rgba } from '../core/color.js';
import { drawGlyphs } from './glyphs.js';
import { drawStamps } from './space.js';

export const F = (k, c, off = 0, a = 1) => ({ t: 'fill', k, c, off, a });
export const DROP = a => ({ t: 'drop', a }), CLIP = { t: 'clip' }, END = { t: 'end' };
export const INK = (k, off) => ({ t: 'ink', k, c: '#0c0c12', off, a: 1 }), HALF = (c, a, off = 0) => ({ t: 'half', c, a, off });
// Soft layer: a band blurred to a smooth gradient (no visible steps), slid toward the light
export const S = (k, c, off, blur, a = 1) => ({ t: 'fill', k, c, off, blur, a });
export const PAT = (pat, c, off = 0) => ({ t: 'fill', k: 1, pat, c, off, a: 1 });
export const SOFTDROP = a => ({ t: 'drop', a });
// Hard drop shadow: a plain offset fill, no blur (pixel art)
export const HDROP = a => ({ t: 'drop', a, hard: true, c: '#000' });
export const INKL = off => ({ t: 'ink', c: '#0c0c12', off, a: 1 });
// Film grain over a shape's keyed pieces (paths.all): dark and light specks, a few scratches (Garden)
export const GRAIN = a => ({ t: 'grain', a });
let grainTile = null;
function grainPattern(c) {
  if (!grainTile) {
    grainTile = document.createElement('canvas'); grainTile.width = grainTile.height = 96;
    const g = grainTile.getContext('2d'); let s = 12345;
    const r = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    for (let i = 0; i < 2300; i++) { const v = r(); g.fillStyle = v < 0.6 ? `rgba(20,12,6,${0.25 + 0.5 * r()})` : `rgba(255,244,220,${0.2 + 0.5 * r()})`; g.fillRect(Math.floor(r() * 96), Math.floor(r() * 96), 1 + (r() < 0.12 ? 1 : 0), 1 + (r() < 0.12 ? 1 : 0)); }
    for (let i = 0; i < 5; i++) { g.fillStyle = `rgba(255,244,220,${0.25 + 0.3 * r()})`; g.fillRect(Math.floor(r() * 96), Math.floor(r() * 96), 1, 8 + Math.floor(r() * 30)); }
    for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(20,12,6,0.5)'; g.beginPath(); g.arc(r() * 96, r() * 96, 1 + r() * 1.6, 0, TAU); g.fill(); }
  }
  const pat = c.createPattern(grainTile, 'repeat');
  pat.setTransform(new DOMMatrix([0.0026, 0, 0, 0.0026, 0, 0]));
  return pat;
}
let toothTile = null;
function toothPattern(c) {
  if (!toothTile) {
    toothTile = document.createElement('canvas'); toothTile.width = toothTile.height = 160;
    const g = toothTile.getContext('2d'); let s = 4711;
    const r = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    // soft patches where the ink sits a little thinner, then specks of bare paper
    for (let i = 0; i < 26; i++) { const x = r() * 160, y = r() * 160, rad = 10 + 26 * r(), gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(0,0,0,${0.03 + 0.07 * r()})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; for (const ox of [-160, 0, 160]) for (const oy of [-160, 0, 160]) { g.save(); g.translate(ox, oy); g.fillRect(x - rad, y - rad, rad * 2, rad * 2); g.restore(); } }
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(0,0,0,${0.12 + 0.5 * r() * r()})`; g.fillRect(Math.floor(r() * 160), Math.floor(r() * 160), 1 + (r() < 0.2 ? 1 : 0), 1); }
  }
  const pat = c.createPattern(toothTile, 'repeat');
  pat.setTransform(new DOMMatrix([0.002, 0, 0, 0.002, 0, 0]));
  return pat;
}
export const STROKE = (k, lw, c = '#0c0c12') => ({ t: 'stroke', k, lw, c });
export const halfTiles = new Map();
// Pattern tiles are drawn large (96 px for a 12-unit tile) so dots and hatching stay sharp under big brushes (v25:
// at 12 px they blurred once the brush was large). dotsS / dotsL: smaller and larger dots, for screentone.
const TILE = 96, TU = TILE / 12;
export function patTile(kind, color) {
  const key = kind + color;
  let tile = halfTiles.get(key);
  if (!tile) {
    tile = document.createElement('canvas'); tile.width = tile.height = TILE;
    const g = tile.getContext('2d'); g.fillStyle = g.strokeStyle = color; g.scale(TU, TU);
    if (kind === 'scan') { g.fillRect(0, 0, 12, 2); g.fillRect(0, 6, 12, 2); }
    else if (kind.startsWith('dots')) { const r = kind === 'dotsS' ? 1.1 : kind === 'dotsL' ? 3.3 : 2.1; g.beginPath(); g.arc(3, 3, r, 0, TAU); g.fill(); g.beginPath(); g.arc(9, 9, r, 0, TAU); g.fill(); if (r > 3) for (const [x, y] of [[-3, 9], [15, 9], [9, -3], [9, 15], [-3, -3], [15, 3], [3, 15], [15, 15]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); } }
    else { g.lineWidth = 1.9; g.beginPath(); g.moveTo(-3, 15); g.lineTo(15, -3); g.moveTo(-9, 9); g.lineTo(9, -9); g.moveTo(3, 21); g.lineTo(21, 3); if (kind === 'cross') { g.moveTo(-3, -3); g.lineTo(15, 15); g.moveTo(-9, 3); g.lineTo(9, 21); g.moveTo(3, -9); g.lineTo(21, 9); } g.stroke(); }
    halfTiles.set(key, tile);
  }
  return tile;
}
// fx, fy: undo a slide, so screentone bands slid toward the light keep one dot grid
export function halftone(c, color, w0, kind = 'dots', fx = 0, fy = 0) {
  const pat = c.createPattern(patTile(kind, color), 'repeat'), k = w0 * (kind.startsWith('dots') ? 0.6 : 0.7) / TILE;
  pat.setTransform(new DOMMatrix([k, 0, 0, k, fx, fy]));
  return pat;
}
export const LSX = -0.552, LSY = -0.834;
// How far the composed picture is turned right now; lighting is worked out against it
export let composeRot = 0;
export const setComposeRot = r => { composeRot = r; };
// The screen light, expressed in whatever space we are drawing in right now (copies may be turned, mirrored or scaled)
export function localLight(c) {
  const m = c.getTransform(), cr = Math.cos(-composeRot), sr = Math.sin(-composeRot);
  const lx = LSX * cr - LSY * sr, ly = LSX * sr + LSY * cr, det = m.a * m.d - m.b * m.c || 1;
  const vx = (m.d * lx - m.c * ly) / det, vy = (-m.b * lx + m.a * ly) / det, h = Math.hypot(vx, vy) || 1;
  return [vx / h, vy / h];
}
export const BIG = 9000;
let rimC = null, rimX = null, partC = null, partX = null;
export function drawShape(c, sh, ops) {
  if (sh.parts) {
    // A stroke that crosses itself, kept as overlapping pieces in drawing order. Its shadow is drawn once for the
    // whole shape; then each piece, ink and body, clipped to the band it owns. A later piece crossing an earlier one
    // therefore lies on top of it, outline and all, like one tube passing over another.
    const whole = { ...sh, parts: null }, drop = ops.filter(o => o.t === 'drop'), rest = ops.filter(o => o.t !== 'drop');
    if (drop.length) drawShape(c, whole, drop);
    // Each piece is drawn whole on a spare canvas and then cut to its band in one go. (Clipping while drawing would
    // leave a hairline at every join: each layer's soft clip edge lets the darker layers beneath show through.)
    const m = c.getTransform(), b = sh.bb; let x0 = 0, y0 = 0, x1 = c.canvas.width, y1 = c.canvas.height;
    if (b) {
      let ax = 1e9, ay = 1e9, bx = -1e9, by = -1e9;
      for (const [x, y] of [[b[0], b[1]], [b[2], b[1]], [b[0], b[3]], [b[2], b[3]]]) { const px = m.a * x + m.c * y + m.e, py = m.b * x + m.d * y + m.f; ax = Math.min(ax, px); bx = Math.max(bx, px); ay = Math.min(ay, py); by = Math.max(by, py); }
      const pad = 0.06 * Math.sqrt(Math.abs(m.a * m.d - m.b * m.c));
      x0 = Math.max(x0, Math.floor(ax - pad)); y0 = Math.max(y0, Math.floor(ay - pad)); x1 = Math.min(x1, Math.ceil(bx + pad)); y1 = Math.min(y1, Math.ceil(by + pad));
    }
    const w = x1 - x0, h = y1 - y0; if (w < 1 || h < 1) return;
    if (!partC) { partC = [0, 1].map(() => document.createElement('canvas')); partX = partC.map(cv => cv.getContext('2d')); }
    for (const cv of partC) if (cv.width < w || cv.height < h) { cv.width = Math.max(cv.width, w); cv.height = Math.max(cv.height, h); }
    const P = sh.parts, render = (k, X) => {
      X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'source-over'; X.globalAlpha = 1; X.clearRect(0, 0, w, h);
      X.setTransform(m.a, m.b, m.c, m.d, m.e - x0, m.f - y0);
      drawShape(X, P[k], rest);
      X.globalCompositeOperation = 'destination-in'; X.globalAlpha = 1; X.fillStyle = '#000'; X.fill(P[k].band);
    };
    const [lx, ly] = localLight(c), sc = Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)), ldx = m.a * lx + m.c * ly, ldy = m.b * lx + m.d * ly, dl = Math.hypot(ldx, ldy) || 1, far = 20000;
    let cur = 0; render(0, partX[0]);
    for (let k = 0; k < P.length; k++) {
      // Where a piece passes over an earlier stretch of the same stroke it throws a short shadow onto it (v38). The
      // shadow of the NEXT piece is laid before this one is pasted, so this piece covers whatever falls at the join
      // between them; and it only lands on pieces two or more back (never on the canvas or on other strokes).
      const nx = k + 1;
      if (nx < P.length) {
        render(nx, partX[1 - cur]);
        if (nx >= 2) {
          const q = P[nx];
          if (!q.under) { q.under = new Path2D(); for (let j = 0; j <= nx - 2; j++) q.under.addPath(P[j].paths[1]); }
          c.save(); c.clip(q.under); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
          c.shadowColor = 'rgba(6,6,16,0.5)'; c.shadowBlur = 0.3 * sh.w0 * sc; c.shadowOffsetX = far - ldx / dl * 0.34 * sh.w0 * sc; c.shadowOffsetY = -ldy / dl * 0.34 * sh.w0 * sc;
          c.drawImage(partC[1 - cur], 0, 0, w, h, x0 - far, y0, w, h); c.restore();
        }
      }
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.drawImage(partC[cur], 0, 0, w, h, x0, y0, w, h); c.restore();
      cur = 1 - cur;
    }
    return;
  }
  const [lx, ly] = localLight(c), w0 = sh.w0;
  let far = null, scale = 1;
  for (const o of ops) {
    if (o.t === 'clip') { c.save(); c.clip(sh.paths[1]); continue; }
    if (o.t === 'end') { c.restore(); continue; }
    if (o.t === 'ink' && !sh.ink) continue;
    if (o.t === 'tooth') {
      // Paint: the paper's tooth shows through the ink as fine specks and uneven patches. It is cut out of the
      // stroke's own sprite (so nothing beneath is touched); where strokes are drawn straight to the layer it is skipped.
      if (c.sprite && sh.paths.br) { c.globalCompositeOperation = 'destination-out'; c.globalAlpha = 1; c.fillStyle = toothPattern(c); c.fill(sh.paths.br); c.globalCompositeOperation = 'source-over'; }
      continue;
    }
    if (o.t === 'rim') {
      // A hard-edged band (Glass): the outline at k0 with the outline at k cut out of it. Cutting needs a canvas of
      // its own, or it would cut the picture beneath; a spare one, only as big as the stroke, is reused.
      const p0 = sh.paths[o.k0], p1 = sh.paths[o.k]; if (!p0 || !p1) continue;
      const m = c.getTransform(), b = sh.bb; let x0 = 0, y0 = 0, x1 = c.canvas.width, y1 = c.canvas.height;
      if (b) {
        let ax = 1e9, ay = 1e9, bx = -1e9, by = -1e9;
        for (const [x, y] of [[b[0], b[1]], [b[2], b[1]], [b[0], b[3]], [b[2], b[3]]]) { const px = m.a * x + m.c * y + m.e, py = m.b * x + m.d * y + m.f; ax = Math.min(ax, px); bx = Math.max(bx, px); ay = Math.min(ay, py); by = Math.max(by, py); }
        x0 = Math.max(x0, Math.floor(ax) - 2); y0 = Math.max(y0, Math.floor(ay) - 2); x1 = Math.min(x1, Math.ceil(bx) + 2); y1 = Math.min(y1, Math.ceil(by) + 2);
      }
      const w = x1 - x0, h = y1 - y0; if (w < 1 || h < 1) continue;
      if (!rimC) { rimC = document.createElement('canvas'); rimX = rimC.getContext('2d'); }
      if (rimC.width < w || rimC.height < h) { rimC.width = Math.max(rimC.width, w); rimC.height = Math.max(rimC.height, h); }
      rimX.setTransform(1, 0, 0, 1, 0, 0); rimX.globalCompositeOperation = 'source-over'; rimX.clearRect(0, 0, w, h);
      rimX.setTransform(m.a, m.b, m.c, m.d, m.e - x0, m.f - y0); rimX.fillStyle = o.c; rimX.fill(p0);
      rimX.globalCompositeOperation = 'destination-out'; rimX.fillStyle = '#000'; rimX.fill(p1);
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = o.a; c.drawImage(rimC, 0, 0, w, h, x0, y0, w, h); c.restore();
      continue;
    }
    if (o.t === 'grain') { if (sh.paths.all) { c.globalAlpha = o.a; c.fillStyle = grainPattern(c); c.fill(sh.paths.all); c.globalAlpha = 1; } continue; }
    if (o.t === 'stamps') { if (sh.stamps) drawStamps(c, sh.stamps); continue; }
    if (o.t === 'glyphs') { if (sh.cells) drawGlyphs(c, sh.cells, o.c); continue; }
    if (o.t === 'stroke') { const pth = sh.paths[o.k]; if (!pth) continue; c.globalAlpha = 1; c.strokeStyle = o.c; c.lineWidth = o.lw * w0; c.lineJoin = 'round'; c.stroke(pth); continue; }
    const drop = o.t === 'drop', off = drop ? -0.4 : o.off, dx = lx * off * w0, dy = ly * off * w0;
    if (o.t === 'half') { c.globalAlpha = o.a; c.fillStyle = halftone(c, o.c, sh.wd || w0); c.translate(dx, dy); c.fill(sh.paths[1]); c.translate(-dx, -dy); continue; }
    const path = drop ? sh.paths[o.k || 1] : o.t === 'ink' ? sh.ink : sh.paths[o.k];
    if (!path) continue;
    const blur = drop ? (o.hard ? 0 : 0.5) : o.blur;
    if (blur) {
      // Soft: draw the band far off to one side and let only its blurred shadow land here
      if (!far) { const m = c.getTransform(), det = m.a * m.d - m.b * m.c || 1; scale = Math.sqrt(Math.abs(det)); far = [m.d * BIG / det, -m.b * BIG / det]; }
      c.shadowColor = drop ? `rgba(0,0,0,${o.a})` : rgba(o.c, o.a); c.shadowBlur = blur * w0 * scale; c.shadowOffsetX = -BIG; c.shadowOffsetY = 0;
      c.fillStyle = '#000'; c.globalAlpha = 1;
      c.translate(dx + far[0], dy + far[1]); c.fill(path); c.translate(-dx - far[0], -dy - far[1]);
      c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetX = 0;
      continue;
    }
    c.globalAlpha = o.a;
    c.fillStyle = o.pat ? (o.pat.startsWith('dots') ? halftone(c, o.c, sh.wd || w0, o.pat, -dx, -dy) : halftone(c, o.c, sh.wd || w0, o.pat)) : o.c;
    c.translate(dx, dy); c.fill(path); c.translate(-dx, -dy);
  }
  c.globalAlpha = 1;
}
