// Every sound is synthesized with Web Audio; no audio files.
let ctx = null, master = null;
export function unlock() {
  ctx ??= new (window.AudioContext || window.webkitAudioContext)();
  if (!master) { master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination); }
  if (ctx.state === "suspended") ctx.resume();
}
export const setMuted = (m) => master && (master.gain.value = m ? 0 : 0.5);

function tone(freq, dur, { type = "sine", vol = 0.3, at = 0, slide = 0, attack = 0.005 } = {}) {
  if (!ctx) return;
  const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}
function noise(dur, { vol = 0.2, at = 0, from = 800, to = 3000 } = {}) {
  if (!ctx) return;
  const t = ctx.currentTime + at, buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = buf; f.type = "bandpass"; f.Q.value = 1.5;
  f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.3); g.gain.linearRampToValueAtTime(0, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t);
}

export const sfx = {
  click: () => tone(660, 0.08, { type: "triangle", vol: 0.2 }),
  tick: (hi) => tone(hi ? 1800 : 1400, 0.03, { type: "square", vol: 0.05 }),
  count: () => tone(520, 0.18, { type: "triangle", vol: 0.25 }),
  stare: () => { tone(392, 0.4, { type: "sawtooth", vol: 0.12 }); tone(587, 0.5, { type: "triangle", vol: 0.25, at: 0.05 }); },
  boing: () => tone(180, 0.45, { type: "triangle", vol: 0.35, slide: 620 }),
  whoosh: () => noise(0.7, { vol: 0.25, from: 400, to: 2400 }),
  hoot: () => { tone(330, 0.25, { vol: 0.35, slide: 290, attack: 0.04 }); tone(300, 0.4, { vol: 0.35, slide: 250, at: 0.3, attack: 0.04 }); },
  lose: () => [392, 370, 349, 294].forEach((f, i) => tone(f, i === 3 ? 0.8 : 0.28, { type: "sawtooth", vol: 0.12, at: i * 0.3, slide: i === 3 ? 250 : 0 })),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i === 3 ? 0.6 : 0.16, { type: "triangle", vol: 0.25, at: i * 0.12 })),
};
