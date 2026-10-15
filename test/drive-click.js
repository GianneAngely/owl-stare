// Quick driver (--shotq): a real mouse click on a ladder owl, then a boss match lost on purpose.
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const until = async (fn) => { while (!fn()) await sleep(30); };
  const q = (window.shotQueue = []);
  let taken = 0;
  const shot = async (name) => { q.push(name); taken++; await until(() => window.shotsTaken === taken); };
  const face = (window.fakeFace = {});
  localStorage.setItem("owlstare.v1", JSON.stringify({ th: { blink: 0.5, smile: 0.5, jaw: 0.35, yaw: 25, pitch: 20, yaw0: 0, pitch0: 0 }, beaten: ["hoot", "plume", "twitchy", "boomer", "grandma", "dj", "twins"] }));
  await until(() => window.owl?.scene === "Title"); owl.press("play");
  await until(() => owl.scene === "CameraAsk"); owl.press("camera");
  await until(() => owl.scene === "Ladder"); await sleep(300);
  const before = owl.picked, canvas = document.querySelector("canvas"), [cx, cy] = owl.spots.twitchy;
  canvas.dispatchEvent(new MouseEvent("mousedown", { clientX: cx, clientY: cy, bubbles: true }));
  await sleep(60);
  window.dispatchEvent(new MouseEvent("mouseup", { clientX: cx, clientY: cy, bubbles: true }));
  await sleep(200);
  const clicked = owl.picked;
  owl.press("owl-boss"); owl.press("stare");
  await until(() => owl.log.at(-1)[1] === "stare"); await sleep(4000);   // let the boss's own overlapping tricks run
  await shot("c1-boss-live");
  face.blinkL = face.blinkR = 0.9;
  await until(() => owl.scene === "Result"); await sleep(400); await shot("c2-boss-result");
  return JSON.stringify({ before, clicked, tricks: owl.log.filter((l) => l[1].startsWith("trick")).map((l) => l[1]), result: owl.result });
})();
