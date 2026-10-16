// Result card: what happened, how long you lasted, then rematch or climb. No photo of the player, ever.
import { OwlSprite } from "../art/owl-sprite.js";
import { D, paper, text, button, enter, hex } from "../ui.js";
import { INK, BELLY } from "../art/owl.js";
import { save, load } from "../store.js";
import { byId, nextOwl } from "../owls/index.js";
import { saveCard, shareCard } from "../card.js";

const WHY = { blink: "you blinked", smile: "you smiled", away: "you looked away" };

export class Result extends Phaser.Scene {
  constructor() { super("Result"); }
  create(r) {
    enter(this);
    paper(this);
    const o = byId(r.owl), next = nextOwl(o.id);
    if (r.won) save({ beaten: [...new Set([...(load().beaten ?? []), o.id])] });
    this.card = this.add.graphics();
    this.owls = (o.twins ? [0, 1] : [0]).map(() => new OwlSprite(this, o.id, r.won ? "shock" : "laugh"));
    const champion = r.won && !next;
    this.head = text(this, 0, 0, champion ? "You out-stared every owl!" : r.won ? `You out-stared ${o.name}!` : `${o.name} ${o.twins ? "win" : "wins"}`, 48);
    this.line = text(this, 0, 0, r.won ? `${o.seconds} s without a blink, a smile or a peek away.` : `You lasted ${r.seconds.toFixed(1)} s, then ${WHY[r.reason]}.`, 28, { bold: false });
    this.again = button(this, "again", r.won ? "Stare again" : "Rematch", 34, () => this.scene.start("Match", { owl: o.id }));
    this.next = r.won && next
      ? button(this, "next", `Next: ${next.short ?? next.name}`, 34, () => this.scene.start("Match", { owl: next.id }))
      : button(this, "next", "All owls", 34, () => this.scene.start("Ladder", { pick: o.id }), { color: "#e9e3d3" });
    // the "all owls" link only when the second button isn't already "All owls"
    this.links = [...(r.won && next ? ["all owls"] : []), "recalibrate"].map((label) => text(this, 0, 0, label, 22, { bold: false }).setInteractive({ useHandCursor: true })
      .on("pointerup", () => (label === "recalibrate" ? this.recalibrate() : this.scene.start("Ladder", { pick: next.id }))));
    // Save / Share sit in the card's top corners; the card image is redrawn from the owl art, never the camera
    const said = { saved: "Saved!", shared: "Shared!", copied: "Copied to clipboard!", failed: "Couldn't share here, try Save" };
    this.toast = text(this, 0, 0, "", 24, { bold: false }).setAlpha(0);
    const tell = (what) => { window.owl.card = what; if (!said[what]) return; this.toast.setText(said[what]).setAlpha(1); this.tweens.add({ targets: this.toast, alpha: 0, delay: 1800, duration: 400 }); };
    this.save = button(this, "save", "Save", 26, () => saveCard(o, r, champion).then(tell, () => tell("failed")), { color: BELLY });
    this.share = button(this, "share", "Share", 26, () => shareCard(o, r, champion).then(tell), { color: BELLY });
    window.owl.buttons.ladder = () => this.scene.start("Ladder", { pick: next && r.won ? next.id : o.id });
    window.owl.buttons.recalibrate = () => this.recalibrate();
    this.layout(this.scale.width, this.scale.height);
  }
  recalibrate() { save({ th: null }); this.scene.start("Calibrate"); }
  layout(w, h) {
    const u = Math.min(w / 100, h / 100), portrait = h > w * 1.1;
    // portrait: start below the sound toggle (top right, ~62 css px); landscape: leave room under the card for buttons and links
    const s = Math.max(0.9 * D, u / 7.5), fs = Math.round(Math.max(18 * D, u * 3.2)), ly = h - Math.max(30 * D, u * 6);
    const cw = Math.min(w * 0.88, 680 * D), cx = (w - cw) / 2, cy = portrait ? Math.max(h * 0.06, 66 * D) : h * 0.06;
    const buttons = portrait ? 34 * 1.7 * s * 1.8 + u * 7.5 : 34 * 1.7 * s + u * 4;   // stacked pair or one row, plus gaps
    const ch = Math.min(h * (portrait ? 0.66 : 0.7), cw * 1.1, ly - fs - buttons - cy);
    this.card.clear().fillStyle(hex(BELLY)).fillRoundedRect(cx, cy, cw, ch, 28).lineStyle(Math.max(3 * D, u * 0.7), hex(INK)).strokeRoundedRect(cx, cy, cw, ch, 28);
    const oh = ch * 0.5 * (this.owls.length > 1 ? 0.85 : 1);
    this.owls.forEach((o, i) => o.place(w / 2 + (i - (this.owls.length - 1) / 2) * oh * 0.9, cy + ch * 0.32, oh));
    this.head.setFontSize(Math.round(Math.max(30 * D, u * 7))).setWordWrapWidth(cw * 0.9).setPosition(w / 2, cy + ch * 0.68);
    this.line.setFontSize(Math.round(Math.max(20 * D, u * 4.2))).setWordWrapWidth(cw * 0.85).setPosition(w / 2, cy + ch * 0.85);
    const by = (cy + ch + ly - fs) / 2;
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
    const ss = Math.max(0.75 * D, u / 9), pad = u * 2;
    this.save.setScale(ss).setPosition(cx + pad + this.save.width * ss / 2, cy + pad + this.save.height * ss / 2);
    this.share.setScale(ss).setPosition(cx + cw - pad - this.share.width * ss / 2, this.save.y);
    this.toast.setFontSize(Math.round(Math.max(18 * D, u * 3.2))).setPosition(w / 2, cy + ch * 0.06);
    this.links.forEach((l, i) => l.setFontSize(fs).setPosition(w / 2 + (this.links.length > 1 ? (i ? 1 : -1) * u * 12 : 0), ly));
  }
}
