// Focused checks for the Powder Studio on the built site (npm run build first).
// Fruit photos, layout at 4 viewports, wheel/drag/key behaviour, the crush -> detail -> back flow,
// reduced motion.
import { chromium } from "playwright";
import { startServer } from "./serve-dist.mjs";

const failures = [];
const check = (where, ok, what) => {
  if (!ok) failures.push(`${where}: ${what}`);
};

const { server, url } = await startServer({ port: 4174 });
const browser = await chromium.launch();

const active = (page) => page.evaluate(() => document.querySelector("[data-name]").textContent);
// Lenis keeps its own target; reset it too or it scrolls back down after an instant scrollTo.
const toTop = (page) => page.evaluate(() => { window.renolLenis?.scrollTo(0, { immediate: true }); scrollTo({ top: 0, behavior: "instant" }); });
const untilChanged = async (page, from) => {
  for (let i = 0; i < 24 && (await active(page)) === from; i++) await page.waitForTimeout(250);
  await page.waitForTimeout(1500);
};
const centre = (page) =>
  page.evaluate(() => {
    const r = document.querySelector('.ps-card[aria-current="true"]').getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  });

async function open(viewport, options = {}) {
  const context = await browser.newContext({ viewport, ...options });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("response", (r) => r.status() >= 400 && errors.push(`HTTP ${r.status()} ${r.url()}`));
  await page.goto(`${url}/`, { waitUntil: "load" });
  await page.waitForSelector(".ps-card img");
  await page.waitForFunction(() => [...document.querySelectorAll(".ps-card img")].every((i) => i.complete && i.naturalWidth > 0));
  await page.waitForTimeout(1200);
  return { context, page, errors };
}

for (const vp of [
  { name: "1366x636", width: 1366, height: 636 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "390x844", width: 390, height: 844 },
  { name: "360x640", width: 360, height: 640 },
]) {
  const where = vp.name;
  const { context, page, errors } = await open(vp);

  const info = await page.evaluate(() => {
    const ps = document.querySelector(".ps").getBoundingClientRect();
    const cards = [...document.querySelectorAll(".ps-card")];
    const current = cards.find((c) => c.getAttribute("aria-current") === "true");
    const name = document.querySelector(".ps-nameblock").getBoundingClientRect();
    const cue = document.querySelector(".ps-cue").getBoundingClientRect();
    return {
      cards: cards.length,
      fitted: cards.filter((c) => c.style.getPropertyValue("--fs")).length,
      studioBottom: ps.bottom,
      vh: innerHeight,
      activeBottom: current ? current.getBoundingClientRect().bottom : 0,
      nameTop: name.top,
      nameBottom: name.bottom,
      cueTop: cue.top,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      touchAction: getComputedStyle(document.querySelector(".ps-stage")).touchAction,
      canvases: document.querySelectorAll(".ps-card canvas").length,
    };
  });
  check(where, info.cards === 7, `expected 7 cards, got ${info.cards}`);
  check(where, info.fitted === 7, `only ${info.fitted}/7 fruit photos were size-fitted`);
  check(where, info.canvases === 0, "WebGL canvases are still present");
  check(where, !info.overflow, "horizontal overflow");
  check(where, info.touchAction === "pan-y", `touch-action ${info.touchAction}`);
  check(where, Math.abs(info.studioBottom - info.vh) < 24 || info.studioBottom > info.vh, `studio + header = ${Math.round(info.studioBottom)} vs viewport ${info.vh}`);
  check(where, info.nameTop >= info.activeBottom - 4, `name block (top ${Math.round(info.nameTop)}) overlaps the centre fruit (bottom ${Math.round(info.activeBottom)})`);
  check(where, info.nameBottom <= info.cueTop + 2, `name block overlaps the scroll cue (${Math.round(info.nameBottom)} > ${Math.round(info.cueTop)})`);
  check(where, errors.length === 0, `errors: ${errors.slice(0, 3).join(" | ")}`);

  // vertical wheel over the stage scrolls the page
  await page.mouse.move(vp.width / 2, vp.height / 2 - 40);
  await page.mouse.wheel(0, 420);
  await page.waitForTimeout(1100);
  check(where, (await page.evaluate(() => scrollY)) > 100, "vertical wheel over the studio did not scroll the page");
  await toTop(page);
  await page.waitForTimeout(600);

  // horizontal wheel steps, a mostly-vertical gesture does not
  const before = await active(page);
  await page.mouse.wheel(10, 60);
  await page.waitForTimeout(300);
  check(where, (await active(page)) === before, "a mostly-vertical wheel gesture stepped the carousel");
  await page.mouse.wheel(60, 4);
  await untilChanged(page, before);
  const afterWheel = await active(page);
  check(where, afterWheel !== before, "horizontal wheel did not step the carousel");

  await page.keyboard.press("ArrowRight");
  await untilChanged(page, afterWheel);
  const afterKey = await active(page);
  check(where, afterKey !== afterWheel, "ArrowRight did not step the carousel");

  const y = Math.round(vp.height * 0.25);
  await page.mouse.move(vp.width * 0.8, y);
  await page.mouse.down();
  await page.mouse.move(vp.width * 0.35, y + 4, { steps: 8 });
  await page.mouse.up();
  await untilChanged(page, afterKey);
  check(where, (await active(page)) !== afterKey, "horizontal drag did not move the carousel");
  await context.close();
}

// crush -> detail -> back
{
  const where = "crush flow @ 1366x636";
  const { context, page, errors } = await open({ width: 1366, height: 636 });
  const name = await active(page);
  const [x, yy] = await centre(page);
  await page.mouse.click(x, yy);
  await page.waitForTimeout(1200);
  check(where, await page.evaluate(() => document.body.querySelectorAll(":scope > canvas").length === 1), "no powder canvas during the crush");
  check(where, await page.evaluate(() => document.documentElement.classList.contains("is-scroll-locked")), "scroll not locked during the crush");
  await page.waitForTimeout(3600);
  const s = await page.evaluate(() => {
    const o = document.getElementById("studio-detail");
    return {
      display: o ? getComputedStyle(o).display : "none",
      path: location.pathname,
      pouch: o?.querySelector(".sd-pouch-fruit")?.getAttribute("href") ?? "",
      big: o?.querySelector(".sd-big")?.getAttribute("src") ?? "",
      canvases: document.body.querySelectorAll(":scope > canvas").length,
    };
  });
  check(where, s.display === "block", "detail did not open");
  check(where, /^\/products\/[a-z-]+-powder\/$/.test(s.path), `URL ${s.path}`);
  check(where, s.pouch.startsWith("/images/fruit/") && s.big.startsWith("/images/fruit/"), `detail art is not the fruit photo (${s.pouch})`);
  check(where, s.canvases === 0, "powder canvas left behind");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(2200);
  const after = await page.evaluate(() => ({
    display: getComputedStyle(document.getElementById("studio-detail") ?? document.body).display,
    path: location.pathname,
    locked: document.documentElement.classList.contains("is-scroll-locked"),
    name: document.querySelector("[data-name]").textContent,
  }));
  check(where, after.path === "/" && !after.locked && after.name === name, `close left state (${after.path}, locked=${after.locked}, ${after.name} vs ${name})`);
  check(where, errors.length === 0, `errors: ${errors.slice(0, 3).join(" | ")}`);
  await context.close();
}

// reduced motion: straight to the detail with a fade, no powder
{
  const where = "reduced motion";
  const { context, page, errors } = await open({ width: 1366, height: 636 }, { reducedMotion: "reduce" });
  const [x, yy] = await centre(page);
  await page.mouse.click(x, yy);
  await page.waitForTimeout(1500);
  const s = await page.evaluate(() => ({
    display: getComputedStyle(document.getElementById("studio-detail") ?? document.body).display,
    canvases: document.body.querySelectorAll(":scope > canvas").length,
  }));
  check(where, s.display === "block" && s.canvases === 0, `should open straight away without powder (${s.display}, canvases ${s.canvases})`);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1200);
  check(where, !(await page.evaluate(() => document.documentElement.classList.contains("is-scroll-locked"))), "scroll lock left behind");
  check(where, errors.length === 0, `errors: ${errors.slice(0, 3).join(" | ")}`);
  await context.close();
}

await browser.close();
server.close();
console.log(failures.length ? `STUDIO QA FAILED\n- ${failures.join("\n- ")}` : "Studio QA passed.");
process.exit(failures.length ? 1 : 0);
