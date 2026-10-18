// The ladder (GDD §7 step 4): eight owls on branches, locked ones are ink silhouettes, beaten ones get a star.
// Tap an open owl to see who it is, then Stare! to fight it.
import { OwlSprite } from "../art/owl-sprite.js";
import { D, paper, text, button, enter, hex, note } from "../ui.js";
import { INK, YELLOW, GREY } from "../art/owl.js";
import { OWLS, unlocked } from "../owls/index.js";
import { load } from "../store.js";

export class Ladder extends Phaser.Scene {
  constructor() { super("Ladder"); }
  create({ pick } = {}) {
    enter(this);
    paper(this);
    const beaten = load().beaten ?? [];
    this.open = OWLS.map((_, i) => unlocked(i, beaten));
    this.done = OWLS.map((o) => beaten.includes(o.id));
    // default pick: the asked one if open, else the first open owl not beaten yet, else the boss
    const first = OWLS.findIndex((o, i) => this.open[i] && !this.done[i]);
    this.pick = OWLS.findIndex((o, i) => o.id === pick && this.open[i]);
    if (this.pick < 0) this.pick = first < 0 ? OWLS.length - 1 : first;

    this.head = text(this, 0, 0, "Who will you out-stare?", 46);
    this.branches = this.add.graphics();
    this.marks = this.add.graphics().setDepth(2);
    this.owls = OWLS.map((o, i) => {
      const s = new OwlSprite(this, o.id, this.done[i] && i !== this.pick ? "shock" : "rest").setSilhouette(!this.open[i]);
      s.setInteractive({ useHandCursor: this.open[i] }).on("pointerup", () => this.select(i));
      window.owl.buttons[`owl-${o.id}`] = () => this.select(i);
      return s;
    });
    this.name = text(this, 0, 0, "", 40);
    this.info = text(this, 0, 0, "", 26, { bold: false });
    this.go = button(this, "stare", "Stare!", 38, () => this.scene.start("Match", { owl: OWLS[this.pick].id }));
    this.layout(this.scale.width, this.scale.height);
    this.select(this.pick);
  }
  select(i) {
    if (!this.open[i]) return;
    this.owls[this.pick].setFace(this.done[this.pick] ? "shock" : "rest");
    this.tweens.killTweensOf(this.owls[this.pick]);
    this.owls[this.pick].setY(this.owls[this.pick].home.y);
    this.pick = i;
    const o = OWLS[i];
    this.owls[i].setFace("rest");   // the picked owl hops, in its lineup pose
    this.tweens.add({ targets: this.owls[i], y: this.owls[i].home.y - this.owls[i].displayHeight * 0.06, duration: 420, yoyo: true, repeat: -1, ease: "Sine.inOut" });
    this.name.setText(`${i + 1}. ${o.name}`);
    this.info.setText(`${o.who} · ${o.seconds} s${this.done[i] ? " · beaten ★" : ""}\n“${o.line}”`);
    this.placeGo();
    window.owl.picked = o.id;
    note(`pick ${o.id}`);
    this.drawMarks();
  }
  stackInfo() { this.info.setPosition(this.scale.width / 2, this.name.y + this.name.height + this.u * 1.6); }
  // the button sits under the info text, whose height changes with the owl's line
  placeGo() {
    const { height: h } = this.scale, u = this.u, half = (this.go.height * this.go.scaleY) / 2;
    this.stackInfo();
    this.go.setPosition(this.scale.width / 2, Math.min(h - u * 3 - half, this.info.y + this.info.height + u * 3 + half));
  }
  drawMarks() {
    const u = this.u;
    this.marks.clear();
    this.owls.forEach((s, i) => {
      const x = s.home.x, y = s.home.y + s.displayHeight * 0.56;
      if (i === this.pick) this.marks.fillStyle(hex(YELLOW), 0.8).fillEllipse(x, y, s.displayWidth * 0.9, u * 2.4);
      if (this.done[i]) star(this.marks, x + s.displayWidth * 0.42, s.home.y - s.displayHeight * 0.42, u * 2.2);
    });
  }
  layout(w, h) {
    const u = (this.u = Math.min(w / 100, h / 100)), portrait = h > w * 1.1;
    const cols = portrait ? 4 : 8, rows = OWLS.length / cols;
    this.head.setFontSize(Math.round(Math.max(28 * D, u * 6.5))).setWordWrapWidth(w * 0.9).setPosition(w / 2, h * 0.09);
    // rows of owls standing on a doodled branch, each owl a little bigger along the ladder
    const top = h * (portrait ? 0.17 : 0.12), rowH = (h * (portrait ? 0.5 : 0.42)) / rows, cw = (w * 0.9) / cols;
    this.branches.clear().lineStyle(Math.max(3 * D, u * 0.7), hex(INK));
    OWLS.forEach((o, i) => {
      const r = Math.floor(i / cols), c = i % cols, oh = Math.min(rowH * 0.78, cw * 1.05) * (0.8 + o.size * 0.2);
      const foot = top + rowH * (r + 0.92);
      this.owls[i].place(w * 0.05 + cw * (c + 0.5), foot - oh / 2, oh, portrait ? cw * 1.1 : Infinity);   // on a phone wide Boomer stays inside the screen
    });
    for (let r = 0; r < rows; r++) {
      const y = top + rowH * (r + 0.92);
      this.branches.lineBetween(w * 0.04, y, w * 0.96, y + u * 0.6).lineStyle(Math.max(2 * D, u * 0.4), hex(GREY))
        .lineBetween(w * 0.2, y + u * 0.3, w * 0.24, y + u * 3).lineBetween(w * 0.7, y + u * 0.4, w * 0.75, y + u * 2.6).lineStyle(Math.max(3 * D, u * 0.7), hex(INK));
    }
    const infoTop = top + rowH * rows + u * 2;
    // name, then the info block stacked under it by their real heights (fixed offsets overlapped on wide screens)
    this.name.setFontSize(Math.round(Math.max(26 * D, u * 5.6))).setWordWrapWidth(w * 0.9).setOrigin(0.5, 0).setPosition(w / 2, infoTop + u);
    this.info.setFontSize(Math.round(Math.max(19 * D, u * 4))).setWordWrapWidth(Math.min(w * 0.85, 700 * D)).setOrigin(0.5, 0);
    this.stackInfo();
    this.go.setScale(Math.max(0.9 * D, u / 7));
    // test hook: where each owl is, in CSS pixels, for real mouse clicks
    window.owl.spots = Object.fromEntries(OWLS.map((o, i) => [o.id, [this.owls[i].home.x / D, this.owls[i].home.y / D]]));
    if (this.pick != null && this.owls[this.pick]) { this.tweens.killTweensOf(this.owls[this.pick]); this.select(this.pick); }
  }
}

function star(g, x, y, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; pts.push({ x: x + Math.cos(a) * rr, y: y + Math.sin(a) * rr }); }
  g.fillStyle(hex(YELLOW)).fillPoints(pts, true).lineStyle(Math.max(2 * D, r * 0.18), hex(INK)).strokePoints(pts, true);
}
