// One owl on screen: its body, a swappable face and its front props, stacked in a container sized like one image,
// so scenes and tricks can treat it like a sprite (setDisplaySize, scale and angle tweens, setFace).
import { byId } from "../owls/index.js";

export class OwlSprite extends Phaser.GameObjects.Container {
  constructor(scene, id, face) {
    super(scene, 0, 0);
    const data = byId(id);
    this.rest = data.rest ?? "stare";   // the face tricks return to during a match
    this.layers = [scene.add.image(0, 0, `body-${data.id}`), (this.face = scene.add.image(0, 0, `face-${face ?? "idle"}`))];
    if (scene.textures.exists(`front-${data.id}`)) this.layers.push(scene.add.image(0, 0, `front-${data.id}`));
    this.add(this.layers);
    this.setSize(this.face.width, this.face.height);
    scene.add.existing(this);
  }
  // where layout put it; tricks return here, which keeps overlapping tricks from drifting the owl
  place(x, y, h) { this.setDisplaySize(h * this.width / this.height, h).setPosition(x, y); this.home = { x, y, sx: this.scaleX, sy: this.scaleY }; return this; }
  setFace(face) { this.face.setTexture(`face-${face}`); return this; }
  // locked owls on the ladder are ink silhouettes
  setSilhouette(on) { this.layers.forEach((l) => (on ? l.setTintFill(0x2b2622) : l.clearTint())); this.face.setVisible(!on); return this; }
}
