// One staring match: 3-2-1-STARE!, the owl cheats, the judge watches your face, you break or the clock runs out.
import { D, paper, text, enter, note, hook, hex } from "../ui.js";
import { INK, YELLOW, BLUE, BELLY } from "../art/owl.js";
import { sfx } from "../audio.js";
import { onFace } from "../face/source.js";
import { createJudge } from "../face/judge.js";
import { DEFAULTS } from "../face/calibrate.js";
import { load } from "../store.js";
import { TRICKS } from "../tricks/index.js";
import HOOT from "../owls/hoot.js";

const GRACE = 400;   // ms after STARE! before the judge starts watching

export class Match extends Phaser.Scene {
  constructor() { super("Match"); }
  create() {
    enter(this);
    paper(this);
    this.owlData = HOOT;
    this.state = "countdown";
    this.elapsed = 0;
    this.owl = this.add.image(0, 0, "owl-idle");
    this.name = text(this, 0, 0, this.owlData.name, 30);
    this.bar = this.add.graphics();
    this.clock = this.add.image(0, 0, "clock");
    this.big = text(this, 0, 0, "", 120).setDepth(10);
    this.hint = text(this, 0, 0, "don't blink · don't smile · don't look away", 22, { bold: false });
    this.layout(this.scale.width, this.scale.height);

    this.judge = createJudge({ ...DEFAULTS, ...load().th });
    const off = onFace((s) => this.state === "stare" && this.check(s));
    this.events.once("shutdown", off);

    ["3", "2", "1"].forEach((n, i) => this.time.delayedCall(i * 800, () => { this.pop(n, 2); sfx.count(); }));
    this.time.delayedCall(2400, () => this.begin());
  }
  pop(str, scale = 1) {   // Gaegu's digits are small, so the countdown passes a bigger scale
    this.big.setText(str).setScale(scale * 1.4).setAlpha(1);
    this.tweens.add({ targets: this.big, scale, duration: 300, ease: "Back.out" });
  }
  begin() {
    this.pop("STARE!");
    sfx.stare();
    this.tweens.add({ targets: this.big, alpha: 0, delay: 600, duration: 300 });
    this.owl.setTexture("owl-stare");
    this.judge.reset();
    this.state = "stare";
    note("stare");
    this.scheduleTrick(1200);
    hook.trick = (name) => TRICKS[name](this, this.owl, () => {});   // test hook: force a trick now
  }
  scheduleTrick(delay) {
    const [a, b] = this.owlData.gap;
    this.trickTimer = this.time.delayedCall(delay ?? Phaser.Math.Between(a, b), () => {
      if (this.state !== "stare") return;
      const name = Phaser.Utils.Array.GetRandom(this.owlData.tricks);
      note(`trick ${name}`);
      TRICKS[name](this, this.owl, () => this.state === "stare" && this.scheduleTrick());
    });
  }
  check(sig) {
    if (this.elapsed < GRACE) return;   // nobody loses to the blink they did while reading STARE!
    const v = this.judge.update(sig);
    if (v) this.end(v);
  }
  update(_, dt) {
    if (this.state !== "stare") return;
    const before = Math.floor(this.elapsed / 1000);
    this.elapsed += dt;
    if (Math.floor(this.elapsed / 1000) > before) sfx.tick(this.owlData.seconds * 1000 - this.elapsed < 3000);
    if (this.elapsed >= this.owlData.seconds * 1000) this.end(null);
    this.drawBar();
  }
  end(reason) {
    this.state = "over";
    this.trickTimer?.remove();
    const seconds = Math.min(this.elapsed, this.owlData.seconds * 1000) / 1000;
    hook.result = { owl: this.owlData.id, won: !reason, reason, seconds: +seconds.toFixed(1) };
    note(`end ${reason ?? "win"} at ${seconds.toFixed(1)}s`);
    this.tweens.killTweensOf(this.owl);
    this.owl.setAngle(0).setTexture(reason ? "owl-laugh" : "owl-shock");
    this.layout(this.scale.width, this.scale.height);
    // the verdict goes under the owl, where the hint was, so the owl's face stays visible
    this.hint.setVisible(false);
    this.tweens.killTweensOf(this.big);   // a loss right after STARE! must not inherit its fade-out
    this.big.setWordWrapWidth(this.scale.width * 0.9).setY(this.owl.y + this.owl.displayHeight * 0.58);
    this.pop(reason ? this.owlData.wins[reason] : "You win!");
    this.big.setFontSize(Math.round(this.bigSize * 0.5));
    if (reason) { sfx.lose(); this.tweens.add({ targets: this.owl, y: "-=14", duration: 120, yoyo: true, repeat: 5 }); }
    else sfx.win();
    this.drawBar();
    this.time.delayedCall(2200, () => this.scene.start("Result", hook.result));
  }
  drawBar() {
    const { x, y, w, h } = this.barBox, left = 1 - Math.min(1, this.elapsed / (this.owlData.seconds * 1000));
    this.bar.clear().fillStyle(hex(BLUE)).fillRoundedRect(x, y, w, h, h / 2);
    if (left > 0.02) this.bar.fillStyle(hex(YELLOW)).fillRoundedRect(x, y, Math.max(h, w * left), h, h / 2);
    this.bar.lineStyle(Math.max(3 * D, h * 0.16), hex(INK)).strokeRoundedRect(x, y, w, h, h / 2);
  }
  layout(w, h) {
    const u = Math.min(w / 100, h / 100), portrait = h > w * 1.1;
    const bw = Math.min(w * 0.7, 720 * D), bh = Math.max(16 * D, u * 3.4);
    this.barBox = { x: (w - bw) / 2 + bh, y: h * 0.09, w: bw - bh, h: bh };
    this.clock.setDisplaySize(bh * 2.6, bh * 2.7).setPosition(this.barBox.x - bh * 0.6, this.barBox.y + bh / 2);
    this.name.setFontSize(Math.round(Math.max(22 * D, u * 4.4))).setPosition(w / 2, this.barBox.y - bh * 0.9);
    const oh = portrait ? Math.min(h * 0.5, w * 0.95) : h * 0.62;
    this.owl.setDisplaySize(oh * 400 / 440, oh).setPosition(w / 2, h * (portrait ? 0.45 : 0.53));
    this.bigSize = Math.max(80 * D, u * 22);
    this.big.setFontSize(Math.round(this.bigSize)).setPosition(w / 2, h * (portrait ? 0.45 : 0.5)).setStroke(BELLY, this.bigSize * 0.12);
    this.hint.setFontSize(Math.round(Math.max(18 * D, u * 3.6))).setWordWrapWidth(w * (portrait ? 0.9 : 0.5)).setPosition(portrait ? w / 2 : w * 0.4, h * (portrait ? 0.79 : 0.92));
    this.drawBar();
  }
}
