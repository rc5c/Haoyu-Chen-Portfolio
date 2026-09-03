// Local QA server only. GitHub Pages hosts dist/ directly; this file is not deployed.
import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeBase } from "../src/base-path.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
const base = normalizeBase(process.env.PAGES_BASE_PATH || "/");
const port = Number(process.env.PORT || 4185);
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".mp3": "audio/mpeg", ".wav": "audio/wav", ".mp4": "video/mp4", ".woff2": "font/woff2" };
createServer((request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) { response.writeHead(405).end(); return; }
  const url = new URL(request.url, "http://localhost");
  if (base !== "/" && url.pathname === base.slice(0, -1)) { response.writeHead(301, { Location: base }).end(); return; }
  if (!url.pathname.startsWith(base)) { response.writeHead(404).end(); return; }
  try {
    let file = path.resolve(root, decodeURIComponent(url.pathname.slice(base.length)));
    if (file !== root && !file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    let stat = statSync(file);
    if (stat.isDirectory()) {
      if (!url.pathname.endsWith("/")) { response.writeHead(301, { Location: url.pathname + "/" + url.search }).end(); return; }
      file = path.join(file, "index.html");
      stat = statSync(file);
    }
    if (!stat.isFile()) throw new Error("Not a file");
    const headers = { "Content-Type": mime[path.extname(file)] || "application/octet-stream", "Accept-Ranges": "bytes", "Cache-Control": "no-store" };
    let start = 0, end = stat.size - 1;
    if (request.headers.range) {
      const match = request.headers.range.match(/^bytes=(\d+)-(\d*)$/);
      if (!match || Number(match[1]) >= stat.size || (match[2] && Number(match[2]) < Number(match[1]))) {
        response.writeHead(416, { "Content-Range": `bytes */${stat.size}` }).end(); return;
      }
      start = Number(match[1]);
      if (match[2]) end = Math.min(Number(match[2]), end);
      headers["Content-Range"] = `bytes ${start}-${end}/${stat.size}`;
    }
    headers["Content-Length"] = Math.max(0, end - start + 1);
    response.writeHead(request.headers.range ? 206 : 200, headers);
    if (request.method === "HEAD" || !stat.size) response.end();
    else createReadStream(file, { start, end }).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    if (request.method === "HEAD") response.end();
    else createReadStream(path.join(root, "404.html")).pipe(response);
  }
}).listen(port, "127.0.0.1", () => console.log(`Static production preview: http://localhost:${port}${base}`));
