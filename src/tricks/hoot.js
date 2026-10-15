// Trick: a sudden, very loud HOOT! with a screen shake.
import { sfx } from "../audio.js";
import { text } from "../ui.js";
import { INK, BELLY } from "../art/owl.js";

export function hoot(scene, owl, done) {
  sfx.boom();
  owl.setFace("shout");
  scene.cameras.main.shake(350, 0.012);
  const { sx, sy } = owl.home, size = owl.displayHeight;
  scene.tweens.add({ targets: owl, scaleX: sx * 1.15, scaleY: sy * 1.15, duration: 80, yoyo: true, hold: 350 });
  const word = text(scene, owl.x + size * 0.15, owl.y - size * 0.42, "HOOT!", size * 0.2).setColor(INK).setStroke(BELLY, size * 0.03).setAngle(-8).setDepth(9).setScale(0);
  scene.tweens.add({ targets: word, scale: 1, duration: 160, ease: "Back.out" });
  scene.time.delayedCall(1100, () => { word.destroy(); owl.setFace(owl.rest); owl.setScale(sx, sy); done(); });
}
