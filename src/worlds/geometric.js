// Geometric: stamp and size common shapes (tap, or press and drag to size and turn). One flat fill per shape per copy,
// no outline, no shading, nothing lit: the lightest style, so it gets the most kaleidoscope copies and every tile pattern.
// (The Pixel option was removed in v27.)
// Later genres: IDM, acid, electro, EDM; with Pixel: lofi, house, chiptune.
export default {
  id: 'geometric', name: 'Geometric',
  mats: ['Red', 'Orange', 'Yellow', 'Green', 'Teal', 'Blue', 'Lilac', 'Pink', 'Cream'],
  options: { gridMats: true },   // its brushes are plain colours: shown as the 3 x 3 colour grid
  tools: ['chain', 'circle', 'square', 'triangle', 'hexagon', 'star', 'erase'],
  modes: ['free', 'kaleido', 'tiles'],
  limits: { strokes: 120, copies: 14, tiles: 6, turns: 4, rotate: true },
  start: { mode: 'free', copies: 6, spiral: 0, tiles: 3, turns: 1, mirror: true, fscale: 50, frot: false, fmirror: false, tool: 'chain', color: 'Yellow' },
  render: { sprites: true },
};
