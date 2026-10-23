import { chromium } from "playwright";
import { startServer } from "./serve-dist.mjs";

const failures = [];
process.on("exit", () => failures.length && console.log("failures so far:\n- " + failures.join("\n- ")));
const check = (where, ok, what) => !ok && failures.push(`${where}: ${what}`);
const { server, url } = await startServer({ port: 4178 });
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });

async function boot(viewport, opts = {}) {
  const context = await browser.newContext({ viewport, reducedMotion: opts.rm ? "reduce" : "no-preference", deviceScaleFactor: opts.dpr ?? 1 });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.addInitScript(({ cores }) => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => cores });
    window.__peak = 0;
    const fill = CanvasRenderingContext2D.prototype.fillRect;
    let n = 0;
    CanvasRenderingContext2D.prototype.fillRect = function (...a) { n++; return fill.apply(this, a); };
    const tick = () => { window.__peak = Math.max(window.__peak, n); n = 0; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, { cores: opts.cores ?? 16 });
  await page.goto(`${url}/`, { waitUntil: "load" });
  await page.waitForSelector(".ps-card");
  await page.waitForTimeout(2500);
  return { context, page, errors };
}

const state = (page) =>
  page.evaluate(() => {
    const ov = document.getElementById("studio-detail");
    return {
      overlay: ov ? getComputedStyle(ov).display : "none",
      overlays: document.querySelectorAll("#studio-detail").length,
      locked: document.documentElement.classList.contains("is-scroll-locked"),
      path: location.pathname,
      title: document.title,
      name: ov?.querySelector(".sd-name")?.textContent,
      pouch: (ov?.querySelector(".sd-pouch-fruit")?.getAttribute("href") ?? "").slice(0, 22),
      big: (ov?.querySelector(".sd-big")?.getAttribute("src") ?? "").slice(0, 22),
      inertCount: [...document.body.children].filter((el) => el.inert && el.id !== "studio-detail").length,
      fxCanvas: [...document.body.querySelectorAll(":scope > canvas")].length,
      stageVisibility: document.querySelector(".ps-stage").style.visibility,
      focusIsCard: document.activeElement?.classList.contains("ps-card") ?? false,
      cards: document.querySelectorAll(".ps-card").length,
      styles: document.querySelectorAll("style").length,
      lenisPrevent: ov?.hasAttribute("data-lenis-prevent"),
      overflowY: ov ? getComputedStyle(ov).overflowY : "",
      scrollable: ov ? ov.scrollHeight > ov.clientHeight : false,
    };
  });
const clickCentre = async (page) => {
  const box = await page.evaluate(() => {
    const r = document.querySelector('.ps-card[aria-current="true"]').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.mouse.click(box.x, box.y);
};
const wait = (page, ms) => page.waitForTimeout(ms);

/* --- desktop, full motion --- */
{
  const w = "1366x636";
  const { context, page, errors } = await boot({ width: 1366, height: 636 }, { dpr: 3 });
  const before = await state(page);
  check(w, before.overlay === "none" && !before.locked && before.cards === 8, "initial state wrong");

  await clickCentre(page);
  await wait(page, 1300);
  let s = await state(page);
  check(w, s.fxCanvas === 1, `powder canvas not present during the effect (${s.fxCanvas})`);
  check(w, s.locked, "scroll not locked during the transform");
  const dpr = await page.evaluate(() => { const c = document.body.querySelector(":scope > canvas"); return c ? c.width / parseFloat(c.style.width) : 0; });
  check(w, dpr > 0 && dpr <= 2.01, `powder canvas DPR ${dpr} exceeds 2`);
  await wait(page, 1200);
  const peak = await page.evaluate(() => window.__peak);
  check(w, peak > 650, `desktop grain count looks low (peak ${peak} fillRect per frame)`);

  await wait(page, 4500);
  s = await state(page);
  check(w, s.overlay === "block" && s.name === "Mango Powder", `detail did not open (${s.overlay}, ${s.name})`);
  check(w, s.path === "/products/mango-powder/", `URL ${s.path}`);
  check(w, s.title.startsWith("Mango Powder"), `title ${s.title}`);
  check(w, s.pouch.startsWith("data:image/png") && s.big.startsWith("data:image/png"), "detail art is not a shader snapshot");
  check(w, s.fxCanvas === 0, "powder canvas left behind after the reveal");
  check(w, s.stageVisibility === "hidden", "stage still visible behind the detail");
  check(w, s.locked && s.lenisPrevent && s.overflowY === "auto", `overlay scroll setup (${s.locked}, ${s.lenisPrevent}, ${s.overflowY})`);
  check(w, s.inertCount >= 2, "page behind the detail is not inert");
  // the overlay itself scrolls
  await page.mouse.move(700, 350);
  await page.mouse.wheel(0, 500);
  await wait(page, 700);
  const top = await page.evaluate(() => document.getElementById("studio-detail").scrollTop);
  check(w, s.scrollable ? top > 50 : true, `overlay did not scroll (scrollTop ${top})`);
  check(w, (await page.evaluate(() => scrollY)) === 0, "page scrolled behind the open detail");

  // page through products, URL follows
  await page.locator(".sd-next").click();
  await wait(page, 900);
  s = await state(page);
  check(w, s.name === "Spinach Powder" && s.path === "/products/spinach-powder/", `swap failed (${s.name}, ${s.path})`);

  // Escape closes, history goes back, everything is released
  await page.keyboard.press("Escape");
  await wait(page, 2200);
  s = await state(page);
  check(w, s.overlay === "none" && s.path === "/" && !s.locked && s.inertCount === 0, `Escape close left state (${s.overlay}, ${s.path}, locked=${s.locked}, inert=${s.inertCount})`);
  check(w, s.focusIsCard, "focus not returned to a card");
  check(w, s.title.startsWith("Renol") || !s.title.startsWith("Spinach"), `title not restored: ${s.title}`);
  await page.mouse.move(683, 300);
  await page.mouse.wheel(0, 420);
  await wait(page, 1100);
  check(w, (await page.evaluate(() => scrollY)) > 100, "page does not scroll after closing the detail");
  await page.evaluate(() => { window.renolLenis?.scrollTo(0, { immediate: true }); scrollTo({ top: 0, behavior: "instant" }); });
  await wait(page, 600);

  // Back button, then browser back/forward
  await clickCentre(page);
  await wait(page, 7000);
  check(w, (await state(page)).overlay === "block", "second open failed");
  await page.locator(".sd-back").click();
  await wait(page, 2200);
  s = await state(page);
  check(w, s.overlay === "none" && s.path === "/" && !s.locked, `Back button close left state (${s.overlay}, ${s.path}, ${s.locked})`);

  await page.goForward();
  await wait(page, 1500);
  s = await state(page);
  check(w, s.overlay === "block" && s.path.startsWith("/products/"), `forward did not reopen (${s.overlay}, ${s.path})`);
  await page.goBack();
  await wait(page, 2200);
  s = await state(page);
  check(w, s.overlay === "none" && s.path === "/" && !s.locked, `popstate close left state (${s.overlay}, ${s.path}, ${s.locked})`);

  // re-init must not double-bind
  await page.evaluate(() => { document.dispatchEvent(new Event("astro:page-load")); });
  await wait(page, 1500);
  s = await state(page);
  check(w, s.cards === 8 && s.overlays === 1, `re-init duplicated DOM (cards ${s.cards}, overlays ${s.overlays})`);
  const stylesAfterReinit = s.styles;
  await clickCentre(page);
  await wait(page, 7000);
  s = await state(page);
  check(w, s.overlay === "block" && s.overlays === 1, "open after re-init failed or duplicated");
  await page.keyboard.press("Escape");
  await wait(page, 2200);
  s = await state(page);
  check(w, s.overlay === "none" && !s.locked && s.inertCount === 0, "close after re-init left state");

  // pagehide releases everything
  await clickCentre(page);
  await wait(page, 7000);
  await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
  s = await state(page);
  check(w, !s.locked && s.inertCount === 0 && s.overlays === 0, `pagehide cleanup incomplete (locked=${s.locked}, inert=${s.inertCount}, overlays=${s.overlays})`);
  check(w, stylesAfterReinit <= before.styles + 1, `style elements piled up (${stylesAfterReinit} vs ${before.styles})`);
  check(w, errors.length === 0, `errors: ${errors.slice(0, 3).join(" | ")}`);
  await context.close();
}

/* --- low-power grain count --- */
{
  const { context, page } = await boot({ width: 1366, height: 636 }, { cores: 2 });
  await clickCentre(page);
  await wait(page, 3800);
  const peak = await page.evaluate(() => window.__peak);
  check("low-power", peak > 100 && peak <= 620, `low-power grain count off (peak ${peak})`);
  await context.close();
}

/* --- mobile, tap, overlay scroll --- */
{
  const w = "390x844";
  const { context, page, errors } = await boot({ width: 390, height: 844 });
  await clickCentre(page);
  await wait(page, 8000);
  let s = await state(page);
  check(w, s.overlay === "block" && s.locked, `mobile detail did not open (${s.overlay}, ${s.locked})`);
  const m = await page.evaluate(() => { const o = document.getElementById("studio-detail"); return { sw: o.scrollWidth, cw: o.clientWidth, sh: o.scrollHeight, ch: o.clientHeight }; });
  check(w, m.sw <= m.cw + 1, `overlay overflows horizontally (${m.sw} > ${m.cw})`);
  check(w, m.sh > m.ch, "overlay has nothing to scroll on mobile");
  await page.keyboard.press("Escape");
  await wait(page, 2200);
  s = await state(page);
  check(w, s.overlay === "none" && !s.locked && s.inertCount === 0, "mobile close left state");
  check(w, errors.length === 0, `errors: ${errors.slice(0, 3).join(" | ")}`);
  await context.close();
}

/* --- reduced motion --- */
{
  const { context, page, errors } = await boot({ width: 1366, height: 636 }, { rm: true });
  await clickCentre(page);
  await wait(page, 1800);
  let s = await state(page);
  check("reduced-motion", s.overlay === "block" && s.fxCanvas === 0, `reduced motion should open straight away (${s.overlay}, canvases ${s.fxCanvas})`);
  await page.keyboard.press("Escape");
  await wait(page, 1200);
  s = await state(page);
  check("reduced-motion", s.overlay === "none" && !s.locked, "reduced-motion close left state");
  check("reduced-motion", errors.length === 0, `errors: ${errors.slice(0, 3).join(" | ")}`);
  await context.close();
}

await browser.close();
server.close();
console.log(failures.length ? `DETAIL CHECK FAILED\n- ${failures.join("\n- ")}` : "Detail check passed.");
