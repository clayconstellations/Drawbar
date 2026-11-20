// Realistic materials: soft, blurred shading (costly: each S layer is a blurred shadow draw, about 4x a plain fill)
import { tint, shade } from '../core/color.js';
import { F, S, CLIP, END, SOFTDROP } from '../render/ops.js';

// For lines: soft bands that follow the line, so it reads as a rounded tube
export const metal = () => [SOFTDROP(0.5), F(1, '#949ca8'), CLIP, S(1, '#2c3138', 0.12, 0.35), S(0.86, '#727a86', 0.2, 0.5), S(0.62, '#bcc3cb', 0.3, 0.45), S(0.4, '#e2e5e9', 0.38, 0.4, 0.9), S(0.28, '#2a2f36', -0.2, 0.3, 0.45), S(0.2, '#f5f6f8', 0.46, 0.4, 0.75), END];
export const cream = c => () => [SOFTDROP(0.35), F(1, tint(c, 0.12)), CLIP, S(1, shade(c, 0.3), 0.1, 0.35), S(0.9, shade(c, 0.12), 0.18, 0.5), S(0.68, c, 0.27, 0.5), S(0.45, tint(c, 0.18), 0.36, 0.45), S(0.25, tint(c, 0.38), 0.45, 0.4, 0.65), END];
export const slime = () => [SOFTDROP(0.4), F(1, '#2f6b12'), CLIP, S(1, '#4f9a1a', 0.1, 0.4), S(0.85, '#79c832', 0.2, 0.5), S(0.6, '#a8e05a', 0.3, 0.45), F('bub', '#c8f28e', 0, 0.6), F('bubHi', '#ffffff', 0, 0.85), S(0.3, '#e9ffd0', 0.4, 0.35, 0.8), S('hi', '#ffffff', 0.5, 0.12, 0.9), END];
export const softPuffs = (dark, a, b, c2, hi) => () => [SOFTDROP(0.3), F(1, dark), CLIP, S(1, a, 0.12, 0.5), S(1, b, 0.32, 0.6), S(1, c2, 0.58, 0.6), S(1, hi, 0.85, 0.5, 0.8), END];

export const liquidMetal = { name: 'Liquid metal', accent: '#c9ced6', glow: '#b9c6da', glowA: 0.12, make: metal,
  swatch: 'radial-gradient(circle at 36% 32%, #f2f4f7 0 6%, #aab1ba 22%, #5c646f 48%, #1f2329 70%, #7d8692 100%)' };
export const creams = [['Strawberry', '#f39bbd'], ['Lemon', '#f7da7a'], ['Mint', '#94ddc6'], ['Blueberry', '#98bff0']].map(([name, c]) => ({
  name, accent: c, glow: c, glowA: 0.06, make: cream(c),
  swatch: `radial-gradient(circle at 36% 32%, ${tint(c, 0.38)} 0 8%, ${tint(c, 0.15)} 24%, ${c} 50%, ${shade(c, 0.3)} 100%)` }));
export const softCloud = { name: 'Cloud', accent: '#e8eef6', glow: '#dfe8f5', glowA: 0.08, make: softPuffs('#8ea3bf', '#b9c8dc', '#dbe4f0', '#f2f6fb', '#ffffff'), puffs: 'cloud',
  swatch: 'radial-gradient(circle at 30% 46%, #f2f6fb 0 18%, #b9c8dc 30%, transparent 32%), radial-gradient(circle at 60% 40%, #fff 0 18%, #dbe4f0 32%, transparent 34%), radial-gradient(circle at 50% 62%, #f2f6fb 0 20%, #8ea3bf 40%, transparent 42%)' };
export const slimeMat = { name: 'Slime', accent: '#79c832', glow: '#a8e05a', glowA: 0.25, make: slime, extra: 'slime',
  swatch: 'radial-gradient(circle at 62% 64%, #c8f28e 0 10%, transparent 12%), radial-gradient(circle at 34% 30%, #fff 0 8%, transparent 10%), radial-gradient(circle at 50% 50%, #a8e05a 0 30%, #79c832 50%, #2f6b12 90%)' };

// ----- Brush and colour picked separately in the Materials style (v28). One colour in, the whole material out.
const metalT = c => [SOFTDROP(0.5), F(1, shade(c, 0.3)), CLIP, S(1, shade(c, 0.8), 0.12, 0.35), S(0.86, shade(c, 0.45), 0.2, 0.5), S(0.62, tint(c, 0.3), 0.3, 0.45), S(0.4, tint(c, 0.65), 0.38, 0.4, 0.9), S(0.28, shade(c, 0.82), -0.2, 0.3, 0.45), S(0.2, tint(c, 0.9), 0.46, 0.4, 0.75), END];
const slimeT = c => [SOFTDROP(0.4), F(1, shade(c, 0.6)), CLIP, S(1, shade(c, 0.25), 0.1, 0.4), S(0.85, c, 0.2, 0.5), S(0.6, tint(c, 0.3), 0.3, 0.45), F('bub', tint(c, 0.5), 0, 0.6), F('bubHi', '#ffffff', 0, 0.85), S(0.3, tint(c, 0.8), 0.4, 0.35, 0.8), S('hi', '#ffffff', 0.5, 0.12, 0.9), END];
const cloudT = c => softPuffs(shade(c, 0.32), tint(c, 0.1), tint(c, 0.45), tint(c, 0.78), '#ffffff')();
const ball = (c, a, b) => `radial-gradient(circle at 36% 32%, ${a} 0 8%, ${c} 46%, ${b} 100%)`;
liquidMetal.label = 'Metal'; liquidMetal.tintOps = metalT;
liquidMetal.swatchFor = c => `radial-gradient(circle at 36% 32%, ${tint(c, 0.9)} 0 6%, ${tint(c, 0.3)} 22%, ${shade(c, 0.45)} 48%, ${shade(c, 0.82)} 70%, ${shade(c, 0.3)} 100%)`;
creams[0].label = 'Cream'; creams[0].tintOps = c => cream(c)(); creams[0].swatchFor = c => ball(c, tint(c, 0.4), shade(c, 0.3));
softCloud.label = 'Cloud'; softCloud.tintOps = cloudT;
softCloud.swatchFor = c => `radial-gradient(circle at 30% 46%, ${tint(c, 0.78)} 0 18%, ${tint(c, 0.1)} 30%, transparent 32%), radial-gradient(circle at 60% 40%, #fff 0 18%, ${tint(c, 0.45)} 32%, transparent 34%), radial-gradient(circle at 50% 62%, ${tint(c, 0.78)} 0 20%, ${shade(c, 0.32)} 40%, transparent 42%)`;
slimeMat.label = 'Slime'; slimeMat.tintOps = slimeT;
slimeMat.swatchFor = c => `radial-gradient(circle at 62% 64%, ${tint(c, 0.5)} 0 10%, transparent 12%), radial-gradient(circle at 34% 30%, #fff 0 8%, transparent 10%), radial-gradient(circle at 50% 50%, ${tint(c, 0.3)} 0 30%, ${c} 50%, ${shade(c, 0.6)} 90%)`;
// Clay (v28): matte. One soft shadow side and one soft light side, no shine: 3 blurred layers where Cream has 5.
const clayT = c => [SOFTDROP(0.4), F(1, shade(c, 0.5)), CLIP, S(1, shade(c, 0.5), 0.14, 0.45), S(0.8, c, 0.3, 0.5), S(0.5, tint(c, 0.22), 0.42, 0.5, 0.85), END];
export const clay = { name: 'Clay', label: 'Clay', accent: '#d98a5f', glow: '#d98a5f', glowA: 0, make: () => clayT('#d98a5f'), tintOps: clayT,
  swatch: ball('#d98a5f', tint('#d98a5f', 0.16), shade('#d98a5f', 0.32)), swatchFor: c => ball(c, tint(c, 0.16), shade(c, 0.32)) };
// Glass: see-through, so it reads by its edge: a hard dark rim with a thin bright line inside it (v29: without the
// hard edge it read as a smudge), a soft shadow side and two hard glints. 2 blurred layers. Hides nothing beneath it.
const RIM = (k0, k, c, a = 1) => ({ t: 'rim', k0, k, c, a });
const glassT = c => [SOFTDROP(0.22), F(1, c, 0, 0.2), CLIP, S(1, shade(c, 0.55), -0.34, 0.3, 0.5), S(0.5, tint(c, 0.7), 0.5, 0.35, 0.55),
  RIM(1, 0.86, shade(c, 0.62), 0.9), RIM(0.86, 0.78, tint(c, 0.85), 0.55), S('hi', '#ffffff', 0.5, 0.12, 0.95), S('hi', '#ffffff', -0.42, 0.12, 0.4), END];
export const glass = { name: 'Glass', label: 'Glass', accent: '#9fd8ee', glow: '#9fd8ee', glowA: 0.1, make: () => glassT('#9fd8ee'), tintOps: glassT, clear: true,
  swatch: '#9fd8ee', swatchFor: c => `radial-gradient(circle at 34% 30%, #fff 0 7%, transparent 9%), radial-gradient(circle at 66% 70%, rgba(255,255,255,.5) 0 5%, transparent 7%), radial-gradient(circle, ${c}44 0 52%, ${tint(c, 0.85)} 54% 60%, ${shade(c, 0.62)} 62% 100%)` };
// ----- v29: four more, none dearer than Cream (5 blurred layers)
// Wax: light gets into it, so the shadow side stays coloured and the shine is wide and dull. 3 blurred layers.
const waxT = c => [SOFTDROP(0.35), F(1, shade(c, 0.26)), CLIP, S(1, shade(c, 0.12), 0.12, 0.5), S(0.8, tint(c, 0.2), 0.26, 0.6), S(0.42, tint(c, 0.62), 0.36, 0.55, 0.6), F(0.2, '#ffffff', 0.5, 0.16), END];
// Pearl: pale, with a pink sheen on the shadow side and a blue one toward the light. 4 blurred layers.
const pearlT = c => { const b = tint(c, 0.66); return [SOFTDROP(0.4), F(1, shade(b, 0.42)), CLIP, S(1, b, 0.14, 0.4), S(0.72, '#ffc4e2', -0.2, 0.5, 0.5), S(0.7, '#c2ecff', 0.26, 0.5, 0.6), S(0.3, '#ffffff', 0.44, 0.35, 0.95), END]; };
// Brushed metal: two blurred layers for the round, then fine hard bands along the line (plain fills) for the grain,
// and one soft shine. 3 blurred layers.
const BANDS = [0.95, 0.88, 0.8, 0.73, 0.66, 0.58, 0.5, 0.43, 0.35, 0.27, 0.19, 0.11];
const brushedT = c => [SOFTDROP(0.5), F(1, shade(c, 0.5)), CLIP, S(1, shade(c, 0.34), 0.12, 0.4), S(0.74, tint(c, 0.22), 0.28, 0.55),
  ...BANDS.map((k, i) => F(k, i % 2 ? shade(c, 0.6) : tint(c, 0.7), 0.1, i % 2 ? 0.2 : 0.17)), S(0.34, tint(c, 0.8), 0.4, 0.5, 0.5), END];
// Rubber: dark and matte, with one tight dull sheen. 3 blurred layers.
const rubberT = c => [SOFTDROP(0.45), F(1, shade(c, 0.74)), CLIP, S(1, shade(c, 0.58), 0.12, 0.4), S(0.78, shade(c, 0.34), 0.3, 0.55), S(0.3, tint(c, 0.3), 0.46, 0.4, 0.42), END];
const more = (name, label, c0, ops, sw) => ({ name, label, accent: c0, glow: c0, glowA: 0, make: () => ops(c0), tintOps: ops, swatch: sw(c0), swatchFor: sw });
export const wax = more('Wax', 'Wax', '#f7da7a', waxT, c => `radial-gradient(circle at 38% 34%, ${tint(c, 0.6)} 0 14%, ${tint(c, 0.15)} 50%, ${shade(c, 0.22)} 100%)`);
export const pearl = more('Pearl', 'Pearl', '#eef1f6', pearlT, c => `radial-gradient(circle at 36% 32%, #fff 0 9%, #c2ecff 30%, ${tint(c, 0.66)} 52%, #f3bfd9 76%, ${shade(tint(c, 0.66), 0.4)} 100%)`);
export const brushed = more('Brushed metal', 'Brushed', '#e2b24a', brushedT, c => `repeating-linear-gradient(100deg, rgba(255,255,255,.2) 0 1px, rgba(0,0,0,.2) 1px 2px, transparent 2px 3px), linear-gradient(190deg, ${tint(c, 0.45)}, ${shade(c, 0.5)})`);
export const rubber = more('Rubber', 'Rubber', '#f08a5c', rubberT, c => `radial-gradient(circle at 36% 32%, ${shade(c, 0.1)} 0 7%, ${shade(c, 0.4)} 34%, ${shade(c, 0.74)} 100%)`);
// Soft highlights on their own smoothed path (v37), as in Comic: Glass and Slime had hard white bands
glass.hi = 0.11; slimeMat.hi = 0.09;
