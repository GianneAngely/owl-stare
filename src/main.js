import { Boot } from "./scenes/boot.js";
import { Title } from "./scenes/title.js";
import { CameraAsk, Denied } from "./scenes/camera.js";
import { Calibrate } from "./scenes/calibrate.js";
import { Match } from "./scenes/match.js";
import { Result } from "./scenes/result.js";
import { Ladder } from "./scenes/ladder.js";

import { D, refreshD } from "./ui.js";
import { setMuted } from "./audio.js";
import { load, save } from "./store.js";

const mute = document.getElementById("mute");
const showMute = () => (mute.textContent = load().muted ? "🔇" : "🔊");
showMute();
mute.addEventListener("click", () => { const m = !load().muted; save({ muted: m }); setMuted(m); showMute(); });

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#f7f3e8",
  scale: { mode: Phaser.Scale.NONE, width: innerWidth * D, height: innerHeight * D, zoom: 1 / D },
  scene: [Boot, Title, CameraAsk, Denied, Calibrate, Ladder, Match, Result],
});
addEventListener("resize", () => { refreshD(); game.scale.setZoom(1 / D); game.scale.resize(innerWidth * D, innerHeight * D); });
