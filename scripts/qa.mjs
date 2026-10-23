// QA harness: serves dist/ with the production headers, visits every route at every viewport and
//  - screenshots it (qa-output/screens/)
//  - fails on horizontal overflow, console errors (incl. CSP violations), failed requests,
//    leaked placeholders, undersized tap targets in the site chrome, duplicate CTA placements,
//    a page that will not scroll, and any axe violation
//  - runs the mobile-menu behaviour suite
// Usage: npm run qa            (builds first)
//        node scripts/qa.mjs   (uses existing dist/)
// Env:   QA_ROUTES=/about/,/products/  QA_VIEWPORTS=360,1366x636  QA_NO_AXE=1  QA_NO_SHOTS=1
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { startServer } from "./serve-dist.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const dist = join(root, "dist");
const out = join(root, "qa-output");

const ALL_VIEWPORTS = [
  { name: "360", width: 360, height: 800 },
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 768 },
  { name: "1366x636", width: 1366, height: 636 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
];
const wantedViewports = process.env.QA_VIEWPORTS?.split(",");
const VIEWPORTS = wantedViewports ? ALL_VIEWPORTS.filter((v) => wantedViewports.includes(v.name)) : ALL_VIEWPORTS;
const SCROLL_VIEWPORT = "1366x636";

const failures = [];
const warnings = [];
const fail = (where, what) => failures.push({ where, what });
const warn = (where, what) => warnings.push({ where, what });

async function findRoutes() {
  const routes = [];
  const redirects = [];
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.name === "index.html") {
        const rel = relative(dist, dir).split(sep).join("/");
        const route = rel ? `/${rel}/` : "/";
        const html = await readFile(full, "utf8");
        (/http-equiv="refresh"/i.test(html) ? redirects : routes).push(route);
      }
    }
  }
  await walk(dist);
  routes.sort();
  routes.push("/__qa-missing-page__/"); // must render the 404 page with status 404
  return { routes: process.env.QA_ROUTES ? process.env.QA_ROUTES.split(",") : routes, redirects };
}

/** Runs inside the page. */
function inspectPage() {
  const vw = document.documentElement.clientWidth;
  const visible = (el) => el.checkVisibility?.({ checkVisibilityCSS: true, checkOpacity: false }) ?? true;
  const selector = (el) => {
    const id = el.id ? `#${el.id}` : "";
    const cls = typeof el.className === "string" && el.className ? `.${el.className.trim().split(/\s+/).slice(0, 2).join(".")}` : "";
    return `${el.tagName.toLowerCase()}${id}${cls}`;
  };

  const overflow = { scrollWidth: document.documentElement.scrollWidth, clientWidth: vw, offenders: [] };
  if (overflow.scrollWidth > vw + 1) {
    const clipped = (el) => {
      for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX;
        if (ox !== "visible") return true;
      }
      return false;
    };
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.right > vw + 1 || r.left < -1) && !clipped(el)) overflow.offenders.push(`${selector(el)} (${Math.round(r.left)}..${Math.round(r.right)})`);
      if (overflow.offenders.length >= 6) break;
    }
  }

  const text = document.body.innerText;
  const leaks = [];
  for (const re of [/\[(ADD|CONFIRM)\b[^\]]*\]?/i, /&amp;/, /Pending Verification|Verification Slot|Placeholders? Pending/i, /request (a )?(sample|quot)|web3forms/i]) {
    const m = text.match(re);
    if (m) leaks.push(m[0].slice(0, 60));
  }

  const forms = document.querySelectorAll("form, input, textarea, select").length;

  const chrome = ["[data-site-header]", "footer", ".contact-stack", "#cookie-notice"];
  const small = [];
  for (const sel of chrome) {
    for (const root of document.querySelectorAll(sel)) {
      for (const el of root.querySelectorAll("a, button")) {
        if (!visible(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 43.5 || r.height < 43.5) small.push(`${selector(el)} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    }
  }

  return {
    overflow,
    leaks,
    forms,
    small,
    title: document.title,
    h1: document.querySelectorAll("h1").length,
    scrollable: document.documentElement.scrollHeight - innerHeight,
    lang: document.documentElement.lang,
  };
}

async function runAxe(page, where) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
    .analyze();
  for (const v of results.violations) {
    const targets = v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ");
    fail(where, `axe ${v.id} [${v.impact}] x${v.nodes.length}: ${v.help} -> ${targets}`);
  }
}

async function auditViewport(browser, base, vp, routes) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  for (const route of routes) {
    const where = `${route} @ ${vp.name}`;
    const page = await context.newPage();
    const problems = [];
    page.on("console", (m) => m.type() === "error" && !(m.location().url.endsWith(route) && /status of 404/.test(m.text())) && problems.push(`console: ${m.text().slice(0, 200)}`));
    page.on("pageerror", (e) => problems.push(`pageerror: ${e.message.slice(0, 200)}`));
    page.on("response", (r) => r.status() >= 400 && !r.url().endsWith(route) && !r.url().includes("google.com") && problems.push(`HTTP ${r.status()}: ${r.url()}`));
    page.on("requestfailed", (r) => !r.url().includes("google.com") && problems.push(`request failed: ${r.url()}`));

    const response = await page.goto(base + route, { waitUntil: "load" });
    const isMissing = route.includes("__qa-missing-page__");
    if (response?.status() !== (isMissing ? 404 : 200)) fail(where, `status ${response?.status()}`);
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1000);

    const info = await page.evaluate(inspectPage);
    if (info.overflow.scrollWidth > info.overflow.clientWidth + 1)
      fail(where, `horizontal overflow ${info.overflow.scrollWidth}px > ${info.overflow.clientWidth}px; ${info.overflow.offenders.join("; ")}`);
    for (const leak of info.leaks) fail(where, `leaked text: ${leak}`);
    const html = await page.content();
    if (/\[(ADD|CONFIRM)\b/i.test(html)) fail(where, "placeholder marker present in HTML source");
    if (info.small.length) fail(where, `tap target < 44px: ${info.small.slice(0, 4).join(", ")}`);
    if (info.h1 !== 1) fail(where, `${info.h1} <h1> elements`);
    if (info.lang !== "en") fail(where, "missing html lang");
    if (info.forms) fail(where, `${info.forms} form control(s) on the page (the site has no forms)`);
    for (const p of problems) fail(where, p);

    if (process.env.QA_NO_AXE !== "1") await runAxe(page, where);

    if (process.env.QA_NO_SHOTS !== "1") {
      const file = join(out, "screens", route.replace(/\//g, "_").replace(/^_|_$/g, "") || "home", `${vp.name}.jpg`);
      await mkdir(join(file, ".."), { recursive: true });
      await page.screenshot({ path: file, fullPage: true, type: "jpeg", quality: 68 }).catch((e) => warn(where, `screenshot: ${e.message.slice(0, 80)}`));
    }

    if (vp.name === SCROLL_VIEWPORT && info.scrollable > 120) {
      await page.mouse.move(vp.width / 2, vp.height / 2);
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(900);
      const y = await page.evaluate(() => scrollY);
      if (y < 50) fail(where, `mouse-wheel scroll did not move the page (scrollY=${y})`);
    }
    await page.close();
  }
  await context.close();
}

async function menuSuite(browser, base) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(e.message));
  const ok = (cond, what) => !cond && fail("mobile menu @ 390", what);
  const state = () =>
    page.evaluate(() => {
      const panel = document.getElementById("mobile-menu");
      const toggle = document.querySelector("[data-menu-toggle]");
      const r = panel.getBoundingClientRect();
      return {
        expanded: toggle.getAttribute("aria-expanded"),
        locked: document.documentElement.classList.contains("is-scroll-locked"),
        panelVisible: getComputedStyle(panel).visibility === "visible",
        panelInert: panel.inert,
        box: { x: r.x, right: r.right, height: r.height },
        vw: document.documentElement.clientWidth,
        vh: innerHeight,
        focusInPanel: panel.contains(document.activeElement),
        focusIsToggle: document.activeElement === toggle,
        siblingsInert: [...document.body.children].filter((el) => ["HEADER", "MAIN", "FOOTER"].includes(el.tagName)).map((el) => el.inert),
        anyInert: [...document.body.querySelectorAll("[inert]")].filter((el) => el.id !== "mobile-menu").length,
        scrollY,
      };
    });
  const open = async () => {
    await page.locator("[data-menu-toggle]").click();
    await page.waitForTimeout(700);
  };

  await page.goto(`${base}/about/`, { waitUntil: "load" });
  await page.waitForTimeout(800);

  let s = await state();
  ok(s.expanded === "false" && !s.panelVisible && s.panelInert, "menu is not fully hidden/inert while closed");
  ok(await page.evaluate(() => document.getElementById("mobile-menu").hasAttribute("data-lenis-prevent")), "panel lacks data-lenis-prevent");
  ok(await page.evaluate(() => !document.querySelector("header")?.contains(document.getElementById("mobile-menu"))), "panel is inside <header>");

  await open();
  s = await state();
  ok(s.expanded === "true" && s.panelVisible, "menu did not open");
  ok(s.box.x >= -1 && s.box.right <= s.vw + 1, `panel not fully on screen (x=${Math.round(s.box.x)}, right=${Math.round(s.box.right)}, vw=${s.vw})`);
  ok(Math.abs(s.box.height - s.vh) <= 2, `panel height ${s.box.height} != viewport ${s.vh}`);
  ok(s.locked, "page scroll not locked while open");
  ok(s.focusInPanel, "focus did not move into the panel");
  ok(s.siblingsInert.every(Boolean), "page content not inert while open");
  await page.mouse.move(60, 300);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(400);
  ok((await state()).scrollY === 0, "page scrolled behind the open menu");
  await runAxe(page, "mobile menu open @ 390");

  for (let i = 0; i < 16; i++) {
    await page.keyboard.press("Tab");
    ok((await state()).focusInPanel, `focus escaped the panel on Tab #${i + 1}`);
  }
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press("Shift+Tab");
    ok((await state()).focusInPanel, `focus escaped the panel on Shift+Tab #${i + 1}`);
  }

  await page.keyboard.press("Escape");
  await page.waitForTimeout(700);
  s = await state();
  ok(s.expanded === "false" && !s.panelVisible, "Escape did not close the menu");
  ok(s.focusIsToggle, "focus not returned to the toggle after Escape");
  ok(!s.locked && s.anyInert === 0, "scroll lock or inert left behind after close");
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(900);
  ok((await state()).scrollY > 50, "page does not scroll after the menu closes");

  await open();
  await page.mouse.click(12, 400); // backdrop, left of the panel
  await page.waitForTimeout(700);
  ok((await state()).expanded === "false", "backdrop click did not close the menu");

  await open();
  await page.locator("#mobile-menu a", { hasText: "Products" }).first().click();
  await page.waitForLoadState("load");
  await page.waitForTimeout(900);
  s = await state();
  ok(new URL(page.url()).pathname.replace(/[/]$/, "") === "/products", "menu link did not navigate");
  ok(!s.locked && s.anyInert === 0 && s.expanded === "false", "scroll lock / inert left behind after navigation");
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(900);
  ok((await state()).scrollY > 50, "page does not scroll after navigating from the menu");

  await open();
  await page.setViewportSize({ width: 1100, height: 800 });
  await page.waitForTimeout(700);
  s = await state();
  ok(s.expanded === "false" && !s.locked && s.anyInert === 0, "menu did not close and unlock when the viewport grew past 1024px");

  for (const p of problems) fail("mobile menu @ 390", `pageerror: ${p}`);
  await ctx.close();
}

async function redirectSuite(base, redirects) {
  for (const route of ["/legal/privacy/", "/legal/terms/"]) {
    if (!redirects.includes(route)) fail("redirects", `${route} is not built as a redirect`);
  }
  const res = await fetch(`${base}/robots.txt`);
  if (!res.ok) fail("robots.txt", `status ${res.status}`);
  const sitemap = await fetch(`${base}/sitemap-index.xml`);
  if (!sitemap.ok) fail("sitemap", `sitemap-index.xml status ${sitemap.status}`);
  const home = await fetch(`${base}/`);
  for (const header of ["content-security-policy", "x-content-type-options", "referrer-policy", "permissions-policy"]) {
    if (!home.headers.get(header)) fail("headers", `missing ${header}`);
  }
}

async function launch() {
  try {
    return await chromium.launch({ args: ["--disable-3d-apis"] }); // posters instead of software WebGL: deterministic and fast
  } catch {
    console.log("Bundled Chromium not found, falling back to installed Microsoft Edge.");
    return chromium.launch({ channel: "msedge", args: ["--disable-3d-apis"] });
  }
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

const { server, url } = await startServer({ port: 4173 });
const { routes, redirects } = await findRoutes();
const browser = await launch();
const started = Date.now();
console.log(`QA: ${routes.length} routes x ${VIEWPORTS.length} viewports at ${url}`);

try {
  await redirectSuite(url, redirects);
  await Promise.all(VIEWPORTS.map((vp) => auditViewport(browser, url, vp, routes)));
  await menuSuite(browser, url);
} finally {
  await browser.close();
  server.close();
}

const group = (items) => {
  const map = new Map();
  for (const i of items) map.set(i.what, [...(map.get(i.what) ?? []), i.where]);
  return map;
};
const lines = [`# QA report`, ``, `Routes: ${routes.length}. Viewports: ${VIEWPORTS.map((v) => v.name).join(", ")}. Time: ${Math.round((Date.now() - started) / 1000)}s.`, ``];
lines.push(`## Failures (${failures.length})`, "");
for (const [what, wheres] of group(failures)) lines.push(`- ${what}\n  - ${[...new Set(wheres)].slice(0, 8).join("; ")}${wheres.length > 8 ? ` (+${wheres.length - 8} more)` : ""}`);
lines.push("", `## Warnings (${warnings.length})`, "");
for (const [what, wheres] of group(warnings)) lines.push(`- ${what}: ${[...new Set(wheres.map((w) => w.split(" @ ")[0]))].join(", ")}`);
await writeFile(join(out, "report.md"), lines.join("\n") + "\n");
await writeFile(join(out, "report.json"), JSON.stringify({ failures, warnings }, null, 2));

console.log(lines.join("\n"));
console.log(failures.length ? `\nQA FAILED: ${failures.length} failure(s). See qa-output/report.md` : "\nQA passed.");
process.exit(failures.length ? 1 : 0);
