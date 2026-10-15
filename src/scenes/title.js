import { OwlSprite } from "../art/owl-sprite.js";
import { D, paper, text, button, enter } from "../ui.js";
import { unlock } from "../audio.js";
import { face } from "../face/source.js";
import { load } from "../store.js";

export class Title extends Phaser.Scene {
  constructor() { super("Title"); }
  create() {
    enter(this);
    paper(this);
    this.owl = new OwlSprite(this, "hoot", "idle");
    this.title = text(this, 0, 0, "Owl Stare", 80);
    this.sub = text(this, 0, 0, "Don't blink. Don't laugh. Don't look away.", 28, { bold: false });
    this.play = button(this, "play", "Play", 40, () => {
      unlock();
      if (!face.ready) return this.scene.start("CameraAsk");
      this.scene.start(load().th ? "Ladder" : "Calibrate");
    });
    // the owl blinks at you now and then, which is rude in a staring contest
    this.time.addEvent({ delay: 2600, loop: true, callback: () => { this.owl.setFace("blink"); this.time.delayedCall(160, () => this.owl.setFace("idle")); } });
    this.tweens.add({ targets: this.owl, y: "+=6", duration: 1400, yoyo: true, repeat: -1, ease: "Sine.inOut" });
    this.layout(this.scale.width, this.scale.height);
  }
  layout(w, h) {
    const u = Math.min(w / 100, h / 100);
    const portrait = h > w * 1.1;
    const oh = portrait ? Math.min(h * 0.4, w * 0.8) : h * 0.5;
    this.owl.setDisplaySize(oh * 400 / 440, oh).setPosition(w / 2, h * (portrait ? 0.4 : 0.42));
    this.title.setFontSize(Math.round(Math.max(44 * D, u * 11))).setPosition(w / 2, h * (portrait ? 0.12 : 0.1));
    this.sub.setFontSize(Math.round(Math.max(22 * D, u * 4.4))).setWordWrapWidth(w * 0.85).setPosition(w / 2, h * (portrait ? 0.68 : 0.74));
    this.play.setScale(Math.max(0.9 * D, u / 7)).setPosition(w / 2, h * (portrait ? 0.8 : 0.87));
  }
}
