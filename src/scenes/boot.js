import { OWL_FACES, owlSVG, featherSVG, clockSVG, zapSVG, bangSVG, dataURL } from "../art/owl.js";
import { FONT } from "../ui.js";

export class Boot extends Phaser.Scene {
  constructor() { super("Boot"); }
  preload() {
    // rasterized at 2x the largest on-screen size so they stay crisp on phones
    for (const f of OWL_FACES) this.load.svg(`owl-${f}`, dataURL(owlSVG(f)), { width: 800, height: 880 });
    this.load.svg("feather", dataURL(featherSVG()), { width: 90, height: 225 });
    this.load.svg("clock", dataURL(clockSVG()), { width: 120, height: 126 });
    this.load.svg("zap", dataURL(zapSVG()), { width: 180, height: 165 });
    this.load.svg("bang", dataURL(bangSVG()), { width: 60, height: 110 });
  }
  async create() {
    try { await Promise.all([document.fonts.load(`700 32px ${FONT}`), document.fonts.load(`400 32px ${FONT}`)]); } catch {}
    this.scene.start("Title");
  }
}
