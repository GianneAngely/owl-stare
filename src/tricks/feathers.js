// Trick: the owl flaps and a flurry of feathers drifts across the screen.
import { sfx } from "../audio.js";

export function feathers(scene, owl, done) {
  sfx.whoosh();
  const { width: w, height: h } = scene.scale, s = Math.min(w, h) / 900;
  scene.tweens.add({ targets: owl, angle: { from: -6, to: 6 }, duration: 110, yoyo: true, repeat: 5, onComplete: () => owl.setAngle(0) });
  for (let i = 0; i < 14; i++) {
    const f = scene.add.image(Phaser.Math.Between(0, w), -60 - Math.random() * h * 0.4, "feather").setScale(s * (0.6 + Math.random() * 0.6)).setDepth(6)
      .setAngle(Phaser.Math.Between(-60, 60));
    const ms = 2400 + Math.random() * 1400;
    scene.tweens.add({ targets: f, y: h + 120, duration: ms, ease: "Sine.in", onComplete: () => f.destroy() });
    scene.tweens.add({ targets: f, x: f.x + Phaser.Math.Between(-90, 90) * s * 2, angle: f.angle + Phaser.Math.Between(-80, 80), duration: 600 + Math.random() * 400, yoyo: true, repeat: -1, ease: "Sine.inOut" });
  }
  scene.time.delayedCall(2600, done);
}
