// Flat colours for the Geometric world's stamped shapes: one plain fill, no outline, no shading.
// Nothing here depends on the light, so these never need re-lighting while the picture turns (cheap in the kaleidoscope).
import { F } from '../render/ops.js';

export const flats = [
  ['Red', '#e63946'], ['Yellow', '#ffc300'], ['Blue', '#2f5fe8'], ['Teal', '#2ec4b6'],
  ['Orange', '#ff7f11'], ['Pink', '#ff8fab'], ['Lilac', '#a78bfa'], ['Cream', '#f1e9da'],
].map(([name, c]) => ({ name, accent: c, glow: c, glowA: 0, make: () => [F(1, c)], flat: true, swatch: c }));
// A ninth colour (v31), so Geometric fills the 3 x 3 colour grid. Appended to MATS on its own: strokes store an index.
export const flatGreen = { name: 'Green', accent: '#5fcf5a', glow: '#5fcf5a', glowA: 0, make: () => [F(1, '#5fcf5a')], flat: true, swatch: '#5fcf5a' };
