// Headless driver for index.html?fake (--shotq): progress from a fresh save.
// Ladder with only Hoot open -> beat Hoot -> "Next" -> lose to Plume -> ladder shows Hoot beaten, Plume open, Twitchy locked.
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const until = async (fn, ms = 40000) => { const t = Date.now(); while (!fn()) { if (Date.now() - t > ms) throw new Error(`timeout in ${owl.scene}`); await sleep(30); } };
  const q = (window.shotQueue = []);
  let taken = 0;
  const shot = async (name) => { q.push(name); taken++; await until(() => window.shotsTaken === taken); };
  const face = (window.fakeFace = {});
  localStorage.setItem("owlstare.v1", JSON.stringify({ th: { blink: 0.5, smile: 0.5, jaw: 0.35, yaw: 25, pitch: 20, yaw0: 0, pitch0: 0, blinkL: 0.5, blinkR: 0.5, v: 2 } }));
  await until(() => window.owl?.scene === "Title"); owl.press("play");
  await until(() => owl.scene === "CameraAsk"); owl.press("camera");
  await until(() => owl.scene === "Ladder"); await sleep(500); await shot("p1-ladder-fresh");
  const lockedClick = (owl.press("owl-twitchy"), owl.picked);   // locked: the pick must stay on Hoot
  owl.press("stare");
  await until(() => owl.scene === "Result"); await sleep(400); await shot("p2-result-hoot");
  owl.press("next");
  await until(() => owl.log.at(-1)[1] === "stare"); await sleep(1500);
  face.smile = 0.9;
  await until(() => owl.scene === "Result"); face.smile = 0.03; await sleep(400); await shot("p3-result-plume");
  owl.press("ladder");
  await until(() => owl.scene === "Ladder"); await sleep(500); await shot("p4-ladder-after");
  return JSON.stringify({ lockedClick, picked: owl.picked, saved: JSON.parse(localStorage.getItem("owlstare.v1")).beaten,
    log: owl.log.map((l) => l[1]).filter((m) => /^(scene|match|end|pick)/.test(m)) });
})();
