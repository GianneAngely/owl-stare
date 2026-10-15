import { Boot } from "./scenes/boot.js";
import { Title } from "./scenes/title.js";
import { CameraAsk, Denied } from "./scenes/camera.js";
import { Calibrate } from "./scenes/calibrate.js";
import { Match } from "./scenes/match.js";
import { Result } from "./scenes/result.js";

import { D } from "./ui.js";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#f7f3e8",
  scale: { mode: Phaser.Scale.NONE, width: innerWidth * D, height: innerHeight * D, zoom: 1 / D },
  scene: [Boot, Title, CameraAsk, Denied, Calibrate, Match, Result],
});
addEventListener("resize", () => game.scale.resize(innerWidth * D, innerHeight * D));
