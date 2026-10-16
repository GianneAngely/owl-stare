import { featherSVG, clockSVG, zapSVG, bangSVG, flySVG, duckSVG, noteSVG, yarnSVG, dataURL } from "../art/owl.js";
import { OWLS } from "../owls/index.js";
import { POSES } from "../art/owl-sprite.js";
import { FONT } from "../ui.js";

export class Boot extends Phaser.Scene {
  constructor() { super("Boot"); }
  preload() {
    // one Flow drawing per owl and pose; owls without a shouting trick have no "shout" drawing
    for (const o of OWLS) for (const p of POSES) if (p !== "shout" || !["hoot", "plume", "twitchy"].includes(o.id)) this.load.image(`owl-${o.id}-${p}`, `assets/owls/${o.id}-${p}.webp`);
    this.load.svg("feather", dataURL(featherSVG()), { width: 90, height: 225 });
    this.load.svg("clock", dataURL(clockSVG()), { width: 120, height: 126 });
    this.load.svg("zap", dataURL(zapSVG()), { width: 180, height: 165 });
    this.load.svg("bang", dataURL(bangSVG()), { width: 60, height: 110 });
    this.load.svg("fly", dataURL(flySVG()), { width: 135, height: 105 });
    this.load.svg("duck", dataURL(duckSVG()), { width: 260, height: 220 });
    this.load.svg("note", dataURL(noteSVG()), { width: 90, height: 120 });
    this.load.svg("yarn", dataURL(yarnSVG()), { width: 160, height: 160 });
  }
  async create() {
    try { await Promise.all([document.fonts.load(`700 32px ${FONT}`), document.fonts.load(`400 32px ${FONT}`)]); } catch {}
    this.scene.start("Title");
  }
}
