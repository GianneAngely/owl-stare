// Headless driver for index.html?fake: plays the whole loop with a scripted face.
// Title -> camera -> calibration (blinks and smiles on cue) -> a calm match (should win) -> rematch, blink at ~3 s (should lose).
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const until = async (fn, ms = 20000) => { const t = Date.now(); while (!fn()) { if (Date.now() - t > ms) throw new Error(`timeout in ${owl.scene}`); await sleep(50); } };
  const face = (window.fakeFace = {});
  const results = [];
  await until(() => owl.scene === "Title");
  await sleep(800);
  owl.press("play");
  await until(() => owl.scene === "CameraAsk");
  await sleep(800);
  owl.press("camera");
  await until(() => owl.scene === "Calibrate");
  await sleep(600);
  owl.press("calibrate");
  await sleep(2300); face.blinkL = face.blinkR = 0.9; await sleep(300); face.blinkL = face.blinkR = 0.08;
  await sleep(900); face.smile = 0.8; await sleep(400); face.smile = 0.03;
  await until(() => owl.scene === "Match");
  await until(() => owl.scene === "Result");
  results.push(owl.result);
  await sleep(1200);
  owl.press("again");
  await until(() => owl.log.at(-1)[1] === "stare");
  await sleep(3000);
  face.blinkL = face.blinkR = 0.85;
  await until(() => owl.scene === "Result");
  face.blinkL = face.blinkR = 0.08;
  results.push(owl.result);
  window.driveDone = { results, calibration: owl.calibration, log: owl.log };
  return "done";
})();
