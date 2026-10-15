// Trick: the owl reads a terrible joke in a speech bubble. Reading it is the trap; the rimshot is the second trap.
import { sfx } from "../audio.js";
import { text, hex, D } from "../ui.js";
import { INK, BELLY } from "../art/owl.js";

const JOKES = [
  "What do you call an owl magician? Hoo-dini.",
  "Owls never go to parties. Too owl-kward.",
  "Why did the owl cross the road? To prove it wasn't chicken.",
  "My favourite subject? Owl-gebra.",
  "What do owls wear to weddings? Hoot couture.",
  "I asked a wise owl for advice. It said: whoooo knows.",
  "Knock knock. Who's there? Owl. Owl who? Owl tell you later.",
  "I stopped blinking in 1987. Nobody noticed.",
  "An owl walks into a bar. It's fine. It saw the bar coming.",
];

export function joke(scene, owl, done) {
  const { width: w, height: h } = scene.scale, u = Math.min(w, h) / 100, dw = owl.displayWidth / 2;
  // beside the owl (its outer side first) when there is room, otherwise under it; the text wraps to fit
  const roomL = owl.x - dw - u * 3, roomR = w - owl.x - dw - u * 3, need = u * 30;
  const order = owl.x < w / 2 ? ["left", "right"] : ["right", "left"];
  const side = order.find((s) => (s === "left" ? roomL : roomR) >= need) ?? "below";
  const room = side === "left" ? roomL : side === "right" ? roomR : w - u * 8;
  const t = text(scene, 0, 0, Phaser.Utils.Array.GetRandom(JOKES), Math.max(20 * D, u * 4.2), { wrap: Math.min(room - u * 6, 420 * D) }).setDepth(8);
  const bw = Math.max(t.width, u * 18) + u * 6, bh = t.height + u * 5, left = side === "left", right = side === "right";
  const bx = left ? owl.x - dw - bw / 2 - u : right ? owl.x + dw + bw / 2 + u : Phaser.Math.Clamp(owl.x, bw / 2 + u, w - bw / 2 - u);
  const by = left || right ? owl.y - owl.displayHeight * 0.2 : Math.min(owl.y + owl.displayHeight * 0.5 + bh / 2 + u, h - bh / 2 - u);
  const tail = left ? [bx + bw / 2 - u, by, bx + bw / 2 + u * 4, by + u * 3] : right ? [bx - bw / 2 + u, by, bx - bw / 2 - u * 4, by + u * 3] : [bx, by - bh / 2 + u, bx, by - bh / 2 - u * 4];
  const g = scene.add.graphics().setDepth(7).fillStyle(hex(BELLY)).lineStyle(Math.max(3 * D, u * 0.6), hex(INK))
    .fillRoundedRect(bx - bw / 2, by - bh / 2, bw, bh, u * 3).strokeRoundedRect(bx - bw / 2, by - bh / 2, bw, bh, u * 3)
    .fillTriangle(tail[0], tail[1] - u * 2, tail[0], tail[1] + u * 2, tail[2], tail[3]).lineBetween(tail[0], tail[1] + u * 2, tail[2], tail[3]);
  t.setPosition(bx, by);
  const parts = [g, t];
  parts.forEach((p) => p.setScale(0));
  scene.tweens.add({ targets: parts, scale: 1, duration: 220, ease: "Back.out" });
  owl.setFace("idle");
  scene.time.delayedCall(2600, () => { sfx.rimshot(); owl.setFace("laugh"); });
  scene.time.delayedCall(3600, () => { parts.forEach((p) => p.destroy()); owl.setFace(owl.rest); done(); });
}
