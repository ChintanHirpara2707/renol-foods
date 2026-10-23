import { gsap } from "gsap";
import overlayCss from "./overlay.css?raw";
import { CTA } from "../../data/cta";
import { scrollLock } from "../scroll";
import { PowderFx, sampleSource } from "./powder-fx";
import type { FruitRenderer } from "./fruit-gl";
import type { StudioProduct } from "./data";

/**
 * Fruit -> powder -> product detail, and back. Timings follow the prototype:
 * shake 0.43s, dissolve from 0.42s, name swap 1.5-1.7s, circular reveal at 2.5s (1.0s),
 * reverse reveal 0.8s.
 */

const LOCK = "studio-detail";
const SNAPSHOT_ANGLE = 0.55;
const mod = (a: number, b: number) => ((a % b) + b) % b;
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "LINK", "TEMPLATE", "NOSCRIPT"]);

export type DetailMode = "browse" | "transform" | "detail" | "closing";

export interface DetailHost {
  root: HTMLElement;
  stage: HTMLElement;
  data: StudioProduct[];
  cards: HTMLElement[];
  /** Elements faded out while the fruit turns to powder (arrows, dots, hint...). */
  hud: HTMLElement[];
  nameEl: HTMLElement;
  subEl: HTMLElement;
  renderer: FruitRenderer | null;
  glOK: () => boolean;
  reducedMotion: boolean;
  /** The fruit element (canvas or poster image) of card i. */
  fruit: (i: number) => HTMLElement | null;
  /** Stop the card's idle spin on a whole frame and redraw it. */
  freeze: (i: number) => void;
  /** Re-render the carousel after the detail closes (position, theme, active fruit). */
  restore: () => void;
  /** Make i the carousel's active product (used when paging inside the detail). */
  select: (i: number) => void;
  active: () => number;
}

export interface ProductDetail {
  readonly mode: DetailMode;
  open(i: number): void;
  requestClose(): void;
  destroy(): void;
}

const POUCH = `
<svg class="sd-pouch" viewBox="0 0 240 340" role="img" aria-label="Powder pouch">
  <path class="sd-pbody" d="M28 34 H212 L220 318 Q220 332 206 332 H34 Q20 332 20 318Z" />
  <path d="M28 34 H92 L84 332 H34 Q20 332 20 318Z" fill="#fff" fill-opacity=".1" />
  <rect class="sd-pcrimp" x="28" y="14" width="184" height="32" rx="4" />
  <path d="M34 22 H206 M34 30 H206 M34 38 H206" stroke="#000" stroke-opacity=".2" />
  <text x="120" y="70" text-anchor="middle" font-size="12" font-weight="600" fill="#fff" fill-opacity=".9" style="font-family:var(--body);letter-spacing:.06em">Renol Foods</text>
  <rect x="44" y="86" width="152" height="204" rx="12" fill="#fff" fill-opacity=".95" />
  <image class="sd-pouch-fruit" x="70" y="100" width="100" height="120" preserveAspectRatio="xMidYMid meet" />
  <text class="sd-pouch-name" x="120" y="248" text-anchor="middle" font-size="24" font-weight="800" fill="#17120b" style="font-family:var(--display);letter-spacing:-.02em"></text>
  <text class="sd-pouch-sub" x="120" y="268" text-anchor="middle" font-size="12" fill="#17120b" fill-opacity=".65" style="font-family:var(--body)"></text>
</svg>`;

const MOUND = `
<svg class="sd-mound" viewBox="0 0 420 130" aria-hidden="true">
  <path class="m" d="M4 128 C70 118 118 84 168 50 C190 36 230 36 252 50 C302 84 350 118 416 128Z" />
  <path d="M150 62 C180 42 240 42 270 62 C240 54 180 54 150 62Z" fill="#fff" fill-opacity=".28" />
  <g fill="#000" fill-opacity=".12">
    <circle cx="110" cy="108" r="2" /><circle cx="150" cy="96" r="1.6" /><circle cx="210" cy="72" r="1.6" />
    <circle cx="262" cy="92" r="2" /><circle cx="318" cy="110" r="1.8" /><circle cx="186" cy="110" r="1.6" />
    <circle cx="236" cy="108" r="1.8" />
  </g>
</svg>`;

const TEMPLATE = `
<div class="sd-bgs" aria-hidden="true"></div>
<div class="sd-top"><button type="button" class="sd-pill sd-back">&larr; All powders</button></div>
<div class="sd-wrap">
  <div class="sd-vis sd-swap">
    <div class="sd-pwrap">${POUCH}<img class="sd-big" alt="" width="400" height="480" decoding="async" />${MOUND}</div>
  </div>
  <div class="sd-info sd-swap">
    <p class="sd-chip"></p>
    <h2 class="sd-name" id="sd-title"></h2>
    <p class="sd-blurb"></p>
    <section class="sd-uses" hidden><h3>Where it is used</h3><ul class="sd-tags"></ul></section>
    <section><h3>Specifications</h3><dl class="sd-specs" hidden></dl><p class="sd-note sd-specs-empty">Full specifications on request</p></section>
    <div class="sd-cta">
      <a class="sd-btn sd-request" data-cta="closing"></a>
      <a class="sd-btn sd-ghost" href="/contact">Contact</a>
    </div>
    <div class="sd-pn"><button type="button" class="sd-prev"></button><button type="button" class="sd-next"></button></div>
  </div>
</div>`;

export function createProductDetail(host: DetailHost): ProductDetail {
  const { data, cards, stage, reducedMotion: RM } = host;
  const n = data.length;
  const T = (s: number) => (RM ? 0.01 : s);
  const controller = new AbortController();
  const { signal } = controller;

  /* ---------- overlay DOM ---------- */
  const style = document.createElement("style");
  style.textContent = overlayCss;
  document.head.appendChild(style);

  const ov = document.createElement("div");
  ov.className = "sd";
  ov.id = "studio-detail";
  ov.setAttribute("role", "dialog");
  ov.setAttribute("aria-modal", "true");
  ov.setAttribute("aria-labelledby", "sd-title");
  ov.setAttribute("data-lenis-prevent", "");
  ov.inert = true;
  ov.innerHTML = TEMPLATE;
  document.body.appendChild(ov);

  const q = <T extends Element>(selector: string) => ov.querySelector<T>(selector)!;
  const bgsEl = q<HTMLElement>(".sd-bgs");
  const bgs = data.map((p) => {
    const d = document.createElement("div");
    d.className = "sd-bg";
    d.style.setProperty("--glow", p.glow);
    d.style.setProperty("--base", p.base);
    bgsEl.appendChild(d);
    return d;
  });
  const backBtn = q<HTMLButtonElement>(".sd-back");
  const request = q<HTMLAnchorElement>(".sd-request");
  request.textContent = CTA.label;

  /* ---------- state ---------- */
  let mode: DetailMode = "browse";
  let timeline: gsap.core.Timeline | null = null;
  const fx = new PowderFx();
  let inerted: HTMLElement[] = [];
  let previousTitle = "";
  let opener: HTMLElement | null = null;

  const productUrl = (i: number) => `/products/${data[i].slug}/`;

  function art(i: number): string {
    const p = data[i];
    if (host.renderer && host.glOK() && p.kind !== null && !p.frames) {
      const url = host.renderer.snapshot(p.kind, SNAPSHOT_ANGLE);
      if (url) return url;
    }
    if (p.poster) return p.poster;
    return p.frames ? `${p.frames.folder}${String(p.frames.idle).padStart(2, "0")}.webp` : "";
  }

  function fill(i: number): void {
    const p = data[i];
    ov.style.setProperty("--accent", p.accent);
    ov.style.setProperty("--on", "#140a00");
    ov.style.setProperty("--pouch", p.pouch);
    ov.style.setProperty("--powder", p.powder);
    bgs.forEach((b, k) => b.classList.toggle("on", k === i));

    q(".sd-name").textContent = p.fullName;
    q(".sd-blurb").textContent = p.blurb;
    q(".sd-chip").textContent = `${p.cat} powder`;

    const uses = q<HTMLElement>(".sd-uses");
    uses.hidden = p.uses.length === 0;
    q<HTMLElement>(".sd-uses ul").replaceChildren(
      ...p.uses.map((u) => Object.assign(document.createElement("li"), { textContent: u })),
    );

    const specs = q<HTMLElement>(".sd-specs");
    specs.hidden = p.specs.length === 0;
    q<HTMLElement>(".sd-specs-empty").hidden = p.specs.length > 0;
    specs.replaceChildren(
      ...p.specs.flatMap((s) => [
        Object.assign(document.createElement("dt"), { textContent: s.label }),
        Object.assign(document.createElement("dd"), { textContent: s.value }),
      ]),
    );

    const image = art(i);
    q(".sd-pouch-fruit").setAttribute("href", image);
    const big = q<HTMLImageElement>(".sd-big");
    if (image) big.src = image;
    else big.removeAttribute("src");
    q(".sd-pouch-name").textContent = p.name;
    q(".sd-pouch-sub").textContent = `${p.cat} powder`;

    request.href = `${CTA.href}?product=${encodeURIComponent(p.slug)}`;
    q<HTMLButtonElement>(".sd-prev").textContent = `← ${data[mod(i - 1, n)].name}`;
    q<HTMLButtonElement>(".sd-next").textContent = `${data[mod(i + 1, n)].name} →`;
  }

  function inertRest(): void {
    inerted = Array.from(document.body.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== ov && !SKIP_TAGS.has(el.tagName) && !el.inert,
    );
    inerted.forEach((el) => (el.inert = true));
  }
  function restoreRest(): void {
    inerted.forEach((el) => (el.inert = false));
    inerted = [];
  }

  function setUrl(i: number, push: boolean): void {
    try {
      const state = { psStudio: data[i].slug };
      if (push) history.pushState(state, "", productUrl(i));
      else history.replaceState(state, "", productUrl(i));
      document.title = `${data[i].fullName} | ${previousTitle.split("|")[0].trim()}`;
    } catch {
      /* history unavailable: the overlay still works */
    }
  }

  /* ---------- fruit -> powder ---------- */
  function open(i: number, instant = false): void {
    if (mode !== "browse") return;
    mode = "transform";
    opener = cards[i];
    scrollLock.lock(LOCK);
    host.freeze(i);

    const fruit = host.fruit(i);
    const r = fruit?.getBoundingClientRect() ?? cards[i].getBoundingClientRect();
    if (instant) {
      reveal(i, { x: innerWidth / 2, y: innerHeight / 2 }, { instant: true, push: false });
      return;
    }

    gsap.to(host.hud, { opacity: 0, duration: 0.3, pointerEvents: "none" });
    gsap.to(cards.filter((_, k) => k !== i), { opacity: 0.1, duration: 0.5 });

    if (RM || !fruit) {
      reveal(i, { x: r.left + r.width / 2, y: r.bottom }, { push: true });
      return;
    }

    const p = data[i];
    const frames = Boolean(p.frames);
    let info: ReturnType<PowderFx["start"]> | undefined;
    timeline = gsap.timeline();
    timeline
      .to(fruit, { rotation: -5, scale: 1.05, duration: 0.09, transformOrigin: "50% 62%" })
      .to(fruit, { rotation: 5, duration: 0.12 })
      .to(fruit, { rotation: -4, duration: 0.12 })
      .to(fruit, { rotation: 0, duration: 0.1 });
    timeline.add(() => {
      const samples = sampleSource(fruit as CanvasImageSource, frames ? { tone: [248, 236, 170], lo: 0.3, span: 0.3 } : {});
      info = fx.start(r, p, samples, host.root.getBoundingClientRect());
    }, 0.42);
    timeline.to(fruit, { scale: 0.82, opacity: 0, filter: "blur(8px)", duration: 0.9, ease: "power2.in" }, 0.42);
    timeline.to([host.nameEl, host.subEl], { opacity: 0, duration: 0.2 }, 1.5);
    timeline.add(() => {
      host.nameEl.textContent = p.fullName;
      host.subEl.textContent = "Ready to use";
    }, 1.7);
    timeline.to([host.nameEl, host.subEl], { opacity: 1, duration: 0.3 }, 1.7);
    timeline.add(() => {
      if (info) reveal(i, { x: info.cx, y: info.ground - info.Hp * 0.5 }, { push: true });
      else reveal(i, { x: r.left + r.width / 2, y: r.bottom }, { push: true });
    }, 2.5);
  }

  /* ---------- circular reveal ---------- */
  function reveal(i: number, o: { x: number; y: number }, opts: { instant?: boolean; push?: boolean }): void {
    mode = "detail";
    previousTitle = previousTitle || document.title;
    fill(i);
    ov.style.display = "block";
    ov.inert = false;
    ov.scrollTop = 0;
    inertRest();
    if (opts.push !== false) setUrl(i, true);
    else setUrl(i, false);

    const done = () => {
      ov.style.clipPath = "none";
      stage.style.visibility = "hidden";
      fx.stop();
      backBtn.focus({ preventScroll: true });
    };
    if (opts.instant) {
      done();
      return;
    }

    const maxR = Math.hypot(Math.max(o.x, innerWidth - o.x), Math.max(o.y, innerHeight - o.y)) + 10;
    gsap.set(ov, { clipPath: `circle(0px at ${o.x}px ${o.y}px)` });
    gsap.to(ov, { clipPath: `circle(${maxR}px at ${o.x}px ${o.y}px)`, duration: T(1.0), ease: "power2.inOut", onComplete: done });
    if (!RM) {
      gsap.from(q(".sd-pwrap"), { y: 90, opacity: 0, rotation: -4, duration: 0.9, delay: 0.45, ease: "power3.out", clearProps: "all" });
      gsap.from(q(".sd-mound"), { scaleX: 0.6, opacity: 0, transformOrigin: "50% 100%", duration: 0.8, delay: 0.5, ease: "power3.out", clearProps: "all" });
      gsap.from(ov.querySelectorAll(".sd-info > *"), { y: 22, opacity: 0, duration: 0.6, delay: 0.55, stagger: 0.05, ease: "power3.out", clearProps: "all" });
    }
  }

  /* ---------- reverse reveal ---------- */
  function closeNow(): void {
    if (mode !== "detail") return;
    mode = "closing";
    timeline?.kill();
    timeline = null;
    fx.stop();
    stage.style.visibility = "visible";
    cards.forEach((c) => {
      const f = c.querySelector<HTMLElement>(".ps-fruit");
      if (f) gsap.set(f, { clearProps: "all" });
    });
    gsap.killTweensOf(cards);
    gsap.set(host.hud, { clearProps: "all" });
    host.restore();

    const active = host.active();
    const card = cards[active].getBoundingClientRect();
    const ox = card.left + card.width / 2;
    const oy = card.top + card.height / 2;
    const maxR = Math.hypot(Math.max(ox, innerWidth - ox), Math.max(oy, innerHeight - oy)) + 10;
    gsap.set(ov, { clipPath: `circle(${maxR}px at ${ox}px ${oy}px)` });
    gsap.to(ov, {
      clipPath: `circle(0px at ${ox}px ${oy}px)`,
      duration: T(0.8),
      ease: "power2.inOut",
      onComplete: finishClose,
    });
    restoreRest();
    if (previousTitle) document.title = previousTitle;
  }

  function finishClose(): void {
    ov.style.display = "none";
    ov.style.clipPath = "";
    ov.inert = true;
    scrollLock.unlock(LOCK);
    mode = "browse";
    (opener ?? cards[host.active()])?.focus({ preventScroll: true });
    previousTitle = "";
  }

  /** Back / Escape: step back through history so the URL returns to the page the user came from. */
  function requestClose(): void {
    if (mode !== "detail") return;
    if (history.state?.psStudio) {
      history.back();
      window.setTimeout(() => {
        if (mode === "detail") closeNow();
      }, 500);
    } else {
      closeNow();
    }
  }

  /* ---------- paging inside the detail ---------- */
  function swap(dir: number): void {
    if (mode !== "detail") return;
    const j = mod(host.active() + dir, n);
    const targets = ov.querySelectorAll(".sd-swap");
    gsap.to(targets, {
      opacity: 0,
      y: 10,
      duration: T(0.22),
      onComplete() {
        host.select(j);
        fill(j);
        ov.scrollTop = 0;
        setUrl(j, false);
        gsap.to(targets, { opacity: 1, y: 0, duration: T(0.35), clearProps: "all" });
      },
    });
  }

  /* ---------- events ---------- */
  backBtn.addEventListener("click", requestClose, { signal });
  q<HTMLButtonElement>(".sd-prev").addEventListener("click", () => swap(-1), { signal });
  q<HTMLButtonElement>(".sd-next").addEventListener("click", () => swap(1), { signal });
  document.addEventListener(
    "keydown",
    (e) => {
      if (mode === "detail" && e.key === "Escape" && !e.defaultPrevented) {
        e.preventDefault();
        requestClose();
      }
    },
    { signal },
  );
  window.addEventListener(
    "popstate",
    (e) => {
      const slug = (e.state as { psStudio?: string } | null)?.psStudio;
      if (slug) {
        const i = data.findIndex((p) => p.slug === slug);
        if (i < 0) return;
        if (mode === "browse") open(i, true);
        else if (mode === "detail" && host.active() !== i) {
          host.select(i);
          fill(i);
          document.title = `${data[i].fullName} | ${previousTitle.split("|")[0].trim()}`;
        }
      } else if (mode === "detail") {
        closeNow();
      }
    },
    { signal },
  );
  window.addEventListener("pagehide", () => destroy(), { signal });
  document.addEventListener("astro:before-swap", () => destroy(), { signal });

  // Returning to this page (back/forward cache) with a studio history entry: show that product.
  const restoreSlug = (history.state as { psStudio?: string } | null)?.psStudio;
  if (restoreSlug) {
    const i = data.findIndex((p) => p.slug === restoreSlug);
    if (i >= 0) {
      host.select(i);
      open(i, true);
    }
  }

  /* ---------- cleanup ---------- */
  let destroyed = false;
  function destroy(): void {
    if (destroyed) return;
    destroyed = true;
    controller.abort();
    timeline?.kill();
    gsap.killTweensOf([ov, host.hud, cards, host.nameEl, host.subEl, ...Array.from(ov.querySelectorAll("*"))]);
    fx.stop();
    restoreRest();
    stage.style.visibility = "";
    scrollLock.unlock(LOCK);
    if (previousTitle) document.title = previousTitle;
    ov.remove();
    style.remove();
    mode = "browse";
  }

  return {
    get mode() {
      return mode;
    },
    open: (i) => open(i),
    requestClose,
    destroy,
  };
}
