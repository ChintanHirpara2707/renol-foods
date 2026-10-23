import { gsap } from "gsap";
import { products, type ProductItem } from "../../data/products";
import { ProductSpinner } from "./spin";

export type StudioMode = "browse" | "transform" | "detail" | "closing";

export interface CarouselCallbacks {
  onActivateCard: (index: number) => void;
  onThemeChanged?: (index: number, product: ProductItem) => void;
}

export class PowderCarousel {
  private container: HTMLElement;
  private stage: HTMLElement;
  private ring: HTMLElement;
  private cards: HTMLButtonElement[] = [];
  private dots: HTMLButtonElement[] = [];
  private bgMain: HTMLElement[] = [];
  private ghost: HTMLElement | null = null;
  private nameEl: HTMLElement | null = null;
  private subEl: HTMLElement | null = null;
  private hintTxt: HTMLElement | null = null;

  public spinners: Map<number, ProductSpinner> = new Map();
  public st = { pos: 0 };
  public active = 0;
  public mode: StudioMode = "browse";
  private n: number = products.length;

  private isReducedMotion: boolean = false;
  private callbacks: CarouselCallbacks;

  // Gesture tracking
  private drag: {
    x: number;
    y: number;
    p: number;
    moved: boolean;
    lp: number;
    lt: number;
    v: number;
    spin: boolean;
    lx: number;
    ly: number;
    sv: number;
  } | null = null;
  private lastWheelTime = 0;
  private firstTheme = true;

  // Cleanup listeners
  private boundPointerDown!: (e: PointerEvent) => void;
  private boundPointerMove!: (e: PointerEvent) => void;
  private boundPointerUp!: (e: PointerEvent) => void;
  private boundWheel!: (e: WheelEvent) => void;
  private boundKeyDown!: (e: KeyboardEvent) => void;
  private boundResize!: () => void;

  constructor(container: HTMLElement, callbacks: CarouselCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.stage = container.querySelector("#stage") as HTMLElement;
    this.ring = container.querySelector("#ring") as HTMLElement;
    this.ghost = container.querySelector("#ghost");
    this.nameEl = container.querySelector("#name");
    this.subEl = container.querySelector("#sub");
    this.hintTxt = container.querySelector("#hintTxt");

    this.isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Start with Lemon or first product
    const initialLemonIdx = products.findIndex((p) => p.spin || (p.spinFrames && p.spinFrames > 0));
    this.active = initialLemonIdx >= 0 ? initialLemonIdx : 0;
    this.st.pos = this.active;

    this.buildBgs();
    this.buildCards();
    this.buildDots();
    this.setupListeners();
    this.render();
    this.applyTheme();
  }

  private mod(a: number, b: number): number {
    return ((a % b) + b) % b;
  }

  public offset(i: number): number {
    return this.mod(i - this.st.pos + this.n / 2, this.n) - this.n / 2;
  }

  private spacing(): number {
    const firstCard = this.cards[0];
    const cw = firstCard ? firstCard.offsetWidth : 280;
    return cw * (window.innerWidth < 700 ? 0.8 : 0.92);
  }

  private buildBgs() {
    const host = this.container.querySelector("#bgs") as HTMLElement;
    if (!host) return;
    host.innerHTML = "";
    this.bgMain = products.map((p) => {
      const d = document.createElement("div");
      d.className = "bg";
      d.style.setProperty("--glow", p.glow);
      d.style.setProperty("--base", p.base);
      host.appendChild(d);
      return d;
    });
  }

  private buildCards() {
    if (!this.ring) return;
    this.ring.innerHTML = "";
    this.spinners.forEach((sp) => sp.destroy());
    this.spinners.clear();

    this.cards = products.map((p, i) => {
      const c = document.createElement("button");
      c.type = "button";
      c.className = "card";
      c.setAttribute("aria-label", `${p.name} powder`);

      const spinFrames = p.spinFrames || (p.spin ? 36 : 0);
      if (spinFrames > 0) {
        c.innerHTML = `<canvas class="fruit" width="400" height="480" aria-hidden="true"></canvas>`;
        const cv = c.querySelector("canvas.fruit") as HTMLCanvasElement;
        const folder = p.framesFolder || `/frames/${p.slug}/`;
        const spinner = new ProductSpinner(cv, folder, p.id, spinFrames);
        this.spinners.set(i, spinner);
      } else {
        c.innerHTML = `<svg class="fruit" viewBox="0 0 200 240" aria-hidden="true"><use href="#f-${p.id}"/></svg>`;
      }

      c.addEventListener("click", (e) => {
        if (e.detail === 0) {
          this.activateCard(i);
        }
      });

      this.ring.appendChild(c);
      return c;
    });
  }

  private buildDots() {
    const dotsEl = this.container.querySelector("#dots") as HTMLElement;
    if (!dotsEl) return;
    dotsEl.innerHTML = "";
    this.dots = products.map((p, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "dot";
      b.setAttribute("aria-label", `Show ${p.name}`);
      b.addEventListener("click", () => {
        if (this.mode === "browse") {
          this.goTo(this.st.pos + this.offset(i));
        }
      });
      dotsEl.appendChild(b);
      return b;
    });
  }

  public getActiveSpinner(): ProductSpinner | undefined {
    return this.spinners.get(this.active);
  }

  public render() {
    const S = this.spacing();
    this.cards.forEach((c, i) => {
      const o = this.offset(i);
      const a = Math.abs(o);
      const s = Math.max(0.34, 1 - a * 0.24);
      const op =
        a < 1
          ? 1 - a * 0.45
          : a < 2
          ? 0.55 - (a - 1) * 0.33
          : Math.max(0, 0.22 - (a - 2) * 0.22);
      const y = Math.pow(a, 1.6) * 20;

      c.style.transform = `translate(-50%, -50%) translate3d(${o * S}px, ${y}px, 0) rotateY(${
        -o * 16
      }deg) rotate(${o * 5}deg) scale(${s})`;
      c.style.opacity = String(op);
      c.style.zIndex = String(Math.round(100 - a * 10));
      c.style.visibility = a > 3 ? "hidden" : "visible";
      c.tabIndex = a < 0.5 ? 0 : -1;
    });
  }

  public applyTheme() {
    const p = products[this.active];
    if (!p) return;

    this.container.style.setProperty("--accent", p.accent);
    this.container.style.setProperty("--on", "#140a00");
    document.documentElement.style.setProperty("--accent", p.accent);
    document.documentElement.style.setProperty("--glow", p.glow);
    document.documentElement.dataset.activeProduct = p.id;

    this.bgMain.forEach((b, k) => b.classList.toggle("on", k === this.active));
    this.dots.forEach((d, k) => d.classList.toggle("on", k === this.active));

    if (this.ghost) this.ghost.textContent = p.name.toUpperCase();
    if (this.nameEl) this.nameEl.textContent = p.name;
    if (this.subEl) this.subEl.textContent = `${p.cat} powder`;

    const activeSpinner = this.getActiveSpinner();
    if (this.hintTxt) {
      this.hintTxt.textContent = activeSpinner
        ? `Drag the ${p.name.toLowerCase()} to spin it. Click it to turn it into powder`
        : `Click or tap the ${p.name.toLowerCase()} to turn it into powder`;
    }

    if (activeSpinner) {
      setTimeout(() => {
        if (this.mode === "browse" && this.getActiveSpinner() === activeSpinner) {
          activeSpinner.introSpin(this.isReducedMotion);
        }
      }, 800);
    }

    if (!this.firstTheme && !this.isReducedMotion) {
      if (this.nameEl && this.subEl) {
        gsap.fromTo(
          [this.nameEl, this.subEl],
          { yPercent: 40, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.05,
            overwrite: true,
          }
        );
      }
      if (this.ghost) {
        gsap.fromTo(
          this.ghost,
          { opacity: 0, scale: 0.96 },
          { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out", overwrite: true }
        );
      }
    }
    this.firstTheme = false;
    this.callbacks.onThemeChanged?.(this.active, p);
  }

  private sync() {
    const i = this.mod(Math.round(this.st.pos), this.n);
    if (i !== this.active) {
      this.active = i;
      this.applyTheme();
    }
  }

  public goTo(target: number) {
    const duration = this.isReducedMotion ? 0.01 : 0.9;
    gsap.to(this.st, {
      pos: target,
      duration,
      ease: "power3.out",
      overwrite: true,
      onUpdate: () => {
        this.render();
        this.sync();
      },
    });
  }

  public step(d: number) {
    if (this.mode === "browse") {
      this.goTo(Math.round(this.st.pos) + d);
    }
  }

  public activateCard(i: number) {
    if (this.mode !== "browse") return;
    const o = this.offset(i);
    if (Math.abs(o) < 0.5) {
      this.callbacks.onActivateCard(i);
    } else {
      this.goTo(Math.round(this.st.pos + o));
    }
  }

  public getActiveCard(): HTMLButtonElement | undefined {
    return this.cards[this.active];
  }

  public getCards(): HTMLButtonElement[] {
    return this.cards;
  }

  private setupListeners() {
    const prevBtn = this.container.querySelector("#prev");
    const nextBtn = this.container.querySelector("#next");
    if (prevBtn) prevBtn.addEventListener("click", () => this.step(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => this.step(1));

    // Pointer events on stage
    this.boundPointerDown = (e: PointerEvent) => {
      if (this.mode !== "browse" || (e.target as HTMLElement).closest(".ui")) return;
      gsap.killTweensOf(this.st);

      let spin = false;
      const activeSpinner = this.getActiveSpinner();
      if (activeSpinner) {
        gsap.killTweensOf(activeSpinner.sp);
        const activeCard = this.cards[this.active];
        if (activeCard) {
          const rr = activeCard.getBoundingClientRect();
          spin =
            e.clientX >= rr.left &&
            e.clientX <= rr.right &&
            e.clientY >= rr.top &&
            e.clientY <= rr.bottom;
        }
      }

      this.drag = {
        x: e.clientX,
        y: e.clientY,
        p: this.st.pos,
        moved: false,
        lp: this.st.pos,
        lt: performance.now(),
        v: 0,
        spin,
        lx: e.clientX,
        ly: e.clientY,
        sv: 0,
      };
      // Pointer capture deferred to move event so native vertical scroll is preserved
    };

    this.boundPointerMove = (e: PointerEvent) => {
      if (!this.drag) return;

      const activeSpinner = this.getActiveSpinner();
      if (this.drag.spin && activeSpinner) {
        if (Math.hypot(e.clientX - this.drag.x, e.clientY - this.drag.y) > 6) {
          this.drag.moved = true;
          try {
            this.stage.setPointerCapture(e.pointerId);
          } catch {}
        }
        if (!this.drag.moved) return;

        const ddx = e.clientX - this.drag.lx;
        const ddy = e.clientY - this.drag.ly;
        const dd = Math.abs(ddx) >= Math.abs(ddy) ? ddx : ddy;
        const now = performance.now();
        const dt = Math.max(1, now - this.drag.lt);
        const df = dd / 11;

        activeSpinner.sp.f += df;
        this.drag.sv = 0.8 * this.drag.sv + 0.2 * ((df / dt) * 1000);
        this.drag.lx = e.clientX;
        this.drag.ly = e.clientY;
        this.drag.lt = now;
        activeSpinner.draw();
        return;
      }

      const dx = e.clientX - this.drag.x;
      const dy = e.clientY - this.drag.y;
      
      // If predominantly horizontal drag, capture pointer and step carousel
      if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
        if (!this.drag.moved) {
          this.drag.moved = true;
          try {
            this.stage.setPointerCapture(e.pointerId);
          } catch {}
        }
      }
      if (!this.drag.moved) return;

      this.st.pos = this.drag.p - dx / this.spacing();
      const now = performance.now();
      const dt = now - this.drag.lt;
      if (dt > 0) {
        this.drag.v = ((this.st.pos - this.drag.lp) / dt) * 1000;
        this.drag.lp = this.st.pos;
        this.drag.lt = now;
      }
      this.render();
      this.sync();
    };

    this.boundPointerUp = (e: PointerEvent) => {
      if (!this.drag) return;
      const d = this.drag;
      this.drag = null;

      const activeSpinner = this.getActiveSpinner();
      if (d.spin && d.moved && activeSpinner) {
        const extra = Math.max(-14, Math.min(14, d.sv * 0.35));
        const duration = this.isReducedMotion ? 0.01 : 1.1;
        gsap.to(activeSpinner.sp, {
          f: activeSpinner.sp.f + extra,
          duration,
          ease: "power3.out",
          overwrite: true,
          onUpdate: () => activeSpinner?.draw(),
        });
        return;
      }

      if (!d.moved) {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const c = el?.closest?.(".card") as HTMLButtonElement | null;
        if (c) {
          const idx = this.cards.indexOf(c);
          if (idx >= 0) this.activateCard(idx);
        }
        return;
      }

      const target = Math.round(this.st.pos + Math.max(-1.5, Math.min(1.5, d.v * 0.18)));
      this.goTo(target);
    };

    /**
     * CRITICAL USER REQUIREMENT 1:
     * Do NOT hijack the mouse wheel. Normal vertical scroll must scroll the page.
     * Only horizontal-dominant wheel/trackpad gestures step the carousel.
     */
    this.boundWheel = (e: WheelEvent) => {
      if (this.mode !== "browse") return;

      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      if (absX > absY * 1.5 && absX > 15) {
        e.preventDefault();
        const now = performance.now();
        if (now - this.lastWheelTime > 450) {
          this.lastWheelTime = now;
          this.step(e.deltaX > 0 ? 1 : -1);
        }
      }
    };

    this.boundKeyDown = (e: KeyboardEvent) => {
      const dlg = document.getElementById("dlg") as HTMLDialogElement | null;
      if (dlg?.open) return;

      if (this.mode === "browse") {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          this.step(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          this.step(-1);
        } else if (e.key === "Enter" && !(e.target as HTMLElement)?.closest?.("button.arrow")) {
          this.callbacks.onActivateCard(this.active);
        }
      }
    };

    this.boundResize = () => {
      if (this.mode === "browse") {
        this.render();
      }
    };

    this.stage.addEventListener("pointerdown", this.boundPointerDown);
    this.stage.addEventListener("pointermove", this.boundPointerMove);
    this.stage.addEventListener("pointerup", this.boundPointerUp);
    this.stage.addEventListener("pointercancel", this.boundPointerUp);
    this.stage.addEventListener("wheel", this.boundWheel, { passive: false });
    window.addEventListener("keydown", this.boundKeyDown);
    window.addEventListener("resize", this.boundResize);
  }

  public destroy() {
    gsap.killTweensOf(this.st);
    this.spinners.forEach((sp) => sp.destroy());
    this.spinners.clear();

    this.stage.removeEventListener("pointerdown", this.boundPointerDown);
    this.stage.removeEventListener("pointermove", this.boundPointerMove);
    this.stage.removeEventListener("pointerup", this.boundPointerUp);
    this.stage.removeEventListener("pointercancel", this.boundPointerUp);
    this.stage.removeEventListener("wheel", this.boundWheel);
    window.removeEventListener("keydown", this.boundKeyDown);
    window.removeEventListener("resize", this.boundResize);
  }
}
