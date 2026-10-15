// Quick driver: straight to a won match's result card (thresholds pre-saved, fake face).
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const until = async (fn) => { while (!fn()) await sleep(50); };
  window.fakeFace = {};
  localStorage.setItem("owlstare.v1", JSON.stringify({ th: { blink: 0.5, smile: 0.5, jaw: 0.35, yaw: 25, pitch: 20, yaw0: 0, pitch0: 0 } }));
  await until(() => owl.scene === "Title"); owl.press("play");
  await until(() => owl.scene === "CameraAsk"); owl.press("camera");
  await until(() => owl.scene === "Result");
  return "result";
})();
