// Brush options (Glitch): a shape choice and a Variety knob that belong to the brush in hand and are kept on each
// stroke as it is drawn (s.pt = { shape, vary }; in clips as q). One small row beside the brushes serves every brush:
// what "shape" means depends on the brush (the solid, the dot, the wave, the lines' direction). Strokes drawn before
// a brush had options carry no s.pt and keep their old look.
import { ui } from './state.js';

const ic = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const fl = d => `<svg viewBox="0 0 24 24">${d.replace(/\/>/g, " fill='currentColor'/>")}</svg>`;
const DOTS = [
  ['square', 'Squares', fl("<rect x='6' y='6' width='12' height='12'/>")],
  ['circle', 'Circles', fl("<circle cx='12' cy='12' r='6.5'/>")],
  ['triangle', 'Triangles', fl("<path d='M12 5l7.5 13h-15z'/>")],
  ['plus', 'Plus signs', fl("<path d='M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z'/>")],
  ['heart', 'Hearts', fl("<path d='M12 20C3 13.5 3.5 6.5 8 5.6c2-.4 3.3.8 4 2.2.7-1.4 2-2.6 4-2.2 4.5.9 5 7.9-4 14.400z'/>")],
  ['star', 'Stars', fl("<path d='M12 3.500l2.5 5.6 6.1.6-4.6 4.1 1.3 6-5.3-3.1-5.3 3.1 1.3-6-4.6-4.1 6.1-.600z'/>")],
];
export const OPTS = {
  solids: { title: 'Solids', vary: 'Variety', def: { shape: 'auto', vary: 50 }, shapes: [
    ['auto', 'By speed', ic("<path d='M4 17l4-9 4 9zM14 7h6v6h-6z'/><circle cx='17' cy='18' r='2'/>")],
    ['tetra', 'Tetrahedra', ic("<path d='M12 4l8 15H4zM12 4v15'/>")],
    ['cube', 'Cubes', ic("<path d='M12 3l8 4.500v9L12 21l-8-4.500v-9zM12 12v9M12 12L4 7.500M12 12l8-4.5'/>")],
    ['octa', 'Octahedra', ic("<path d='M12 3l8 9-8 9-8-9zM4 12h16'/>")],
    ['dodeca', 'Dodecahedra', ic("<path d='M12 3l8.5 6.2-3.2 10H6.700L3.5 9.200zM12 8l4 3-1.5 4.500h-5L8 11z'/>")],
    ['icosa', 'Icosahedra', ic("<path d='M12 3l8 4.500v9L12 21l-8-4.500v-9zM12 3l-5 9h10zM7 12l5 9 5-9'/>")],
  ] },
  nodes: { title: 'Nodes', vary: 'Variety', def: { shape: 'square', vary: 0 }, shapes: DOTS },
  cloud: { title: 'Points', vary: 'Variety', def: { shape: 'square', vary: 50 }, shapes: DOTS },
  scope: { title: 'Scope', vary: 'Variety', def: { shape: 'sine', vary: 50 }, shapes: [
    ['sine', 'Sine wave', ic("<path d='M3 12c2.5-8 5-8 7.5 0s5 8 7.5 0 2-3 3-4'/>")],
    ['tri', 'Triangle wave', ic("<path d='M3 16l4.5-8 4.5 8 4.5-8 4.5 8'/>")],
    ['square', 'Square wave', ic("<path d='M3 16V8h6v8h6V8h6v8'/>")],
    ['saw', 'Saw wave', ic("<path d='M3 16L10 8v8l7-8v8l4-4.5'/>")],
  ] },
  scan: { title: 'Scan', vary: 'Variety', def: { shape: 'h', vary: 0 }, shapes: [
    ['h', 'Level lines', ic("<path d='M4 7h16M4 12h16M4 17h16'/>")],
    ['v', 'Upright lines', ic("<path d='M7 4v16M12 4v16M17 4v16'/>")],
    ['d1', 'Slanting up', ic("<path d='M4 13l9-9M5 20L20 5M11 20l9-9'/>")],
    ['d2', 'Slanting down', ic("<path d='M11 4l9 9M4 5l15 15M4 11l9 9'/>")],
  ] },
  terrain: { title: 'Terrain', vary: 'Roughness', def: { shape: 'grid', vary: 50 }, shapes: [
    ['grid', 'Grid', ic("<path d='M3 8h18M3 12h18M3 16h18M7 5v14M12 5v14M17 5v14'/>")],
    ['ridges', 'Ridges', ic("<path d='M3 8c3-3 6 3 9 0s6-3 9 0M3 13c3-3 6 3 9 0s6-3 9 0M3 18c3-3 6 3 9 0s6-3 9 0'/>")],
    ['tri', 'Triangles', ic("<path d='M3 18l4.5-9 4.5 9 4.5-9 4.5 9zM7.5 9h9'/>")],
    ['contour', 'Contour lines', ic("<path d='M4 7h7v3h9M4 12h4v3h12M4 17h10v2h6'/>")],
  ] },
  code: { title: 'Code', vary: 'Churn', def: { shape: 'mix', vary: 50 }, shapes: [
    ['mix', 'Mixed', ic("<path d='M5 5h6M8 5v7M5 9l6 3M15 6v6h4V6zM6 15h3v4H6zM14 16l5 3M19 16l-5 3'/>")],
    ['kana', 'Katakana', ic("<path d='M5 6h14M12 6c0 7-2 10-6 13M9 11h9'/>")],
    ['digits', 'Digits', ic("<path d='M6 8l3-2v12M14 6h5l-3 5c3 0 3.5 2 3.5 3.500 0 2-1.500 3.500-5.500 3.500'/>".replace('3.500','3.5').replace('1.500','1.5').replace('5.500','5.5').replace('3.500','3.5'))],
    ['binary', 'Ones and zeros', ic("<path d='M7 6v12'/><rect x='13' y='6' width='6' height='12' rx='3'/>")],
    ['sym', 'Symbols', ic("<path d='M6 8h5M8.5 5.500v5M14 6l5 5M19 6l-5 5M6 16h5M14 14v5h5'/>".replace('5.500','5.5'))],
  ] },
  sort: { title: 'Sort', vary: 'Threshold', def: { shape: 'down', vary: 60 }, shapes: [
    ['down', 'Sort downward', ic("<path d='M12 4v16M6 14l6 6 6-6'/>")], ['up', 'Sort upward', ic("<path d='M12 20V4M6 10l6-6 6 6'/>")],
    ['left', 'Sort to the left', ic("<path d='M20 12H4M10 6l-6 6 6 6'/>")], ['right', 'Sort to the right', ic("<path d='M4 12h16M14 6l6 6-6 6'/>")],
  ] },
  mosh: { title: 'Mosh', vary: 'Hold', def: { shape: 'square', vary: 50 }, shapes: [
    ['square', 'Square blocks', ic("<rect x='6' y='6' width='12' height='12'/>")], ['wide', 'Wide blocks', ic("<rect x='3' y='8' width='18' height='8'/>")], ['tall', 'Tall blocks', ic("<rect x='8' y='3' width='8' height='18'/>")],
  ] },
  blocks: { title: 'Blocks', vary: 'Slip', def: { shape: 'h', vary: 50 }, shapes: [
    ['h', 'Level strips', ic("<path d='M3 7h13M8 12h13M5 17h13' stroke-width='3'/>")], ['v', 'Upright strips', ic("<path d='M7 3v13M12 8v13M17 5v13' stroke-width='3'/>")],
  ] },
};
// Which options a material has (null: none)
export const optKind = M => M.wire === 'auto' ? 'solids' : M.nodes ? 'nodes' : M.glyph ? 'code' : M.under ? M.under : OPTS[M.gl] ? M.gl : null;
// The options in hand for a kind, made on first use
export const optsFor = kind => kind ? (ui.opts[kind] || (ui.opts[kind] = { ...OPTS[kind].def })) : null;
