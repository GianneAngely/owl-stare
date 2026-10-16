// 5-second calibration (GDD §4): relax, blink, smile. Thresholds are saved so it runs once.
import { OwlSprite } from "../art/owl-sprite.js";
import { D, paper, text, button, enter, note, hook } from "../ui.js";
import { face, onFace } from "../face/source.js";
import { calibrate } from "../face/calibrate.js";
import { save } from "../store.js";

const STEPS = [["relax", "Relax and look at the owl", 2000, "idle"], ["blink", "Now blink!", 1500, "blink"], ["smile", "Now smile!", 1500, "laugh"]];
const RETRY = { blink: "I didn't see a blink. Once more, with a big slow blink.", smile: "I didn't see a smile. Once more, with a big grin.",
  noface: "I can't see your face. Face the camera in good light, then try again." };

export class Calibrate extends Phaser.Scene {
  constructor() { super("Calibrate"); }
  create() {
    enter(this);
    paper(this);
    this.tries = 0;
    this.owl = new OwlSprite(this, "hoot", "idle");
    this.head = text(this, 0, 0, "Let's learn your face", 46);
    this.say = text(this, 0, 0, "", 34);
    this.dots = this.add.graphics();
    this.go = button(this, "calibrate", "Ready", 36, () => this.run());
    this.lost = text(this, 0, 0, "I can't see you. Face the camera in good light.", 34).setVisible(false);
    this.layout(this.scale.width, this.scale.height);
  }
  async run() {
    if (!this.go.visible) return;
    this.go.setVisible(false);
    this.tries++;
    const got = {};
    for (const [i, [key, line, ms, tex]] of STEPS.entries()) {
      this.step = i;
      this.say.setText(line);
      this.owl.setFace(tex);
      this.drawDots();
      got[key] = await this.collect(ms);
    }
    const r = calibrate(got);
    note(`calibrated ok=${r.ok} problem=${r.problem} tries=${this.tries}`);
    hook.calibration = r;
    this.owl.setFace("idle");
    // a missed blink or smile gets one retry, then the safe defaults; no face always needs a retry
    if (r.problem === "noface" || (!r.ok && this.tries < 2)) {
      this.say.setText(RETRY[r.problem]);
      this.go.setVisible(true);
      return;
    }
    save({ th: r.th });
    this.say.setText("Got it! Now… stare.");
    this.time.delayedCall(900, () => this.scene.start("Ladder"));
  }
  // shown where the step text goes, in its place while the face is missing
  update() { const lost = this.go.visible && face.latest?.face === false; this.lost.setVisible(lost); this.say.setVisible(!lost); }
  collect(ms) {
    const samples = [];
    const off = onFace((s) => samples.push(s));
    return new Promise((done) => this.time.delayedCall(ms, () => { off(); done(samples); }));
  }
  drawDots() {
    const { width: w, height: h } = this.scale, r = Math.max(7 * D, Math.min(w, h) * 0.014);
    this.dots.clear();
    STEPS.forEach((_, i) => this.dots.lineStyle(3, 0x2b2622).fillStyle(i <= this.step ? 0xf2c94c : 0xfbf8ee)
      .fillCircle(w / 2 + (i - 1) * r * 4, h * 0.9, r).strokeCircle(w / 2 + (i - 1) * r * 4, h * 0.9, r));
  }
  layout(w, h) {
    const u = Math.min(w / 100, h / 100), portrait = h > w * 1.1, oh = portrait ? h * 0.32 : h * 0.42;
    this.head.setFontSize(Math.round(Math.max(28 * D, u * 6))).setWordWrapWidth(w * 0.85).setPosition(w / 2, h * 0.1);
    this.owl.setDisplaySize(oh * 400 / 440, oh).setPosition(w / 2, h * (portrait ? 0.38 : 0.42));
    this.say.setFontSize(Math.round(Math.max(24 * D, u * 5))).setWordWrapWidth(Math.min(w * 0.85, 760 * D)).setPosition(w / 2, h * (portrait ? 0.66 : 0.73));
    this.go.setScale(Math.max(0.9 * D, u / 7)).setPosition(w / 2, h * 0.84);
    this.lost.setFontSize(this.say.style.fontSize).setWordWrapWidth(this.say.style.wordWrapWidth).setPosition(this.say.x, this.say.y);
    if (this.step != null) this.drawDots();
  }
}
