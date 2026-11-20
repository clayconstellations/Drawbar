// MIDI out (v37), through the browser's Web MIDI. Works in Chrome and Edge on a computer and Chrome on Android; not in
// Safari or on iPhone / iPad, and a page shown inside another site (as on claude.ai) is usually refused.
//   channels 1-4   the map's four voices (see assignVoices in arranger.js), one channel each
//   channel 5      drones (Ripple strokes), as held notes
//   channel 10     drums, General MIDI notes: kick 36, snare 38, closed hat 42, open hat 46, percussion 37 / 70 / 45 / 56
//   controllers    Space as CC 91 and Tone as CC 74, on channels 1-5
//   clock          optional: 24 ticks a beat, with start and stop
// Notes are sent from the same place that plays the built-in sound, stamped with the same time, so the two stay together.
import { live, prefs, savePrefs } from '../core/state.js';
import { secAt } from '../core/transport.js';
import { actx } from './graph.js';
import { MAP } from './maps.js';
import { N } from './nodes.js';

export const midi = { ok: typeof navigator !== 'undefined' && !!navigator.requestMIDIAccess, on: false, outs: [], err: '' };
let access = null, out = null, clockOn = false, lastTick = -1;
const held = new Map(), ccLast = {};
// When an audio-clock time falls on the page's clock, which is what MIDI messages are stamped with
function stamp(t) {
  const o = actx && actx.getOutputTimestamp ? actx.getOutputTimestamp() : null;
  return o && o.performanceTime ? o.performanceTime + (t - o.contextTime) * 1000 : performance.now() + (t - (actx ? actx.currentTime : 0)) * 1000;
}
const send = (bytes, t) => { if (out) try { out.send(bytes, t == null ? undefined : Math.max(stamp(t), performance.now())); } catch (e) {} };
function pickPort() {
  midi.outs = access ? [...access.outputs.values()].map(o => ({ id: o.id, name: o.name || 'MIDI port' })) : [];
  out = access ? access.outputs.get(prefs.midiPort) || [...access.outputs.values()][0] || null : null;
  if (out && out.id !== prefs.midiPort) { prefs.midiPort = out.id; savePrefs(); }
}
export const applyMidiMute = () => { if (N.out && actx) N.out.gain.setTargetAtTime(midi.on && prefs.midiMute ? 0 : 1, actx.currentTime, 0.03); };
export function midiPanic() { for (let ch = 0; ch < 16; ch++) send([0xB0 | ch, 123, 0]); held.clear(); if (clockOn) { send([0xFC]); clockOn = false; } lastTick = -1; }
// Turn MIDI on or off. Resolves to what the settings panel should say (empty when all is well).
export async function midiEnable(on, onChange) {
  if (!on) { midiPanic(); midi.on = false; applyMidiMute(); return ''; }
  if (!midi.ok) return midi.err = 'This browser cannot send MIDI. Chrome or Edge on a computer can.';
  try {
    if (!access) { access = await navigator.requestMIDIAccess(); access.onstatechange = () => { pickPort(); onChange && onChange(); }; }
    pickPort(); midi.on = true; applyMidiMute();
    return midi.err = out ? '' : 'No MIDI port found. Connect one, or start a virtual port, and it will appear here.';
  } catch (e) { midi.on = false; return midi.err = 'MIDI was refused here. Open the app at its own address, not inside another page.'; }
}
export function midiPort(id) { midiPanic(); prefs.midiPort = id; savePrefs(); pickPort(); }
// A note on one of the voice channels (0-3), from audio time t for dur seconds
export function midiNote(ch, note, vel, t, dur) {
  if (!midi.on || !out) return;
  const n = Math.max(0, Math.min(127, Math.round(note))), c = Math.max(0, Math.min(3, ch | 0));
  send([0x90 | c, n, Math.max(1, Math.min(127, Math.round(vel * 127)))], t); send([0x80 | c, n, 0], t + Math.max(0.03, dur));
}
export function midiDrum(piece, t, vel, open) {
  if (!midi.on || !out) return;
  const n = piece === 0 ? 36 : piece === 1 ? 38 : piece === 2 ? (open ? 46 : 42) : MAP.kit === 'electro' ? 56 : MAP.dr.perc === 'shaker' ? 70 : MAP.dr.perc === 'tom' ? 45 : 37;
  send([0x99, n, Math.max(1, Math.min(127, Math.round(vel * 150)))], t); send([0x89, n, 0], t + 0.08);
}
// Drones: hold a note per drone, changing it when the drone's pitch does. want: [[id, frequency]]
export function midiDrones(want) {
  if (!midi.on || !out) { held.clear(); return; }
  const now = new Map(want.map(([id, f]) => [id, Math.round(69 + 12 * Math.log2(f / 440))]));
  for (const [id, n] of held) if (now.get(id) !== n) { send([0x84, n, 0]); held.delete(id); }
  for (const [id, n] of now) if (!held.has(id)) { send([0x94, n, 70]); held.set(id, n); }
}
export function midiKnobs() {
  if (!midi.on || !out) return;
  for (const [cc, v] of [[91, live.space], [74, live.tone]]) { const x = Math.round(v * 127); if (ccLast[cc] !== x) { ccLast[cc] = x; for (let ch = 0; ch < 5; ch++) send([0xB0 | ch, cc, x]); } }
}
// Clock ticks falling between beats B0 and B1 (called from the scheduler's look-ahead); at: audio time of a beat
export function midiClock(B0, B1, at) {
  if (!midi.on || !out || !prefs.midiClock) { if (clockOn) { send([0xFC]); clockOn = false; } return; }
  if (B0 * 24 < lastTick - 48) lastTick = -1;
  for (let k = Math.max(Math.ceil(B0 * 24), lastTick + 1); k < B1 * 24; k++) { if (!clockOn) { send([0xFA], at(k / 24)); clockOn = true; } send([0xF8], at(k / 24)); lastTick = k; }
}
