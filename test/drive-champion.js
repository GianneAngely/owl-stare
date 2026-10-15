// Driver (--shotq): sit through the whole 45 s boss match calmly and win the ladder.
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const until = async (fn) => { while (!fn()) await sleep(50); };
  const q = (window.shotQueue = []);
  window.fakeFace = {};
  localStorage.setItem("owlstare.v1", JSON.stringify({ th: { blink: 0.5, smile: 0.5, jaw: 0.35, yaw: 25, pitch: 20, yaw0: 0, pitch0: 0 }, beaten: ["hoot", "plume", "twitchy", "boomer", "grandma", "dj", "twins"] }));
  await until(() => window.owl?.scene === "Title"); owl.press("play");
  await until(() => owl.scene === "CameraAsk"); owl.press("camera");
  await until(() => owl.scene === "Ladder"); owl.press("owl-boss"); owl.press("stare");
  await until(() => owl.scene === "Result"); await sleep(400); q.push("champion");
  await sleep(500);
  return JSON.stringify({ result: owl.result, tricks: owl.log.filter((l) => l[1].startsWith("trick")).length, beaten: JSON.parse(localStorage.getItem("owlstare.v1")).beaten.length });
})();
