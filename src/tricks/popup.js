// Trick: a fake system pop-up wobbles onto the screen.
import { sfx } from "../audio.js";
import { text, hex, D } from "../ui.js";
import { INK, BELLY, YELLOW, BLUE } from "../art/owl.js";

const MESSAGES = ["Owl OS needs to restart.\nBlink to continue.", "You have 1 new hoot.\nClose your eyes to read it.", "Low battery.\nPlease blink to save power."];

export function popup(scene, owl, done) {
  const { width: w, height: h } = scene.scale, u = Math.min(w, h) / 100;
  const pw = Math.min(w * 0.8, u * 62), ph = u * 30, x = w / 2 + Phaser.Math.Between(-u * 8, u * 8), y = h * 0.42;
  const c = scene.add.container(x, y).setDepth(9);
  const g = scene.add.graphics().fillStyle(hex(BELLY)).lineStyle(Math.max(3 * D, u * 0.6), hex(INK))
    .fillRoundedRect(-pw / 2, -ph / 2, pw, ph, u * 2).fillStyle(hex(BLUE)).fillRoundedRect(-pw / 2, -ph / 2, pw, u * 7, { tl: u * 2, tr: u * 2, bl: 0, br: 0 })
    .strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, u * 2).lineBetween(-pw / 2, -ph / 2 + u * 7, pw / 2, -ph / 2 + u * 7)
    .fillStyle(hex(YELLOW)).fillRoundedRect(-u * 10, ph / 2 - u * 8, u * 20, u * 6, u * 2).strokeRoundedRect(-u * 10, ph / 2 - u * 8, u * 20, u * 6, u * 2);
  c.add([g, text(scene, -pw / 2 + u * 4, -ph / 2 + u * 3.5, "!  Owl OS", u * 3.6).setOrigin(0, 0.5),
    text(scene, 0, -u * 1, Phaser.Utils.Array.GetRandom(MESSAGES), u * 3.6, { bold: false, wrap: pw * 0.9 }),
    text(scene, 0, ph / 2 - u * 5, "OK", u * 3.4)]);
  c.setScale(0).setAngle(-4);
  sfx.ding();
  scene.tweens.add({ targets: c, scale: 1, duration: 220, ease: "Back.out" });
  scene.tweens.add({ targets: c, angle: 4, duration: 160, yoyo: true, repeat: 5, delay: 300 });
  scene.time.delayedCall(2600, () => { c.destroy(); done(); });
}
