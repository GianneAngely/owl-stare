// Trick: a fly buzzes in, lands on the owl's beak for a moment, then zips off.
import { sfx } from "../audio.js";

export function fly(scene, owl, done) {
  const { width: w } = scene.scale, s = owl.displayHeight / 700;
  const fromLeft = Math.random() < 0.5, beakX = owl.x, beakY = owl.y - owl.displayHeight * 0.03;
  const f = scene.add.image(fromLeft ? -80 : w + 80, owl.y - owl.displayHeight * 0.4, "fly").setScale(s).setDepth(6).setFlipX(!fromLeft);
  scene.tweens.add({ targets: f, scaleY: s * 0.8, duration: 40, yoyo: true, repeat: -1 });   // wings
  sfx.buzz(3.2);
  owl.setFace("cross");
  const wobble = (t, amp) => Math.sin(t * 22) * amp;
  scene.tweens.addCounter({ from: 0, to: 1, duration: 1300, ease: "Sine.out", onUpdate: (tw) => {
    const p = tw.getValue(), x0 = fromLeft ? -80 : w + 80;
    f.setPosition(x0 + (beakX - x0) * p, owl.y - owl.displayHeight * 0.4 + (beakY - owl.y + owl.displayHeight * 0.4) * p + wobble(p, 40 * s * (1 - p)));
  }, onComplete: () => scene.time.delayedCall(900, () => {
    scene.tweens.add({ targets: f, x: fromLeft ? w + 100 : -100, y: f.y - owl.displayHeight * 0.5, duration: 900, ease: "Quad.in", onComplete: () => f.destroy() });
    owl.setFace(owl.rest);
    scene.time.delayedCall(600, done);
  }) });
}
