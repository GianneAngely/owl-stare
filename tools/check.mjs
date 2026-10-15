// Real-time headless check over the DevTools protocol, with Chrome's fake camera.
// node tools/check.mjs <path?query> <width>x<height> <waitMs> <out.png> [js expression | @file.js] [--cam=clip.y4m] [--deny] [--mobile]
// Starts its own static server; the page is http://localhost:<port>/<path>. Prints console errors and the eval result.
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { serve } from "./serve.mjs";

const flags = process.argv.slice(2).filter((a) => a.startsWith("--"));
const [path = "", size = "960x600", wait = "3000", out = "shot.png", exprArg = ""] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const flag = (n) => flags.find((f) => f.startsWith(`--${n}`))?.split("=")[1] ?? flags.some((f) => f === `--${n}`);
const expr = exprArg.startsWith("@") ? readFileSync(exprArg.slice(1), "utf8") : exprArg;
const [width, height] = size.split("x").map(Number);
const server = serve();
const httpPort = await new Promise((r) => server.once("listening", () => r(server.address().port)));
const url = `http://localhost:${httpPort}/${path}`;
const port = 9300 + Math.floor(Math.random() * 500);
const cam = flag("cam");
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", "--hide-scrollbars", "--autoplay-policy=no-user-gesture-required", "--use-fake-device-for-media-stream",
  ...(flag("deny") ? [] : ["--use-fake-ui-for-media-stream"]), ...(typeof cam === "string" ? [`--use-file-for-fake-video-capture=${resolve(cam)}`] : []),
  `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "owl-"))}`, `--window-size=${width},${height}`, "about:blank",
], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
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
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 2, mobile });
  if (mobile) await send("Emulation.setTouchEmulationEnabled", { enabled: true });
  await send("Page.navigate", { url });
  await sleep(Number(wait));
  if (expr) {
    const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
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
