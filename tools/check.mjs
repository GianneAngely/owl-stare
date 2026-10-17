// Real-time headless check over the DevTools protocol, with Chrome's fake camera. Always muted (Angel, 17 Oct: no test may make sound).
// node tools/check.mjs <path?query> <width>x<height> <waitMs> <out.png> [js expression | @file.js] [--cam=clip.y4m] [--deny] [--mobile]
//   [--drive=@script.js]  runs in the page right after load (not awaited), e.g. to press buttons and fake a face over time
//   [--shots=1500:title,4000:calib]  extra screenshots at those ms after load, saved next to out.png as <name>.png
//   [--dpr=N]  device pixel ratio (default 2)
//   [--root=dir]  serve that folder instead of the repo (e.g. the unzipped itch build)
//   [--frame]  run --drive, --shotq and the eval inside the cross-origin iframe (http://127.0.0.1:...) instead of the top page
//   [--shotq]  the page asks for screenshots itself: window.shotQueue.push("name") (polled every 100 ms); window.shotsTaken counts them
// Starts its own static server; the page is http://localhost:<port>/<path>. Prints console errors and the eval result.
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { serve } from "./serve.mjs";

const flags = process.argv.slice(2).filter((a) => a.startsWith("--"));
const [path = "", size = "960x600", wait = "3000", out = "shot.png", exprArg = ""] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const flag = (n) => flags.find((f) => f.startsWith(`--${n}`))?.split("=")[1] ?? flags.some((f) => f === `--${n}`);
const expr = exprArg.startsWith("@") ? readFileSync(exprArg.slice(1), "utf8") : exprArg;
const [width, height] = size.split("x").map(Number);
const server = serve(0, typeof flag("root") === "string" ? flag("root") : undefined);
const httpPort = await new Promise((r) => server.once("listening", () => r(server.address().port)));
const url = `http://localhost:${httpPort}/${path}`;
const port = 9300 + Math.floor(Math.random() * 500);
const cam = flag("cam");
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", "--hide-scrollbars", "--mute-audio", ...(flag("frame") ? ["--disable-site-isolation-trials"] : []), "--autoplay-policy=no-user-gesture-required", "--use-fake-device-for-media-stream",
  ...(flag("deny") ? [] : ["--use-fake-ui-for-media-stream"]), ...(typeof cam === "string" ? [`--use-file-for-fake-video-capture=${resolve(cam)}`] : []),
  `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "owl-"))}`, `--window-size=${width},${height}`, "about:blank",
], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, Math.max(0, ms)));

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
  const contexts = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.method === "Runtime.executionContextCreated") contexts.push(m.params.context);
    if (m.id) { pending.get(m.id)?.(m); pending.delete(m.id); }
    if (m.method === "Runtime.exceptionThrown") console.log("EXCEPTION", m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
    if (m.method === "Runtime.consoleAPICalled" && ["error", "warning", "log"].includes(m.params.type)) console.log(m.params.type.toUpperCase(), m.params.args.map((a) => a.value ?? a.description).join(" "));
    if (m.method === "Log.entryAdded" && m.params.entry.level === "error") console.log("LOG", m.params.entry.text, m.params.entry.url ?? "");
  };
  const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Page.enable");
  if (flag("deny")) await send("Browser.setPermission", { permission: { name: "camera" }, setting: "denied" });
  const mobile = !!flag("mobile");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: Number(flag("dpr")) || 2, mobile });
  if (mobile) await send("Emulation.setTouchEmulationEnabled", { enabled: true });
  await send("Page.navigate", { url });
  const t0 = Date.now();
  await sleep(300);
  // where scripts run: the top page, or the iframe's context once it exists
  let ctx = {};
  if (flag("frame")) {
    for (let i = 0; i < 100 && !ctx.contextId; i++) {
      const c = contexts.find((c) => c.origin.includes("127.0.0.1") && c.auxData?.isDefault);
      if (c) ctx = { contextId: c.id }; else await sleep(100);
    }
    console.log("FRAME", ctx.contextId ? "found" : "not found");
  }
  const drive = flag("drive");
  if (typeof drive === "string") send("Runtime.evaluate", { expression: drive.startsWith("@") ? readFileSync(drive.slice(1), "utf8") : drive, awaitPromise: true, ...ctx })
    .then((r) => console.log("DRIVE", JSON.stringify(r.result.result?.value ?? r.result.exceptionDetails?.exception?.description ?? "")));
  const shots = typeof flag("shots") === "string" ? flag("shots").split(",").map((x) => x.split(":")).sort((a, b) => a[0] - b[0]) : [];
  for (const [ms, name] of shots) {
    await sleep(Number(ms) - (Date.now() - t0));
    const shot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(join(dirname(resolve(out)), `${name}.png`), Buffer.from(shot.result.data, "base64"));
  }
  while (flag("shotq") && Date.now() - t0 < Number(wait)) {
    const r = await send("Runtime.evaluate", { expression: "window.shotQueue?.shift() ?? null", returnByValue: true, ...ctx });
    const name = r.result.result?.value;
    if (!name) { await sleep(100); continue; }
    const shot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(join(dirname(resolve(out)), `${name}.png`), Buffer.from(shot.result.data, "base64"));
    await send("Runtime.evaluate", { expression: "window.shotsTaken = (window.shotsTaken ?? 0) + 1", ...ctx });
  }
  await sleep(Number(wait) - (Date.now() - t0));
  if (expr) {
    const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true, ...ctx });
    console.log("EVAL", JSON.stringify(r.result.result?.value ?? r.result.exceptionDetails?.exception?.description ?? r.result, null, 1));
  }
  const shot = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(out, Buffer.from(shot.result.data, "base64"));
  console.log("saved", out);
  ws.close();
} finally {
  chrome.kill();
  server.close();
}
