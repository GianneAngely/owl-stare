// Camera explainer -> browser prompt -> model load. Denied / missing camera lands on a friendly retry screen.
import { OwlSprite } from "../art/owl-sprite.js";
import { D, paper, text, button, enter, note } from "../ui.js";
import { face, startCamera, startTracking } from "../face/source.js";
import { load } from "../store.js";
import { showPreview } from "../preview.js";

const WHY = "Owl Stare watches your face to catch you blinking, smiling or looking away.\n\nYour camera video stays on this device. Nothing is recorded, saved or sent.";
const PROBLEM = {
  denied: ["The owl can't see you", "Owl Stare needs your camera to play. Allow the camera in your browser (look for the camera icon near the address bar), then try again."],
  nocamera: ["No camera found", "Owl Stare needs a camera that faces you. Plug one in or open the game on a phone, then try again."],
  busy: ["Your camera is busy", "Another app is using the camera. Close it, then try again."],
  unsupported: ["Camera not available here", "This browser can't use the camera on this page. Try opening the game in a new tab or in Chrome, Safari or Firefox."],
  nosimd: ["This browser can't run the owl", "Owl Stare needs a newer browser. Try the latest Chrome, Firefox or Safari, or update your phone (iPhone: iOS 16.4 or later)."],
  error: ["Something went wrong", "The camera or the owl brain didn't start. Try again, or reload the page."],
};

export class CameraAsk extends Phaser.Scene {
  constructor() { super("CameraAsk"); }
  create() {
    enter(this);
    paper(this);
    this.owl = new OwlSprite(this, "guide", "talk");   // explaining the camera
    this.head = text(this, 0, 0, "The owl needs to see you", 50);
    this.body = text(this, 0, 0, WHY, 28, { bold: false });
    this.status = text(this, 0, 0, "", 28);
    this.go = button(this, "camera", "Turn on camera", 36, () => this.ask());
    this.layout(this.scale.width, this.scale.height);
  }
  async ask() {
    this.go.setVisible(false);
    this.status.setText("Waiting for your OK…");
    try {
      await startCamera(document.getElementById("me-video"));
      let n = 0;
      const dots = this.time.addEvent({ delay: 400, loop: true, callback: () => this.status.setText(`Waking up the owl${".".repeat(++n % 4)}` +
        (n > 15 ? "\nThe first time takes a little while." : "")) });
      this.status.setText("Waking up the owl");
      await startTracking();
      dots.remove();
    } catch (e) {
      note(`camera error ${e.kind ?? e.message}`);
      return this.scene.start("Denied", { kind: e.kind ?? "error" });
    }
    showPreview(!face.fake);
    this.scene.start(load().th ? "Ladder" : "Calibrate");
  }
  layout(w, h) {
    const u = Math.min(w / 100, h / 100), portrait = h > w * 1.1, oh = portrait ? h * 0.22 : h * 0.3;
    this.owl.place(w / 2, h * (portrait ? 0.17 : 0.2), oh, w * 0.9);
    this.head.setFontSize(Math.round(Math.max(30 * D, u * 6.5))).setWordWrapWidth(w * 0.85).setPosition(w / 2, h * (portrait ? 0.35 : 0.43));
    this.body.setFontSize(Math.round(Math.max(19 * D, u * 4.2))).setWordWrapWidth(Math.min(w * 0.82, 760 * D)).setPosition(w / 2, h * (portrait ? 0.53 : 0.6));
    this.status.setFontSize(Math.round(Math.max(20 * D, u * 3.6))).setPosition(w / 2, h * 0.84);
    this.go.setScale(Math.max(0.9 * D, u / 7)).setPosition(w / 2, h * 0.84);
  }
}

export class Denied extends Phaser.Scene {
  constructor() { super("Denied"); }
  create({ kind }) {
    enter(this);
    paper(this);
    this.kind = kind;
    const [head, body] = PROBLEM[kind] ?? PROBLEM.error;
    this.owl = new OwlSprite(this, "guide", "shock");
    this.head = text(this, 0, 0, head, 50);
    this.body = text(this, 0, 0, body, 28, { bold: false });
    this.retry = button(this, "retry", "Try again", 36, () => this.scene.start("CameraAsk"));
    window.owl.denied = kind;
    this.layout(this.scale.width, this.scale.height);
  }
  layout(w, h) {
    const u = Math.min(w / 100, h / 100), portrait = h > w * 1.1, oh = portrait ? h * 0.24 : h * 0.32;
    this.owl.place(w / 2, h * (portrait ? 0.2 : 0.22), oh, w * 0.9);
    this.head.setFontSize(Math.round(Math.max(30 * D, u * 6.5))).setWordWrapWidth(w * 0.85).setPosition(w / 2, h * (portrait ? 0.42 : 0.47));
    this.body.setFontSize(Math.round(Math.max(19 * D, u * 4.2))).setWordWrapWidth(Math.min(w * 0.82, 760 * D)).setPosition(w / 2, h * (portrait ? 0.58 : 0.63));
    this.retry.setScale(Math.max(0.9 * D, u / 7)).setPosition(w / 2, h * 0.84);
  }
}
