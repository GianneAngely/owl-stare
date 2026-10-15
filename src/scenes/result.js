// Result card (prototype): what happened, how long you lasted, retry. No photo of the player, ever.
import { D, paper, text, button, enter, hex } from "../ui.js";
import { INK, BELLY } from "../art/owl.js";
import { save, load } from "../store.js";
import HOOT from "../owls/hoot.js";

const WHY = { blink: "you blinked", smile: "you smiled", away: "you looked away" };

export class Result extends Phaser.Scene {
  constructor() { super("Result"); }
  create(r) {
    enter(this);
    paper(this);
    if (r.won) save({ beaten: [...new Set([...(load().beaten ?? []), r.owl])] });
    this.card = this.add.graphics();
    this.owl = this.add.image(0, 0, r.won ? "owl-shock" : "owl-laugh");
    this.head = text(this, 0, 0, r.won ? `You out-stared ${HOOT.name}!` : `${HOOT.name} wins`, 48);
    this.line = text(this, 0, 0, r.won ? `${HOOT.seconds} s without a blink, a smile or a peek away.` : `You lasted ${r.seconds.toFixed(1)} s, then ${WHY[r.reason]}.`, 28, { bold: false });
    this.again = button(this, "again", r.won ? "Stare again" : "Rematch", 34, () => this.scene.start("Match"));
    this.next = button(this, "next", "More owls soon", 34, () => {}, { color: "#e9e3d3" });
    this.recal = text(this, 0, 0, "recalibrate", 22, { bold: false }).setInteractive({ useHandCursor: true }).on("pointerup", () => this.recalibrate());
    window.owl.buttons.recalibrate = () => this.recalibrate();
    this.layout(this.scale.width, this.scale.height);
  }
  recalibrate() { save({ th: null }); this.scene.start("Calibrate"); }
  layout(w, h) {
    const u = Math.min(w / 100, h / 100), portrait = h > w * 1.1;
    const cw = Math.min(w * 0.88, 680 * D), ch = Math.min(h * (portrait ? 0.66 : 0.7), cw * 1.1), cx = (w - cw) / 2, cy = h * 0.06;
    this.card.clear().fillStyle(hex(BELLY)).fillRoundedRect(cx, cy, cw, ch, 28).lineStyle(Math.max(3 * D, u * 0.7), hex(INK)).strokeRoundedRect(cx, cy, cw, ch, 28);
    const oh = ch * 0.5;
    this.owl.setDisplaySize(oh * 400 / 440, oh).setPosition(w / 2, cy + ch * 0.32);
    this.head.setFontSize(Math.round(Math.max(30 * D, u * 7))).setWordWrapWidth(cw * 0.9).setPosition(w / 2, cy + ch * 0.68);
    this.line.setFontSize(Math.round(Math.max(20 * D, u * 4.2))).setWordWrapWidth(cw * 0.85).setPosition(w / 2, cy + ch * 0.85);
    const s = Math.max(0.9 * D, u / 7.5), by = cy + ch + (h - cy - ch) * 0.4;
    if (portrait) {   // stacked right under the card, spaced by their real heights
      this.again.setScale(s); this.next.setScale(s * 0.8);
      const gap = u * 3, a = this.again.height * s, n = this.next.height * s * 0.8;
      this.again.setPosition(w / 2, cy + ch + gap * 1.5 + a / 2); this.next.setPosition(w / 2, this.again.y + a / 2 + gap + n / 2);
    }
    else {
      this.again.setScale(s); this.next.setScale(s);
      const gap = u * 3, a = this.again.width * s, n = this.next.width * s, left = w / 2 - (a + gap + n) / 2;
      this.again.setPosition(left + a / 2, by); this.next.setPosition(left + a + gap + n / 2, by);
    }
    this.recal.setFontSize(Math.round(Math.max(18 * D, u * 3.2))).setPosition(w / 2, h - Math.max(30 * D, u * 6));
  }
}
