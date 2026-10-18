// Quick driver (--shotq): Plume's joke bubble placement, forced twice.
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const until = async (fn) => { while (!fn()) await sleep(30); };
  const q = (window.shotQueue = []);
  let taken = 0;
  const shot = async (name) => { q.push(name); taken++; await until(() => window.shotsTaken === taken); };
  window.fakeFace = {};
  localStorage.setItem("owlstare.v1", JSON.stringify({ th: { blink: 0.5, smile: 0.5, jaw: 0.35, yaw: 25, pitch: 20, yaw0: 0, pitch0: 0, blinkL: 0.5, blinkR: 0.5, v: 2 }, beaten: ["hoot", "plume", "twitchy", "boomer", "grandma", "dj", "twins"] }));
  await until(() => window.owl?.scene === "Title"); owl.press("play");
  await until(() => owl.scene === "CameraAsk"); owl.press("camera");
  await until(() => owl.scene === "Ladder"); owl.quiet = true; await sleep(300); await shot("j0-ladder");
  owl.press("owl-plume"); owl.press("stare");
  await until(() => owl.log.at(-1)[1] === "stare"); await sleep(600);
  owl.trick("joke"); await sleep(900); await shot("j1-plume-joke");
  return "ok";
})();
