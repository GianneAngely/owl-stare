// Headless driver for index.html?fake (with --shotq): the STARE! moment, a won result card, then a lost one.
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const until = async (fn, ms = 30000) => { const t = Date.now(); while (!fn()) { if (Date.now() - t > ms) throw new Error(`timeout in ${owl.scene}`); await sleep(20); } };
  const q = (window.shotQueue = []);
  let taken = 0;
  const shot = async (name) => { q.push(name); taken++; await until(() => window.shotsTaken === taken); };
  const count = (msg) => owl.log.filter((l) => l[1].startsWith(msg)).length;
  const face = (window.fakeFace = {});
  localStorage.setItem("owlstare.v1", JSON.stringify({ th: { blink: 0.5, smile: 0.5, jaw: 0.35, yaw: 25, pitch: 20, yaw0: 0, pitch0: 0, blinkL: 0.5, blinkR: 0.5, v: 2 } }));
  await until(() => window.owl?.scene === "Title"); owl.press("play");
  await until(() => owl.scene === "CameraAsk"); owl.press("camera");
  await until(() => owl.scene === "Ladder"); owl.press("stare");
  await until(() => count("stare") === 1);
  await sleep(250); await shot("stare");
  await until(() => owl.scene === "Result"); await sleep(500); await shot("result-win");
  owl.press("again");
  await until(() => count("stare") === 2);
  await sleep(1000); face.blinkL = face.blinkR = 0.9;
  await until(() => owl.scene === "Result"); await sleep(500); await shot("result-lose");
  return "ok";
})();
