/**
 * Powder effect: the fruit crumbles into grains sampled from its own pixels, the grains fall and
 * build a heap (a height map of columns). Ported from the prototype's startFx(). One full-viewport
 * -aligned canvas is created on start and removed on stop.
 */

import { TIER_CONFIG, getTier } from "./quality";

export interface PowderProduct {
  powder: string;
  particles: string[];
}

export interface PowderSamples {
  list: { u: number; v: number; c: string }[];
  u0: number;
  u1: number;
  v0: number;
  v1: number;
}

export interface FxInfo {
  ground: number;
  Hp: number;
  cx: number;
}

/** Grain count follows the quality tier: 1500 HIGH, 900 MID, 500 LOW, 0 STATIC. */
export function grainCount(): number {
  return TIER_CONFIG[getTier()].particles;
}

interface SampleOptions {
  /** Pale powder tone the pixel colours are blended towards. */
  tone?: [number, number, number];
  /** Blend amount: lo + random * span. */
  lo?: number;
  span?: number;
}

/** Downscales a fruit canvas/image to 100x120, keeps opaque pixels and tints them towards powder. */
export function sampleSource(source: CanvasImageSource, options: SampleOptions = {}): PowderSamples | null {
  const { tone = [245, 235, 200], lo = 0.2, span = 0.35 } = options;
  const W = 100;
  const H = 120;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  try {
    ctx.drawImage(source, 0, 0, W, H);
  } catch {
    return null;
  }
  const d = ctx.getImageData(0, 0, W, H).data;
  const list: PowderSamples["list"] = [];
  let u0 = 1;
  let u1 = 0;
  let v0 = 1;
  let v1 = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const k = (y * W + x) * 4;
      if (d[k + 3] < 200) continue;
      const u = (x + 0.5) / W;
      const v = (y + 0.5) / H;
      const m = lo + Math.random() * span;
      u0 = Math.min(u0, u);
      u1 = Math.max(u1, u);
      v0 = Math.min(v0, v);
      v1 = Math.max(v1, v);
      list.push({
        u,
        v,
        c: `rgb(${Math.round(d[k] + (tone[0] - d[k]) * m)},${Math.round(d[k + 1] + (tone[1] - d[k + 1]) * m)},${Math.round(d[k + 2] + (tone[2] - d[k + 2]) * m)})`,
      });
    }
  }
  return list.length ? { list, u0, u1, v0, v1 } : null;
}

interface Grain {
  x: number;
  y: number;
  vx: number;
  vy: number;
  s: number;
  c: string;
  delay: number;
  rest: boolean;
}

interface Run {
  t0: number;
  last: number;
  parts: Grain[];
  h: Float32Array;
  cols: number;
  colW: number;
  left: number;
  ground: number;
  inc: number;
  Hp: number;
  powder: string;
}

export class PowderFx {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private bounds = { left: 0, top: 0, width: 0, height: 0 };
  private raf = 0;
  private run: Run | null = null;

  /**
   * @param r      viewport rect of the fruit
   * @param bounds viewport rect the effect may draw in (the studio); grains outside are clipped
   */
  start(r: DOMRect, p: PowderProduct, smp: PowderSamples | null, bounds: DOMRect): FxInfo {
    this.stop();
    if (grainCount() === 0) return { ground: r.bottom, Hp: r.height * 0.5, cx: r.left + r.width / 2 };
    const left = Math.max(0, bounds.left);
    const top = Math.max(0, bounds.top);
    const width = Math.max(1, Math.min(innerWidth, bounds.right) - left);
    const height = Math.max(1, Math.min(innerHeight, bounds.bottom) - top);
    this.bounds = { left, top, width, height };

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.width = Math.round(width * DPR);
    canvas.height = Math.round(height * DPR);
    canvas.style.cssText = `position:fixed;left:${left}px;top:${top}px;width:${width}px;height:${height}px;z-index:30;pointer-events:none`;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      canvas.remove();
      return { ground: r.bottom, Hp: r.height * 0.5, cx: r.left + r.width / 2 };
    }
    // Draw in viewport coordinates.
    ctx.setTransform(DPR, 0, 0, DPR, -left * DPR, -top * DPR);
    this.canvas = canvas;
    this.ctx = ctx;

    const bx0 = smp ? smp.u0 : 0;
    const bx1 = smp ? smp.u1 : 1;
    const by0 = smp ? smp.v0 : 0;
    const by1 = smp ? smp.v1 : 1;
    const bw = (bx1 - bx0) * r.width;
    const bh = (by1 - by0) * r.height;
    const cx = r.left + ((bx0 + bx1) / 2) * r.width;
    const cy = r.top + ((by0 + by1) / 2) * r.height;
    const colW = 3;
    const R = (smp ? bw : r.width) * 0.62;
    const fxLeft = cx - R;
    const cols = Math.ceil((2 * R) / colW);
    const ground = r.top + by1 * r.height + 4;
    const Hp = (smp ? bh : r.height) * 0.5;
    const N = grainCount();
    const inc = (R * Hp) / (N * colW);
    const h = new Float32Array(cols);

    const parts: Grain[] = Array.from({ length: N }, () => {
      let x: number;
      let y: number;
      let c: string;
      if (smp) {
        const q = smp.list[(Math.random() * smp.list.length) | 0];
        x = r.left + q.u * r.width;
        y = r.top + q.v * r.height;
        c = q.c;
      } else {
        const a = Math.random() * Math.PI * 2;
        const rr = Math.sqrt(Math.random());
        x = cx + Math.cos(a) * rr * r.width * 0.38;
        y = cy + Math.sin(a) * rr * r.height * 0.4;
        c = p.particles[(Math.random() * p.particles.length) | 0];
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
        c,
        delay: ((y - (cy - bh * 0.5)) / bh) * 420 + Math.random() * 160,
        rest: false,
      };
    });

    const now = performance.now();
    this.run = { t0: now, last: now, parts, h, cols, colW, left: fxLeft, ground, inc, Hp, powder: p.powder };
    this.raf = requestAnimationFrame(this.loop);
    return { ground, Hp, cx };
  }

  private loop = (now: number): void => {
    const fx = this.run;
    const ctx = this.ctx;
    if (!fx || !ctx) return;
    const k = Math.min(2.5, (now - fx.last) / 16.67);
    fx.last = now;
    const t = now - fx.t0;
    const b = this.bounds;
    ctx.clearRect(b.left, b.top, b.width, b.height);

    for (const q of fx.parts) {
      if (q.rest || t < q.delay) continue;
      q.vy += 0.22 * k;
      q.vx *= 0.992;
      q.vy *= 0.995;
      q.x += q.vx * k;
      q.y += q.vy * k;
      let c = Math.floor((q.x - fx.left) / fx.colW);
      c = Math.max(0, Math.min(fx.cols - 1, c));
      if (q.y >= fx.ground - fx.h[c]) {
        for (let m = 0; m < 12; m++) {
          const l = c > 0 ? fx.h[c - 1] : 1e9;
          const rt = c < fx.cols - 1 ? fx.h[c + 1] : 1e9;
          if (fx.h[c] - l > fx.colW * 0.9 && l <= rt) c--;
          else if (fx.h[c] - rt > fx.colW * 0.9) c++;
          else break;
        }
        fx.h[c] += fx.inc;
        q.rest = true;
      }
    }

    // heap
    const hs = (i: number) => (fx.h[Math.max(0, i - 1)] + 2 * fx.h[i] + fx.h[Math.min(fx.cols - 1, i + 1)]) / 4;
    ctx.beginPath();
    ctx.moveTo(fx.left, fx.ground + 2);
    for (let i = 0; i < fx.cols; i++) ctx.lineTo(fx.left + i * fx.colW, fx.ground - hs(i));
    ctx.lineTo(fx.left + fx.cols * fx.colW, fx.ground + 2);
    ctx.closePath();
    ctx.fillStyle = fx.powder;
    ctx.fill();
    const g = ctx.createLinearGradient(0, fx.ground - fx.Hp, 0, fx.ground);
    g.addColorStop(0, "rgba(255,255,255,.3)");
    g.addColorStop(1, "rgba(0,0,0,.28)");
    ctx.fillStyle = g;
    ctx.fill();

    // flying grains
    for (const q of fx.parts) {
      if (q.rest || t < q.delay) continue;
      ctx.fillStyle = q.c;
      ctx.fillRect(q.x, q.y, q.s, q.s);
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  /** Stops the loop, clears the canvas and removes it. Safe to call repeatedly. */
  stop(): void {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.run = null;
    if (this.canvas && this.ctx) {
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    }
    this.canvas?.remove();
    this.canvas = null;
    this.ctx = null;
  }
}
