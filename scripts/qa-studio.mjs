// Focused checks for the Powder Studio on the built site (npm run build first).
// WebGL render, layout at 3 viewports, wheel/drag/key behaviour, no-WebGL poster fallback, off-screen pause.
import { chromium } from "playwright";
import { startServer } from "./serve-dist.mjs";

const failures = [];
const check = (where, ok, what) => {
  if (!ok) failures.push(`${where}: ${what}`);
};

const { server, url } = await startServer({ port: 4174 });
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });

const active = (page) => page.evaluate(() => document.querySelector("[data-name]").textContent);
const settle = (page) => page.waitForTimeout(2000); // software WebGL (SwiftShader) is slow, so animations run late
// Poll for a product change instead of sleeping: software WebGL can delay the tweens by seconds.
const untilChanged = async (page, from) => {
  for (let i = 0; i < 24 && (await active(page)) === from; i++) await page.waitForTimeout(250);
  await page.waitForTimeout(1500);
};
// Lenis keeps its own target; reset it too or it scrolls back down after an instant scrollTo.
const toTop = (page) => page.evaluate(() => { window.renolLenis?.scrollTo(0, { immediate: true }); scrollTo({ top: 0, behavior: "instant" }); });

async function open(viewport, { noWebGL = false } = {}) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("response", (r) => r.status() >= 400 && errors.push(`HTTP ${r.status()} ${r.url()}`));
  await page.addInitScript(
    ({ noWebGL }) => {
      window.__draws = 0;
      const draw = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = function (...args) {
        window.__draws++;
        return draw.apply(this, args);
      };
      if (noWebGL) {
        const get = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
          return /webgl/i.test(type) ? null : get.call(this, type, ...rest);
        };
      }
    },
    { noWebGL },
  );
  await page.goto(`${url}/`, { waitUntil: "load" });
  await page.waitForSelector(".ps-card");
  await settle(page);
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
    const header = document.querySelector("[data-site-header]").getBoundingClientRect();
    const cardRect = (el) => el.getBoundingClientRect();
    const cards = [...document.querySelectorAll(".ps-card")];
    const current = cards.find((c) => c.getAttribute("aria-current") === "true");
    const name = document.querySelector(".ps-nameblock").getBoundingClientRect();
    const cue = document.querySelector(".ps-cue").getBoundingClientRect();
    const cta = document.querySelector(".ps-cta").getBoundingClientRect();
    const canvases = [...document.querySelectorAll("canvas.ps-fruit")];
    const pixels = (cv) => {
      const d = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height).data;
      let n = 0;
      for (let i = 3; i < d.length; i += 64) if (d[i] > 200) n++;
      return n;
    };
    return {
      cards: cards.length,
      canvases: canvases.length,
      drawn: canvases.filter((cv) => pixels(cv) > 20).length,
      studioBottom: ps.bottom,
      headerBottom: header.bottom,
      barHeight: 0, // no bottom bar any more
      vh: innerHeight,
      activeBottom: current ? cardRect(current).bottom : 0,
      nameTop: name.top,
      nameBottom: name.bottom,
      cueTop: cue.top,
      ctaBottom: cta.bottom,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      touchAction: getComputedStyle(document.querySelector(".ps-stage")).touchAction,
    };
  });
  check(where, info.cards === 7, `expected 7 cards, got ${info.cards}`);
  check(where, info.drawn >= 3, `only ${info.drawn}/${info.canvases} canvases have pixels`);
  check(where, !info.overflow, "horizontal overflow");
  check(where, info.touchAction === "pan-y", `touch-action ${info.touchAction}`);
  const firstScreen = info.studioBottom + info.barHeight;
  check(where, Math.abs(firstScreen - info.vh) < 24 || info.studioBottom > info.vh, `studio + header + bar = ${Math.round(firstScreen)} vs viewport ${info.vh}`);
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

  // horizontal wheel steps, vertical-dominant diagonal does not
  const before = await active(page);
  await page.mouse.wheel(10, 60);
  await page.waitForTimeout(300);
  check(where, (await active(page)) === before, "a mostly-vertical wheel gesture stepped the carousel");
  await page.mouse.wheel(60, 4);
  await untilChanged(page, before);
  const afterWheel = await active(page);
  check(where, afterWheel !== before, "horizontal wheel did not step the carousel");

  // keys and drag
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

  // off-screen pause: scroll the studio away, drawImage calls must stop
  await page.evaluate(() => scrollTo({ top: document.querySelector(".ps").offsetHeight + 400, behavior: "instant" }));
  await page.waitForTimeout(600);
  const d1 = await page.evaluate(() => window.__draws);
  await page.waitForTimeout(700);
  const d2 = await page.evaluate(() => window.__draws);
  check(where, d2 - d1 < 3, `render loop still running off-screen (${d2 - d1} draws in 700ms)`);
  await context.close();
}

// no WebGL: posters, still 7 cards, no errors
{
  const { context, page, errors } = await open({ width: 1366, height: 636 }, { noWebGL: true });
  const info = await page.evaluate(() => ({
    cards: document.querySelectorAll(".ps-card").length,
    posters: [...document.querySelectorAll("img.ps-fruit")].filter((i) => i.complete && i.naturalWidth > 0).length,
  }));
  check("no-webgl", info.cards === 7, `expected 7 cards, got ${info.cards}`);
  check("no-webgl", info.posters >= 7, `only ${info.posters} posters loaded`);
  check("no-webgl", errors.length === 0, `errors: ${errors.slice(0, 3).join(" | ")}`);
  await context.close();
}

await browser.close();
server.close();
console.log(failures.length ? `STUDIO QA FAILED\n- ${failures.join("\n- ")}` : "Studio QA passed.");
process.exit(failures.length ? 1 : 0);
