// Trick: DJ Night drops a beat and dances, pulling a new face on every beat; music notes float up.
import { sfx } from "../audio.js";

const MOVES = ["tongue", "laugh", "cross", "shout"];

export function dance(scene, owl, done) {
  const size = owl.displayHeight, { y } = owl.home;
  sfx.beat(3);
  for (let i = 0; i < 6; i++) scene.time.delayedCall(i * 500, () => {
    owl.setFace(MOVES[i % MOVES.length]);
    scene.tweens.add({ targets: owl, y: y - size * 0.06, angle: i % 2 ? 8 : -8, duration: 120, yoyo: true, ease: "Quad.out" });
    const n = scene.add.image(owl.x + (i % 2 ? 1 : -1) * owl.displayWidth * 0.55, y - size * 0.2, "note").setScale(size / 1300).setDepth(6);
    scene.tweens.add({ targets: n, y: n.y - size * 0.35, alpha: 0, angle: i % 2 ? 20 : -20, duration: 1200, onComplete: () => n.destroy() });
  });
  scene.time.delayedCall(3100, () => { owl.setFace(owl.rest).setAngle(0).setY(y); done(); });
}
