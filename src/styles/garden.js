// Garden: magical plants, fungi and fruit, one brush each. The plants grow along the line you draw (render/plants.js)
// Fungi stand on their own stalks with no line; flowers and fruit hang off a thin vine along the line (back in v25).
// Coral is no longer offered in the tab (kept so old drawings still open).
// Saturated flat colours with a film grain. No outlines, no glow, nothing slid toward the light: nothing to re-light.
// reach: how far pieces reach past the line. beadEvery: thinning when used with Beads (not offered in the tab).
import { F, GRAIN } from '../render/ops.js';

const EVERY = { glowcap: 2, bellcap: 2, trumpet: 2, coral: 3, puffball: 2, starbloom: 2 };   // Beads: one head per this many beads
const plant = (name, kind, stem, glow, layers, swatch, reach = 0.05) => ({
  name, accent: layers[layers.length > 2 ? 1 : 0][1], glow, glowA: 0, plant: kind, reach, beadEvery: EVERY[kind] || 1,
  keys: ['stalk', ...layers.map(l => l[0])],
  // No line along the stroke and no glow: just the plants, under a grain like old film (GRAIN, see render/ops.js)
  make: () => [F('stalk', stem), ...layers.map(([k, c]) => F(k, c)), GRAIN(0.55)], swatch,
});
const orb = (a, b, bg = '#160b33') => `radial-gradient(circle at 42% 38%, ${b} 0 14%, ${a} 30% 52%, ${bg} 56%)`;
export const plants = [
  plant('Glowcaps', 'glowcap', '#9b8cff', '#ffc94d', [['gill', '#fff3c4'], ['capA', '#ffb300'], ['capAHi', '#ffe066'], ['capB', '#ff4f9a'], ['capBHi', '#ffa6cf'], ['spot', '#fffbe6']],
    'radial-gradient(ellipse 60% 34% at 50% 44%, #ffb300 0 96%, transparent 100%), radial-gradient(ellipse 12% 34% at 50% 74%, #9b8cff 0 96%, transparent 100%), #160b33'),
  plant('Bellcaps', 'bellcap', '#7fd4ff', '#ff4d6d', [['cap', '#e3173e'], ['capHi', '#ff6b6b'], ['frill', '#ffd166']],
    'radial-gradient(ellipse 26% 52% at 50% 40%, #e3173e 0 96%, transparent 100%), radial-gradient(ellipse 10% 30% at 50% 80%, #7fd4ff 0 96%, transparent 100%), #160b33'),
  plant('Trumpets', 'trumpet', '#e0661a', '#ff9d2e', [['horn', '#ff8c1a'], ['rim', '#ffc24d'], ['inner', '#c2410c'], ['stamen', '#ffd98a'], ['dot', '#fff1a8']], orb('#ff8c1a', '#ffc24d')),
  plant('Spirals', 'spiral', '#7b2cbf', '#c77dff', [['leaf', '#35e0c4'], ['curl', '#b14dff'], ['dot', '#ff7ae0']],
    'repeating-radial-gradient(circle, #b14dff 0 3px, #160b33 3px 6px)'),
  plant('Coral', 'coral', '#d1157a', '#ff5cb0', [['branch', '#ff2e93'], ['pad', '#a6f01e'], ['padHi', '#e2ff7a']],
    'radial-gradient(ellipse 60% 18% at 50% 30%, #a6f01e 0 96%, transparent 100%), linear-gradient(90deg, transparent 42%, #ff2e93 42% 58%, transparent 58%), #160b33', 0.07),
  plant('Moonberries', 'moonberry', '#1a8f84', '#6f9bff', [['leaf', '#22c7a9'], ['berry', '#4d7cff'], ['berryHi', '#a9c4ff'], ['shine', '#ffffff']], orb('#4d7cff', '#ffffff')),
  plant('Lanterns', 'lantern', '#2bd9a0', '#ffb347', [['lamp', '#ff7a00'], ['band', '#c2410c'], ['lampHi', '#ffe08a'], ['shine', '#ffffff']], orb('#ff7a00', '#ffe08a')),
  plant('Puffballs', 'puffball', '#ff9ecf', '#5fd8ff', [['ball', '#3fd0ff'], ['ballHi', '#b8f1ff'], ['spot', '#ff3fb4'], ['spore', '#d9faff']],
    'radial-gradient(circle at 36% 40%, #ff3fb4 0 9%, transparent 10%), radial-gradient(circle at 62% 56%, #ff3fb4 0 8%, transparent 9%), radial-gradient(circle, #3fd0ff 0 52%, #160b33 56%)'),
  plant('Starbloom', 'starbloom', '#18c29c', '#ff6fcf', [['petal', '#ff3fb4'], ['petalHi', '#ffc2e8'], ['ctr', '#ffe14d'], ['dot', '#ff8a00']],
    'conic-gradient(#ff3fb4 0 10%, #160b33 0 17%, #ff3fb4 0 27%, #160b33 0 34%, #ff3fb4 0 44%, #160b33 0 51%, #ff3fb4 0 61%, #160b33 0 68%, #ff3fb4 0 78%, #160b33 0 85%, #ff3fb4 0 95%, #160b33 0)'),
];

// v38: flowers on vines, one colour family each. Appended to MATS on their own (see styles/index.js)
const flower = (c, eye, bg = '#160b33') => `radial-gradient(circle, ${eye} 0 16%, transparent 18%), repeating-conic-gradient(${c} 0 9%, ${bg} 9% 12.5%), ${bg}`;
export const vineFlowers = [
  plant('Daisies', 'daisy', '#2f9e5b', '#ffffff', [['leaf', '#3fbf6f'], ['petalLo', '#c9d3f5'], ['petal', '#ffffff'], ['ctr', '#ffb300'], ['ctrHi', '#ffe066']], flower('#ffffff', '#ffb300')),
  plant('Bluebells', 'bluebell', '#2a8f6a', '#5a7dff', [['leaf', '#37b98a'], ['bell', '#3f5bff'], ['lip', '#6f8cff'], ['bellHi', '#a9bbff']],
    'radial-gradient(ellipse 30% 42% at 50% 56%, #3f5bff 0 96%, transparent 100%), radial-gradient(ellipse 8% 24% at 50% 22%, #2a8f6a 0 96%, transparent 100%), #160b33'),
  plant('Tulips', 'tulip', '#3a9d4a', '#ff4d4d', [['leaf', '#55c25f'], ['cup', '#e11d48'], ['cupHi', '#ff5c7a'], ['cupLine', '#ff9aad']],
    'radial-gradient(ellipse 26% 40% at 50% 42%, #ff5c7a 0 96%, transparent 100%), radial-gradient(ellipse 40% 36% at 50% 48%, #e11d48 0 96%, transparent 100%), #160b33'),
  plant('Blossom', 'blossom', '#8a5a44', '#ff9ecb', [['leaf', '#7bcf6a'], ['petal', '#ff8fc4'], ['petalHi', '#ffd3ea'], ['ctr', '#c2255c'], ['stamen', '#ffe9a8'], ['dot', '#ffd43b']],
    'radial-gradient(circle, #c2255c 0 12%, transparent 14%), radial-gradient(circle at 50% 24%, #ff8fc4 0 20%, transparent 22%), radial-gradient(circle at 75% 42%, #ff8fc4 0 20%, transparent 22%), radial-gradient(circle at 66% 72%, #ff8fc4 0 20%, transparent 22%), radial-gradient(circle at 34% 72%, #ff8fc4 0 20%, transparent 22%), radial-gradient(circle at 25% 42%, #ff8fc4 0 20%, transparent 22%), #160b33'),
  plant('Marigolds', 'marigold', '#4f9a3a', '#ff9d2e', [['leaf', '#6dbb4a'], ['ruff', '#e8590c'], ['petal', '#ff922b'], ['petalHi', '#ffd43b'], ['ctr', '#a63c06']],
    'radial-gradient(circle, #ffd43b 0 20%, #ff922b 22% 40%, #e8590c 42% 58%, #160b33 62%)'),
];
