// One owl on screen: a Google Flow drawing per pose (assets/owls/<owl>-<pose>.webp, Angel 17 Oct 2026), in a container
// so scenes and tricks can treat it like a sprite (setDisplaySize, scale and angle tweens, setFace).
// The faces the code asks for map to poses; anything else (idle, stare, sweet, ...) is the owl's lineup pose, "rest".
import { byId } from "../owls/index.js";
import { BODY_X } from "./owl-centers.js";

export const POSES = ["rest", "blink", "laugh", "shock", "tongue", "cross", "shout", "talk"];   // talk: the guide only
const pose = (face) => (POSES.includes(face) ? face : "rest");
export const poseKey = (art, face) => `owl-${art}-${pose(face)}`;

export class OwlSprite extends Phaser.GameObjects.Container {
  constructor(scene, id, face) {
    super(scene, 0, 0);
    const data = byId(id);
    this.art = data.art ?? data.id;
    this.rest = "rest";   // the face tricks return to during a match
    // drawn from the feet, so the breathing below stretches upwards and the owl stays on the ground
    this.img = scene.add.image(0, 0, poseKey(this.art, face)).setOrigin(0.5, 1);
    // centre the owl's body, not the image box: wings, tails and props stick out to one side
    this.img.setPosition(-(BODY_X[this.art] ?? 0) * this.img.width, this.img.height / 2);
    this.add(this.img);
    this.setSize(this.img.width + 2 * Math.abs(this.img.x), this.img.height);   // wide enough for the shifted image, so place() still fits it
    scene.add.existing(this);
    scene.tweens.add({ targets: this.img, scaleY: 1.025, scaleX: 0.99, duration: 1300 + Math.random() * 400, yoyo: true, repeat: -1, ease: "Sine.inOut" });
  }
  // where layout put it; tricks return here, which keeps overlapping tricks from drifting the owl
  // maxW: wide drawings (Boomer's megaphone) shrink to fit instead of running off a phone screen
  place(x, y, h, maxW = Infinity) {
    h = Math.min(h, maxW * this.height / this.width);
    this.setDisplaySize(h * this.width / this.height, h).setPosition(x, y); this.home = { x, y, sx: this.scaleX, sy: this.scaleY }; return this;
  }
  setFace(face) {
    const key = poseKey(this.art, face);
    this.img.setTexture(this.scene.textures.exists(key) ? key : poseKey(this.art, "rest"));
    return this;
  }
  // locked owls on the ladder are ink silhouettes
  setSilhouette(on) { on ? this.img.setTintFill(0x2b2622) : this.img.clearTint(); return this; }
}
