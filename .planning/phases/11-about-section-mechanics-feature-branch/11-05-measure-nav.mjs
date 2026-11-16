// Layout measurement for the 320px nav fix (plan 11-05). Not imported by app code.
// Env: PLAYWRIGHT_ENTRY (abs path to playwright index.mjs, required), CHROMIUM_PATH (optional),
//      BASE_URL (measure this origin) or OUT_DIR (default "out", served locally on 127.0.0.1).
// Exit: 0 all PASS, 1 any FAIL, 2 PLAYWRIGHT_ENTRY missing.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

if (!process.env.PLAYWRIGHT_ENTRY) {
  console.log("PLAYWRIGHT_ENTRY is not set (absolute path to a playwright index.mjs)");
  process.exit(2);
}
const { chromium } = await import(process.env.PLAYWRIGHT_ENTRY);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".txt": "text/plain",
};

const isFile = (p) => {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
};

const startServer = async (outDir) => {
  const root = path.resolve(outDir);
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/\/+$/, "");
    const base = path.join(root, pathname);
    if (base !== root && !base.startsWith(root + path.sep)) {
      res.writeHead(403).end("forbidden");
      return;
    }
    const file = [base, `${base}.html`, path.join(base, "index.html")].find(isFile);
    if (!file) {
      res.writeHead(404).end("not found");
      return;
    }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
};

let server = null;
let origin = process.env.BASE_URL;
if (!origin) {
  ({ server, origin } = await startServer(process.env.OUT_DIR ?? "out"));
}
origin = origin.replace(/\/+$/, "");

const PROFILE = "/about/team/michael-desloover";
const PAGES = ["/", "/about", PROFILE];
const WIDTHS = [320, 360, 375, 1280];

let failed = false;
const report = (ok, pagePath, width, name, value) => {
  if (!ok) failed = true;
  console.log(`${ok ? "PASS" : "FAIL"} ${pagePath} @${width}px ${name} ${value.toFixed(1)}`);
};

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
try {
  for (const pagePath of PAGES) {
    for (const width of WIDTHS) {
      const page = await browser.newPage({ viewport: { width, height: 700 } });
      await page.goto(origin + pagePath, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const m = await page.evaluate((isProfile) => {
        const h = document.querySelector("header").getBoundingClientRect();
        const out = { height: h.height, bottom: h.bottom, scrollWidth: document.documentElement.scrollWidth };
        if (isProfile) {
          out.crumbTop = document.querySelector('nav[aria-label="Breadcrumb"]').getBoundingClientRect().top;
          out.photoTop = document.querySelector('img[src^="/team/"]').getBoundingClientRect().top;
        }
        return out;
      }, pagePath === PROFILE);
      await page.close();

      report(m.height <= 65.01, pagePath, width, "header-height", m.height);
      report(m.scrollWidth <= width, pagePath, width, "scroll-width", m.scrollWidth);
      if (width === 375 || width === 1280) {
        report(m.height >= 64.5, pagePath, width, "header-height-no-leak", m.height);
      }
      if (pagePath === PROFILE) {
        report(m.crumbTop >= m.bottom, pagePath, width, "breadcrumb-top-vs-header-bottom", m.crumbTop - m.bottom);
        report(m.photoTop <= 112, pagePath, width, "photo-top", m.photoTop);
      }
    }
  }
} finally {
  await browser.close();
  server?.close();
}
process.exit(failed ? 1 : 0);
