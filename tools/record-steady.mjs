// Frame-perfect recorder (after CakeTower/tools/record-steady.mjs): the page runs on a virtual clock that advances
// exactly 1/fps per captured frame, so the video never drops or doubles a frame. Always muted and in ?fake mode:
// no camera, no real face, no sound (Angel, 17 Oct). Sound is rendered later from the event log.
// node tools/record-steady.mjs <width>x<height> <out-dir> <@driver.js> [maxFrames] [fps]
// Pre-rolls on the real clock until the Title screen is up, then runs the driver (it uses setTimeout, so it lives on
// the virtual clock too) and saves f_0000.jpg ... at 2x until the driver sets window.promoDone. window.promoLog
// ([virtual ms, name], ...) is written to <out-dir>/log.json; frame = round(ms / (1000 / fps)).
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { serve } from "./serve.mjs";

const [size = "540x960", outDir = "frames", driver = "", max = "3000", fps = "30"] = process.argv.slice(2);
const [width, height] = size.split("x").map(Number);
const server = serve(0);
const httpPort = await new Promise((r) => server.once("listening", () => r(server.address().port)));
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", "--hide-scrollbars", "--mute-audio", "--autoplay-policy=no-user-gesture-required",
  `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "os-rec-"))}`, `--window-size=${width},${height}`, "about:blank",
], { stdio: "ignore" });
const sleep = (t) => new Promise((r) => setTimeout(r, t));
mkdirSync(outDir, { recursive: true });

// virtual time: rAF callbacks and timers only run when __step() is called (until then the real clock drives loading)
const CLOCK = `(() => {
  let now = performance.now(), raf = [], timers = [], id = 0, virtual = false;
  const realNow = performance.now.bind(performance), realRaf = requestAnimationFrame.bind(window), realSet = setTimeout.bind(window);
  const realSetI = setInterval.bind(window), realClear = clearTimeout.bind(window), realClearI = clearInterval.bind(window);
  performance.now = () => (virtual ? now : realNow());
  window.requestAnimationFrame = (cb) => (virtual ? (raf.push([++id, cb]), id) : realRaf(cb));
  window.setTimeout = (cb, ms = 0, ...a) => (virtual ? (timers.push({ id: ++id, at: now + ms, cb, a }), id) : realSet(cb, ms, ...a));
  window.setInterval = (cb, ms = 0, ...a) => (virtual ? (timers.push({ id: ++id, at: now + ms, cb, a, every: Math.max(1, ms) }), id) : realSetI(cb, ms, ...a));
  window.clearTimeout = window.clearInterval = (i) => { timers = timers.filter((t) => t.id !== i); realClear(i); realClearI(i); };
  window.__virtual = () => { now = realNow(); virtual = true; window.__t0 = now; };
  window.__step = (ms) => {
    const end = now + ms;
    for (;;) {
      const t = timers.filter((t) => t.at <= end).sort((a, b) => a.at - b.at)[0];
      if (!t) break;
      now = Math.max(now, t.at);
      if (t.every) t.at += t.every; else timers = timers.filter((x) => x !== t);
      try { typeof t.cb === "function" ? t.cb(...t.a) : 0; } catch (e) { console.error(e); }
    }
    now = end;
    const q = raf; raf = [];
    for (const [, cb] of q) try { cb(now); } catch (e) { console.error(e); }
  };
})();`;

try {
  let page;
  for (let i = 0; i < 50 && !page; i++) {
    try { page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === "page"); }
    catch { await sleep(200); }
  }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let seq = 0;
  const pending = new Map();
  const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
  const evalv = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true })).result.result?.value;
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id) { pending.get(m.id)?.(m); pending.delete(m.id); }
    if (m.method === "Runtime.exceptionThrown") console.log("EXCEPTION", m.params.exceptionDetails.exception?.description);
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") console.log("ERROR", m.params.args.map((a) => a.value ?? a.description).join(" "));
  };
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 2, mobile: false });
  await send("Page.addScriptToEvaluateOnNewDocument", { source: CLOCK });
  await send("Page.navigate", { url: `http://localhost:${httpPort}/index.html?fake&mute` });
  for (let i = 0; i < 200 && (await evalv("window.owl?.scene")) !== "Title"; i++) await sleep(100);
  await sleep(1500);   // fonts and textures settle on the real clock
  await evalv("__virtual(); window.promoLog = []; 0");
  send("Runtime.evaluate", { expression: readFileSync(driver.replace(/^@/, ""), "utf8") });
  const dt = 1000 / Number(fps);
  let n = 0;
  for (; n < Number(max); n++) {
    await evalv(`__step(${dt})`);
    const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 93 });
    writeFileSync(join(outDir, `f_${String(n).padStart(4, "0")}.jpg`), Buffer.from(shot.result.data, "base64"));
    if (n % 30 === 0 && (await evalv("window.promoDone === true"))) break;
  }
  const log = (await evalv("JSON.stringify(window.promoLog.map(([t, s]) => [Math.round((t - __t0) / " + dt + "), s]))")) ?? "[]";
  writeFileSync(join(outDir, "log.json"), log);
  console.log(`${n} frames at ${fps} fps`, log);
  ws.close();
} finally {
  chrome.kill();
  server.close();
}
