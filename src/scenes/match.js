// One staring match: 3-2-1-STARE!, the owl cheats, the judge watches your face, you break or the clock runs out.
import { OwlSprite } from "../art/owl-sprite.js";
import { D, paper, text, enter, note, hook, hex } from "../ui.js";
import { INK, YELLOW, BLUE, BELLY } from "../art/owl.js";
import { sfx } from "../audio.js";
import { onFace } from "../face/source.js";
import { createJudge } from "../face/judge.js";
import { DEFAULTS } from "../face/calibrate.js";
import { load } from "../store.js";
import { TRICKS } from "../tricks/index.js";
import { byId } from "../owls/index.js";

const GRACE = 400;   // ms after STARE! before the judge starts watching
const VERDICT = { blink: "You blinked!", smile: "You smiled!", away: "You looked away!" };

export class Match extends Phaser.Scene {
  constructor() { super("Match"); }
  create({ owl } = {}) {
    enter(this);
    paper(this);
    this.owlData = byId(owl);
    this.state = "countdown";
    this.elapsed = 0;
    this.timers = [];
    this.owls = (this.owlData.twins ? [0, 1] : [0]).map(() => new OwlSprite(this, this.owlData.id, "idle"));
    this.name = text(this, 0, 0, this.owlData.name, 30);
    this.bar = this.add.graphics();
    this.clock = this.add.image(0, 0, "clock");
    this.big = text(this, 0, 0, "", 120).setDepth(10).setResolution(3);   // the countdown pops up to 2.8x
    this.hint = text(this, 0, 0, "don't blink · don't smile · don't look away", 22, { bold: false });
    this.layout(this.scale.width, this.scale.height);
    note(`match ${this.owlData.id}`);

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
    // STARE! sits above the owls' eyes (between the timer bar and the top of the face), shrunk to fit if needed
    const o = this.owls[0], barBottom = this.barBox.y + this.barBox.h * 1.6, faceTop = o.y - o.displayHeight * 0.25;
    this.big.setText("STARE!").setScale(1).setY((barBottom + faceTop) / 2);
    this.pop("STARE!", Math.min(1, (faceTop - barBottom) / this.big.height));
    sfx.stare();
    this.tweens.add({ targets: this.big, alpha: 0, delay: 600, duration: 300 });
    this.owls.forEach((o) => o.setFace(o.rest));
    this.judge.reset();
    this.state = "stare";
    note("stare");
    // each owl cheats on its own clock; the twins start apart so their tricks overlap rather than mirror
    this.owls.forEach((o, i) => this.scheduleTrick(o, 1200 + i * 1500));
    hook.trick = (name, i = 0) => TRICKS[name](this, this.owls[i], () => {});   // test hook: force a trick now
  }
  scheduleTrick(owl, delay) {
    const [a, b] = this.owlData.gap;
    this.timers.push(this.time.delayedCall(delay ?? Phaser.Math.Between(a, b), () => {
      if (this.state !== "stare" || hook.quiet) return;   // hook.quiet: tests force tricks one at a time
      const name = Phaser.Utils.Array.GetRandom(this.owlData.tricks);
      note(`trick ${name}`);
      if (this.owlData.overlap) this.scheduleTrick(owl);   // the boss doesn't wait for a trick to finish
      TRICKS[name](this, owl, () => !this.owlData.overlap && this.state === "stare" && this.scheduleTrick(owl));
    }));
  }
  check(sig) {
    if (this.elapsed < GRACE) return;   // nobody loses to the blink they did while reading STARE!
    const v = this.judge.update(sig);
    if (v) this.end(v);
  }
  update(_, dt) {
    if (this.state !== "stare") return;
    // tick every second, twice a second (and higher) in the last 3 s
    const last = this.owlData.seconds * 1000 - this.elapsed < 3000, step = last ? 500 : 1000, before = Math.floor(this.elapsed / step);
    this.elapsed += dt;
    if (Math.floor(this.elapsed / step) > before) sfx.tick(last);
    if (this.elapsed >= this.owlData.seconds * 1000) this.end(null);
    this.drawBar();
  }
  end(reason) {
    this.state = "over";
    this.timers.forEach((t) => t.remove());
    const seconds = Math.min(this.elapsed, this.owlData.seconds * 1000) / 1000;
    hook.result = { owl: this.owlData.id, won: !reason, reason, seconds: +seconds.toFixed(1) };
    note(`end ${reason ?? "win"} at ${seconds.toFixed(1)}s`);
    this.owls.forEach((o) => { this.tweens.killTweensOf(o); o.setAngle(0).setFace(reason ? "laugh" : "shock"); });
    this.layout(this.scale.width, this.scale.height);
    // the verdict goes under the owl, where the hint was, so the owl's face stays visible
    const o = this.owls[0];
    this.hint.setVisible(false);
    this.tweens.killTweensOf(this.big);   // a loss right after STARE! must not inherit its fade-out
    this.big.setWordWrapWidth(this.scale.width * 0.9).setY(o.y + o.displayHeight * 0.58);
    this.pop(reason ? VERDICT[reason] : "You win!");
    this.big.setFontSize(Math.round(this.bigSize * 0.5));
    if (reason) { sfx.lose(); this.tweens.add({ targets: this.owls, y: "-=14", duration: 120, yoyo: true, repeat: 5 }); }
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
    const n = this.owls.length, size = this.owlData.size;
    // the biggest owl stays inside the frame: height capped by the space under the bar, width by the room per owl
    const room = portrait ? h * 0.5 : h * 0.62, maxW = (w * (portrait ? 0.92 : 0.8)) / n;
    const oh = room * Math.min(1, size + 0.1), y = h * (portrait ? 0.45 : 0.53) + (room - oh) * 0.4;
    this.owls.forEach((o, i) => o.place(w / 2 + (i - (n - 1) / 2) * maxW, y, oh, maxW * 0.95));
    this.bigSize = Math.max(80 * D, u * 22);
    this.big.setFontSize(Math.round(this.bigSize)).setPosition(w / 2, h * (portrait ? 0.45 : 0.5)).setStroke(BELLY, this.bigSize * 0.12);
    this.hint.setFontSize(Math.round(Math.max(18 * D, u * 3.6))).setWordWrapWidth(w * (portrait ? 0.9 : 0.5)).setPosition(portrait ? w / 2 : w * 0.4, h * (portrait ? 0.79 : 0.92));
    this.drawBar();
  }
}
