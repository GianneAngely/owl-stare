// Trick: a rubber duck pops up next to the owl and squeaks three times.
import { sfx } from "../audio.js";

export function squeak(scene, owl, done) {
  const size = owl.displayHeight, s = size / 1100, side = owl.x < scene.scale.width / 2 ? 1 : -1;
  const w = scene.scale.width, edge = size * 0.12;   // keep the duck on a narrow phone screen
  const duck = scene.add.image(Phaser.Math.Clamp(owl.x + side * owl.displayWidth * 0.62, edge, w - edge), owl.y + size * 0.36, "duck").setScale(0).setDepth(6).setFlipX(side < 0);
  scene.tweens.add({ targets: duck, scale: s, duration: 200, ease: "Back.out" });
  for (let i = 0; i < 3; i++) scene.time.delayedCall(400 + i * 380, () => {
    sfx.squeak();
    scene.tweens.add({ targets: duck, scaleY: s * 0.7, scaleX: s * 1.15, duration: 90, yoyo: true });
  });
  owl.setFace("tongue");
  scene.time.delayedCall(1900, () => { duck.destroy(); owl.setFace(owl.rest); done(); });
}
