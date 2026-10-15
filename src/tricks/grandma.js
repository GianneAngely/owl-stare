// Grandma Owlbert's tricks. knit: slow and sweet, a yarn ball rolls by to a music box. surprise: then, suddenly, a face.
import { sfx } from "../audio.js";

export function knit(scene, owl, done) {
  const { width: w } = scene.scale, size = owl.displayHeight;
  sfx.musicbox(3);
  owl.setFace("sweet");
  scene.tweens.add({ targets: owl, angle: { from: -4, to: 4 }, duration: 750, yoyo: true, repeat: 1, ease: "Sine.inOut", onComplete: () => owl.setAngle(0) });
  const yarn = scene.add.image(-60, owl.y + size * 0.42, "yarn").setScale(size / 1400).setDepth(6);
  scene.tweens.add({ targets: yarn, x: w + 60, angle: 720, duration: 3200, onComplete: () => { yarn.destroy(); done(); } });
}

export function surprise(scene, owl, done) {
  const { sx, sy, y } = owl.home;
  owl.setFace(Phaser.Utils.Array.GetRandom(["tongue", "cross", "shout"]));
  sfx.sting();
  scene.cameras.main.shake(200, 0.008);
  scene.tweens.add({ targets: owl, scaleX: sx * 1.45, scaleY: sy * 1.45, y: y + owl.displayHeight * 0.1, duration: 120, ease: "Back.out", yoyo: true, hold: 900,
    onComplete: () => { owl.setScale(sx, sy).setY(y); owl.setFace(owl.rest); done(); } });
}
