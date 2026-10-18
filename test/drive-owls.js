// Headless driver for index.html?fake (--shotq): every owl open; for each owl, force each of its tricks and screenshot it
// mid-trick, then lose on purpose and go back to the ladder. Also clicks one owl with real mouse events.
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const until = async (fn, ms = 40000) => { const t = Date.now(); while (!fn()) { if (Date.now() - t > ms) throw new Error(`timeout in ${owl.scene}`); await sleep(30); } };
  const q = (window.shotQueue = []);
  let taken = 0;
  const shot = async (name) => { q.push(name); taken++; await until(() => window.shotsTaken === taken); };
  const face = (window.fakeFace = {});
  const ids = ["hoot", "plume", "twitchy", "boomer", "grandma", "dj", "twins", "boss"];
  localStorage.setItem("owlstare.v1", JSON.stringify({ th: { blink: 0.5, smile: 0.5, jaw: 0.35, yaw: 25, pitch: 20, yaw0: 0, pitch0: 0, blinkL: 0.5, blinkR: 0.5, v: 2 }, beaten: ids.slice(0, 7) }));
  await until(() => window.owl?.scene === "Title"); owl.press("play");
  await until(() => owl.scene === "CameraAsk"); owl.press("camera");
  await until(() => owl.scene === "Ladder"); await sleep(500); await shot("o0-ladder-all");
  // a real click on Twitchy (mouse events on the canvas, like a player)
  const canvas = document.querySelector("canvas"), [cx, cy] = owl.spots.twitchy;
  canvas.dispatchEvent(new MouseEvent("mousedown", { clientX: cx, clientY: cy, bubbles: true }));
  await sleep(60);
  window.dispatchEvent(new MouseEvent("mouseup", { clientX: cx, clientY: cy, bubbles: true }));
  await sleep(200);
  const clicked = owl.picked;
  const tricks = { hoot: ["face", "feathers"], plume: ["joke", "face"], twitchy: ["fly", "feathers", "popup"], boomer: ["hoot", "squeak", "face"],
    grandma: ["knit", "surprise"], dj: ["dance", "face"], twins: ["joke", "hoot", "fly"], boss: ["face", "joke", "popup", "surprise"] };
  const seen = [];
  owl.quiet = true;
  for (const id of ids) {
    if (owl.scene !== "Ladder") { owl.press("ladder"); await until(() => owl.scene === "Ladder"); }
    owl.press(`owl-${id}`); await sleep(300);
    if (id === "boss" || id === "grandma") await shot(`o-${id}-ladder`);
    owl.press("stare");
    await until(() => owl.log.at(-1)[1] === "stare"); await sleep(700); await shot(`o-${id}-stare`);
    for (const t of tricks[id]) {
      owl.trick(t, id === "twins" && t === "hoot" ? 1 : 0);
      await sleep(t === "joke" ? 900 : t === "fly" ? 1500 : t === "dance" ? 650 : 350);
      await shot(`o-${id}-${t}`);
      seen.push(`${id}:${t}`);
      await sleep(3200);
    }
    face.blinkL = face.blinkR = 0.9;
    await until(() => owl.scene === "Result"); face.blinkL = face.blinkR = 0.08;
    if (id === "twins" || id === "boss") { await sleep(400); await shot(`o-${id}-result`); }
  }
  return JSON.stringify({ clicked, seen: seen.length, matches: owl.log.filter((l) => l[1].startsWith("match")).map((l) => l[1]) });
})();
