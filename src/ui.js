// Shared look: paper, hand-drawn frame, Gaegu text, doodle buttons. Also the test hook (window.owl).
import { INK, PAPER, YELLOW, BELLY } from "./art/owl.js";
import { sfx } from "./audio.js";

export const hex = (c) => parseInt(c.slice(1), 16);
// game canvas runs in device pixels and is zoomed back down, like Cake Tower. At least 2x even on 1x screens
// (smoother text and lines), at most 3x (phones). Re-read on resize, because browser zoom changes the ratio (Angel, 18 Oct: "kurang HD").
const ratio = () => Math.min(Math.max(window.devicePixelRatio || 1, 2), 3);
export let D = ratio();
export const refreshD = () => (D = ratio());
export const FONT = '"Gaegu", "Comic Sans MS", sans-serif';

// state the headless checks read and drive
export const hook = (window.owl = { scene: "", log: [], buttons: {}, result: null,
  press(id) { const b = this.buttons[id]; if (!b) throw new Error(`no button ${id} (have ${Object.keys(this.buttons)})`); b(); } });
export const note = (msg) => { hook.log.push([Math.round(performance.now()), msg]); };

export function enter(scene) {
  hook.scene = scene.scene.key;
  hook.buttons = {};
  note(`scene ${scene.scene.key}`);
  const relayout = () => scene.layout?.(scene.scale.width, scene.scale.height);
  scene.scale.on("resize", relayout);
  scene.events.once("shutdown", () => scene.scale.off("resize", relayout));
}

// cream paper with a wobbly ink frame, redrawn on resize
export function paper(scene) {
  const g = scene.add.graphics().setDepth(-10);
  const draw = (w, h) => {
    g.clear().fillStyle(hex(PAPER)).fillRect(0, 0, w, h);
    const m = Math.max(10 * D, Math.min(w, h) * 0.025);
    g.lineStyle(Math.max(2.5 * D, Math.min(w, h) * 0.005), hex(INK), 1);
    const wob = (x1, y1, x2, y2) => { g.beginPath(); g.moveTo(x1, y1); g.lineTo((x1 + x2) / 2 + (y1 === y2 ? 0 : 2), (y1 + y2) / 2 + (y1 === y2 ? 2 : 0)); g.lineTo(x2, y2); g.strokePath(); };
    wob(m, m + 2, w - m, m); wob(w - m, m - 2, w - m + 1, h - m); wob(w - m + 2, h - m, m, h - m + 1); wob(m, h - m, m - 1, m);
  };
  const onResize = (s) => draw(s.width, s.height);
  draw(scene.scale.width, scene.scale.height);
  scene.scale.on("resize", onResize);
  scene.events.once("shutdown", () => scene.scale.off("resize", onResize));
  return g;
}

export function text(scene, x, y, str, size, opts = {}) {
  const t = scene.add.text(x, y, str, { fontFamily: FONT, fontSize: `${Math.round(size)}px`, fontStyle: opts.bold === false ? "normal" : "bold", color: INK,
    align: "center", wordWrap: opts.wrap ? { width: opts.wrap, useAdvancedWrap: true } : undefined, lineSpacing: size * 0.12 }).setOrigin(0.5);
  // line gap follows the font size, also when layout resizes the text later (lines were touching on big screens)
  const setSize = t.setFontSize.bind(t);
  t.setFontSize = (v) => setSize(v).setLineSpacing(Math.round(parseFloat(v) * 0.12));
  return t;
}

// doodle button: yellow pill with an ink outline; id is what window.owl.press() calls
export function button(scene, id, label, size, onPress, { color = YELLOW } = {}) {
  const c = scene.add.container(0, 0);
  const t = text(scene, 0, -size * 0.06, label, size).setResolution(3);   // buttons are scaled up by layout: draw the text big enough
  const w = t.width + size * 1.6, h = size * 1.7;
  const g = scene.add.graphics();
  const draw = (down) => g.clear().fillStyle(hex(color)).fillRoundedRect(-w / 2, -h / 2 + (down ? 3 : 0), w, h, h * 0.4)
    .lineStyle(size * 0.16, hex(INK)).strokeRoundedRect(-w / 2, -h / 2 + (down ? 3 : 0), w, h, h * 0.4);
  draw(false);
  c.add([g, t]).setSize(w, h).setInteractive({ useHandCursor: true });
  let fired = false;
  const fire = () => { if (fired) return; fired = true; sfx.click(); note(`press ${id}`); onPress(); scene.time.delayedCall(400, () => (fired = false)); };
  c.on("pointerdown", () => draw(true)).on("pointerout", () => draw(false)).on("pointerup", () => { draw(false); fire(); });
  hook.buttons[id] = fire;
  return c;
}

export const BELLY_HEX = hex(BELLY);

// put text b right under text a (both centre-origin), gap px apart: layouts stack by real heights, never overlap
export const below = (a, b, gap) => b.setY(a.y + a.height / 2 + gap + b.height / 2);
