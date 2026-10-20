import type { ProductItem } from "../../data/products";
import type { SampleResult, PixelSample } from "./spin";

export interface FxParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  s: number;
  c: string;
  delay: number;
  rest: boolean;
}

export interface FxState {
  t0: number;
  last: number;
  parts: FxParticle[];
  h: Float32Array;
  cols: number;
  colW: number;
  left: number;
  ground: number;
  inc: number;
  Hp: number;
  product: ProductItem;
  raf: number;
}

export class PowderFxManager {
  private cv: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private fx: FxState | null = null;
  private isTabVisible = true;
  private svgSamplesCache = new Map<string, SampleResult>();

  constructor(canvas: HTMLCanvasElement) {
    this.cv = canvas;
    this.ctx = canvas.getContext("2d");
    this.setupVisibilityListener();
  }

  private setupVisibilityListener() {
    document.addEventListener("visibilitychange", () => {
      this.isTabVisible = !document.hidden;
    });
  }

  public sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.cv.width = window.innerWidth * dpr;
    this.cv.height = window.innerHeight * dpr;
    this.cv.style.width = `${window.innerWidth}px`;
    this.cv.style.height = `${window.innerHeight}px`;
    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  /**
   * Rasterize any SVG fruit symbol to offscreen canvas and sample real pixels
   */
  public async getSvgFruitSamples(fruitId: string): Promise<SampleResult | null> {
    if (this.svgSamplesCache.has(fruitId)) {
      return this.svgSamplesCache.get(fruitId)!;
    }

    try {
      const defsEl = document.getElementById("fruit-svg-defs");
      const defsMarkup = defsEl ? defsEl.innerHTML : "";

      const svgData = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="120" height="144">
          <defs>${defsMarkup}</defs>
          <use href="#f-${fruitId}"/>
        </svg>
      `;

      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      const sampleResult = await new Promise<SampleResult | null>((resolve) => {
        img.onload = () => {
          URL.revokeObjectURL(url);
          const W = 100;
          const H = 120;
          const oc = document.createElement("canvas");
          oc.width = W;
          oc.height = H;
          const o = oc.getContext("2d");
          if (!o) {
            resolve(null);
            return;
          }

          o.drawImage(img, 0, 0, W, H);
          const d = o.getImageData(0, 0, W, H).data;
          const list: PixelSample[] = [];
          let u0 = 1,
            u1 = 0,
            v0 = 1,
            v1 = 0;

          for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
              const k = (y * W + x) * 4;
              if (d[k + 3] < 180) continue; // transparent background
              const u = (x + 0.5) / W;
              const v = (y + 0.5) / H;
              const m = 0.25 + Math.random() * 0.35;
              u0 = Math.min(u0, u);
              u1 = Math.max(u1, u);
              v0 = Math.min(v0, v);
              v1 = Math.max(v1, v);
              list.push({
                u,
                v,
                c: `rgb(${Math.round(d[k] + (248 - d[k]) * m)}, ${Math.round(
                  d[k + 1] + (236 - d[k + 1]) * m
                )}, ${Math.round(d[k + 2] + (170 - d[k + 2]) * m)})`,
              });
            }
          }

          resolve(list.length ? { list, u0, u1, v0, v1 } : null);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(null);
        };
        img.src = url;
      });

      if (sampleResult) {
        this.svgSamplesCache.set(fruitId, sampleResult);
      }
      return sampleResult;
    } catch {
      return null;
    }
  }

  public stop() {
    if (this.fx) {
      cancelAnimationFrame(this.fx.raf);
      this.fx = null;
    }
    if (this.ctx) {
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  public start(
    rect: DOMRect,
    product: ProductItem,
    sample: SampleResult | null
  ): { ground: number; Hp: number; cx: number } {
    this.stop();
    if (!this.ctx) return { ground: rect.bottom, Hp: rect.height * 0.5, cx: rect.left + rect.width / 2 };

    const bx0 = sample ? sample.u0 : 0.1;
    const bx1 = sample ? sample.u1 : 0.9;
    const by0 = sample ? sample.v0 : 0.1;
    const by1 = sample ? sample.v1 : 0.9;

    const bw = (bx1 - bx0) * rect.width;
    const bh = (by1 - by0) * rect.height;
    const cx = rect.left + ((bx0 + bx1) / 2) * rect.width;
    const cy = rect.top + ((by0 + by1) / 2) * rect.height;

    const colW = 3;
    const R = (sample ? bw : rect.width) * 0.62;
    const left = cx - R;
    const cols = Math.ceil((2 * R) / colW);
    const ground = rect.top + by1 * rect.height + 4;
    const Hp = (sample ? bh : rect.height) * 0.5;

    // Cap particles on small screens and mobile devices (Rule 6)
    const isSmallMobile = window.innerWidth < 480;
    const isMobile = window.innerWidth < 768;
    const isLowPower =
      (typeof navigator !== "undefined" &&
        navigator.hardwareConcurrency &&
        navigator.hardwareConcurrency <= 2) ||
      isMobile;
    const N = isSmallMobile ? 350 : isLowPower ? 550 : 1200;

    const inc = (R * Hp) / (N * colW);
    const h = new Float32Array(cols);

    const parts: FxParticle[] = Array.from({ length: N }, () => {
      let x = 0;
      let y = 0;
      let col = product.particles[0];

      if (sample && sample.list.length) {
        const q = sample.list[(Math.random() * sample.list.length) | 0];
        x = rect.left + q.u * rect.width;
        y = rect.top + q.v * rect.height;
        col = q.c;
      } else {
        const a = Math.random() * Math.PI * 2;
        const rr = Math.sqrt(Math.random());
        x = cx + Math.cos(a) * rr * rect.width * 0.38;
        y = cy + Math.sin(a) * rr * rect.height * 0.4;
        col = product.particles[(Math.random() * product.particles.length) | 0];
      }

      const dx = x - cx;
      const dy = y - cy;
      const d = Math.hypot(dx, dy) || 1;
      const speed = 0.4 + Math.random() * 2.2;

      return {
        x,
        y,
        vx: (dx / d) * speed * (0.6 + Math.random()),
        vy: (dy / d) * speed * 0.5 - Math.random() * 1.6,
        s: 1.3 + Math.random() * 2.2,
        c: col,
        delay: ((y - (cy - bh * 0.5)) / (bh || 1)) * 420 + Math.random() * 160,
        rest: false,
      };
    });

    const now = performance.now();
    this.fx = {
      t0: now,
      last: now,
      parts,
      h,
      cols,
      colW,
      left,
      ground,
      inc,
      Hp,
      product,
      raf: 0,
    };

    const loop = (timestamp: number) => {
      if (!this.fx) return;
      if (!this.isTabVisible) {
        this.fx.last = timestamp;
        this.fx.raf = requestAnimationFrame(loop);
        return;
      }

      const k = Math.min(2.5, (timestamp - this.fx.last) / 16.67);
      this.fx.last = timestamp;
      const t = timestamp - this.fx.t0;

      const ctx = this.ctx!;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const q of this.fx.parts) {
        if (q.rest || t < q.delay) continue;
        q.vy += 0.22 * k;
        q.vx *= 0.992;
        q.vy *= 0.995;
        q.x += q.vx * k;
        q.y += q.vy * k;

        let c = Math.floor((q.x - this.fx.left) / this.fx.colW);
        c = Math.max(0, Math.min(this.fx.cols - 1, c));

        if (q.y >= this.fx.ground - this.fx.h[c]) {
          for (let m = 0; m < 12; m++) {
            const l = c > 0 ? this.fx.h[c - 1] : 1e9;
            const rt = c < this.fx.cols - 1 ? this.fx.h[c + 1] : 1e9;
            if (this.fx.h[c] - l > this.fx.colW * 0.9 && l <= rt) c--;
            else if (this.fx.h[c] - rt > this.fx.colW * 0.9) c++;
            else break;
          }
          this.fx.h[c] += this.fx.inc;
          q.rest = true;
        }
      }

      // Smooth heap curve
      const hs = (i: number) =>
        (this.fx!.h[Math.max(0, i - 1)] +
          2 * this.fx!.h[i] +
          this.fx!.h[Math.min(this.fx!.cols - 1, i + 1)]) /
        4;

      ctx.beginPath();
      ctx.moveTo(this.fx.left, this.fx.ground + 2);
      for (let i = 0; i < this.fx.cols; i++) {
        ctx.lineTo(this.fx.left + i * this.fx.colW, this.fx.ground - hs(i));
      }
      ctx.lineTo(this.fx.left + this.fx.cols * this.fx.colW, this.fx.ground + 2);
      ctx.closePath();
      ctx.fillStyle = this.fx.product.powder;
      ctx.fill();

      // Top highlight gradient on pile
      const g = ctx.createLinearGradient(0, this.fx.ground - this.fx.Hp, 0, this.fx.ground);
      g.addColorStop(0, "rgba(255,255,255,0.3)");
      g.addColorStop(1, "rgba(0,0,0,0.28)");
      ctx.fillStyle = g;
      ctx.fill();

      // Flying powder grains
      for (const q of this.fx.parts) {
        if (q.rest || t < q.delay) continue;
        ctx.fillStyle = q.c;
        ctx.fillRect(q.x, q.y, q.s, q.s);
      }

      this.fx.raf = requestAnimationFrame(loop);
    };

    this.fx.raf = requestAnimationFrame(loop);
    return { ground, Hp, cx };
  }
}
