// Static server for local play and the headless checks (ES modules + wasm need http, not file://).
// node tools/serve.mjs [port] [root]   (tools/check.mjs imports serve() and uses a free port)
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".wasm": "application/wasm",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".task": "application/octet-stream", ".y4m": "application/octet-stream" };

export function serve(port = 0, root = join(import.meta.dirname, "..")) {
  root = resolve(root);
  return createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  const file = join(root, path.endsWith("/") ? path + "index.html" : path);
  if (!file.startsWith(root)) return res.writeHead(403).end();
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream", "cache-control": "no-store" }).end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
  }).listen(port);
}

if (process.argv[1] === import.meta.filename) {
  const s = serve(Number(process.argv[2] ?? 8080), process.argv[3]);
  s.on("listening", () => console.log(`http://localhost:${s.address().port}/`));
}
