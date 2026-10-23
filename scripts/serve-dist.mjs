// Static server for dist/ that applies the "/*" block of public/_headers, so the strict CSP is
// exercised exactly as on Cloudflare Pages / Netlify. Zero dependencies.
// Usage: node scripts/serve-dist.mjs [port]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function globalHeaders() {
  const file = join(root, "public", "_headers");
  if (!existsSync(file)) return {};
  const headers = {};
  let inGlobal = false;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line.trim()) continue;
    if (!/^\s/.test(line)) {
      inGlobal = line.trim() === "/*";
      continue;
    }
    if (!inGlobal) continue;
    const i = line.indexOf(":");
    headers[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return headers;
}

async function resolveFile(dist, pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, "");
  const target = resolve(dist, clean);
  if (target !== dist && !target.startsWith(dist + sep)) return null;
  const candidates = [target, join(target, "index.html"), `${target}.html`];
  for (const c of candidates) {
    try {
      if ((await stat(c)).isFile()) return c;
    } catch {
      /* try next */
    }
  }
  return null;
}

export function startServer({ port = 4173, dir = join(root, "dist") } = {}) {
  const dist = resolve(dir);
  const security = globalHeaders();
  const server = createServer(async (req, res) => {
    const { pathname } = new URL(req.url ?? "/", "http://localhost");
    let file = await resolveFile(dist, pathname);
    let status = 200;
    if (!file) {
      file = join(dist, "404.html");
      status = 404;
    }
    try {
      const body = await readFile(file);
      res.writeHead(status, { "Content-Type": MIME[extname(file)] ?? "application/octet-stream", ...security });
      res.end(body);
    } catch {
      res.writeHead(500, security);
      res.end("Server error");
    }
  });
  return new Promise((resolveListen) => {
    server.listen(port, "127.0.0.1", () => resolveListen({ server, port, url: `http://127.0.0.1:${port}` }));
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { url } = await startServer({ port: Number(process.argv[2] ?? 4173) });
  console.log(`Serving dist/ with _headers at ${url}`);
}
