// Promo take for tools/record-steady.mjs (virtual clock, ?fake): one long run through every scene the promo cuts from.
// Logs [ms, name] to window.promoLog at each beat the edit needs; sets window.promoDone at the end.
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const until = async (fn) => { while (!fn()) await sleep(30); };
  const mark = (name) => window.promoLog.push([performance.now(), name]);
  const said = (msg) => owl.log.filter((l) => l[1].startsWith(msg)).length;
  const face = (window.fakeFace = {});
  // every owl open, thresholds known: no calibration in the video
  localStorage.setItem("owlstare.v1", JSON.stringify({ th: { blink: 0.5, smile: 0.5, jaw: 0.35, yaw: 25, pitch: 20, yaw0: 0, pitch0: 0, blinkL: 0.5, blinkR: 0.5 },
    beaten: ["hoot", "plume", "twitchy", "boomer", "grandma", "dj", "twins"], muted: true }));
  document.getElementById("mute").style.display = "none";   // no UI chrome in the video
  owl.quiet = true;   // tricks only when forced, so every shot is planned
  const stare = async (id) => {
    if (owl.scene !== "Ladder") { owl.press("ladder"); await until(() => owl.scene === "Ladder"); }
    owl.press(`owl-${id}`); await sleep(500); owl.press("stare");
    await until(() => owl.scene === "Match"); mark(`countdown ${id}`);
    const n = said("stare"); await until(() => said("stare") > n); mark(`stare ${id}`);
  };
  const blink = async () => { face.blinkL = face.blinkR = 0.95; await sleep(200); face.blinkL = face.blinkR = 0.08; };

  mark("title"); await sleep(2600);
  owl.press("play"); await until(() => owl.scene === "CameraAsk"); mark("explain"); await sleep(2600);
  owl.press("camera"); await until(() => owl.scene === "Ladder"); mark("ladder"); await sleep(1500);

  // 1. the boss stares (hook), then you blink
  await stare("boss"); await sleep(3500); mark("boss blink"); await blink();
  await until(() => owl.scene === "Result"); mark("boss result"); await sleep(1500);

  // 2. Hoot: countdown, feathers, a face, then you win
  await stare("hoot"); await sleep(1200);
  mark("trick feathers"); owl.trick("feathers"); await sleep(2600);
  mark("trick face"); owl.trick("face"); await sleep(1800);
  const w = said("end"); await until(() => said("end") > w); mark("win");
  await until(() => owl.scene === "Result"); mark("win result"); await sleep(3000);

  // 3. Boomer: HOOT! into the megaphone, you blink
  await stare("boomer"); await sleep(900);
  mark("trick hoot"); owl.trick("hoot"); await sleep(1300);
  mark("boomer blink"); await blink();
  await until(() => owl.scene === "Result"); mark("boomer result"); await sleep(800);

  // 4. Plume's joke and DJ's dance, short
  await stare("plume"); await sleep(600); mark("trick joke"); owl.trick("joke"); await sleep(3800); await blink();
  await until(() => owl.scene === "Result"); await sleep(300);
  await stare("dj"); await sleep(600); mark("trick dance"); owl.trick("dance"); await sleep(3300);
  mark("end"); window.promoDone = true;
})();
