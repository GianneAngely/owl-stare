// Headless driver for index.html with Chrome's fake camera (tools/fake-cam.sh clip) and the real FaceLandmarker.
// Plays title -> camera -> calibration (retrying when asked) -> a match, which the footage should lose.
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const until = async (fn, ms = 60000) => { const t = Date.now(); while (!fn()) { if (Date.now() - t > ms) throw new Error(`timeout in ${owl.scene}`); await sleep(50); } };
  const q = (window.shotQueue = []);
  let taken = 0;
  const shot = async (name) => { q.push(name); taken++; await until(() => window.shotsTaken === taken); };
  await until(() => owl.scene === "Title"); await sleep(300);
  owl.press("play");
  await until(() => owl.scene === "CameraAsk"); owl.press("camera");
  await until(() => owl.scene === "Calibrate");
  await sleep(500); await shot("r1-calib");
  while (owl.scene === "Calibrate") {   // retries when calibration asks to
    if (owl.buttons.calibrate && !owl.log.at(-1)[1].startsWith("press calibrate")) owl.press("calibrate");
    await sleep(300);
  }
  await until(() => owl.scene === "Ladder"); owl.press("stare");
  await until(() => owl.log.some((l) => l[1] === "stare"));
  await sleep(1500); await shot("r2-match");
  await until(() => owl.log.some((l) => l[1].startsWith("end")));
  await sleep(400); await shot("r3-end");
  await until(() => owl.scene === "Result"); await sleep(400);
  return JSON.stringify({ result: owl.result, calibration: owl.calibration, log: owl.log.map((l) => `${l[0]} ${l[1]}`) });
})();
