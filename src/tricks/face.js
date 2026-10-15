// Trick: the owl squashes and pulls a silly face for a moment, with a boing and some "!!".
import { sfx } from "../audio.js";

const FACES = ["tongue", "cross"];

export function face(scene, owl, done) {
  sfx.boing();
  const { sx, sy } = owl.home;
  owl.setFace(Phaser.Utils.Array.GetRandom(FACES));
  scene.tweens.add({ targets: owl, scaleX: sx * 1.12, scaleY: sy * 0.86, duration: 90, yoyo: true, repeat: 1, ease: "Quad.out",
    onComplete: () => owl.setScale(sx, sy) });
  // zaps and "!!" around the owl, kept on screen on narrow phones
  const size = owl.displayHeight, half = Math.min(owl.displayWidth * 0.62, scene.scale.width / 2 - size * 0.08);
  const bits = [["zap", -1, -0.05, -15], ["zap", 1, -0.25, 160], ["bang", -0.92, -0.35, -12], ["bang", 0.9, 0.05, 12], ["bang", 1, 0.02, 20]]
    .map(([k, dx, dy, rot]) => scene.add.image(owl.x + dx * half, owl.y + dy * size, k).setAngle(rot).setScale(0).setDepth(5));
  bits.forEach((b, i) => scene.tweens.add({ targets: b, scale: (size / 900) * (b.texture.key === "zap" ? 1.4 : 1.1), duration: 160, delay: i * 40, ease: "Back.out" }));
  scene.time.delayedCall(1300, () => {
    owl.setFace(owl.rest);
    bits.forEach((b) => b.destroy());
    done();
  });
}
