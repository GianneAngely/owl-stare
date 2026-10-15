import { OWL_FACES, faceSVG, bodySVG, frontSVG, featherSVG, clockSVG, zapSVG, bangSVG, flySVG, duckSVG, noteSVG, yarnSVG, dataURL } from "../art/owl.js";
import { OWLS } from "../owls/index.js";
import { FONT } from "../ui.js";

export class Boot extends Phaser.Scene {
  constructor() { super("Boot"); }
  preload() {
    // rasterized at 2x the largest on-screen size so they stay crisp on phones
    const big = { width: 800, height: 880 };
    for (const f of OWL_FACES) this.load.svg(`face-${f}`, dataURL(faceSVG(f)), big);
    for (const o of OWLS) {
      this.load.svg(`body-${o.id}`, dataURL(bodySVG(o.look)), big);
      const front = frontSVG(o.look);
      if (front) this.load.svg(`front-${o.id}`, dataURL(front), big);
    }
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
