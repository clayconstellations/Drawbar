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
  terrain: { title: 'Terrain', vary: 'Roughness', def: { vary: 50 }, shapes: null },
};
// Which options a material has (null: none)
export const optKind = M => M.wire === 'auto' ? 'solids' : M.nodes ? 'nodes' : OPTS[M.gl] ? M.gl : null;
// The options in hand for a kind, made on first use
export const optsFor = kind => kind ? (ui.opts[kind] || (ui.opts[kind] = { ...OPTS[kind].def })) : null;
