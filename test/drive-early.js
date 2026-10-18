// Quick driver: lose 0.3 s after STARE! (smile) and screenshot the verdict.
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const until = async (fn) => { while (!fn()) await sleep(30); };
  const face = (window.fakeFace = {});
  localStorage.setItem("owlstare.v1", JSON.stringify({ th: { blink: 0.5, smile: 0.5, jaw: 0.35, yaw: 25, pitch: 20, yaw0: 0, pitch0: 0, blinkL: 0.5, blinkR: 0.5, v: 2 } }));
  await until(() => owl.scene === "Title"); owl.press("play");
  await until(() => owl.scene === "CameraAsk"); owl.press("camera");
  await until(() => owl.scene === "Ladder"); owl.press("stare");
  await until(() => owl.log.some((l) => l[1] === "stare"));
  await sleep(150); face.smile = 0.9;
  await until(() => owl.log.some((l) => l[1].startsWith("end")));
  await sleep(400);
  window.shotQueue = ["early-verdict"];
  return JSON.stringify(owl.result);
})();
