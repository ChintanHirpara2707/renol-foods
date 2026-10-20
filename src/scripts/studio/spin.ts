import { gsap } from "gsap";

export const DEFAULT_FRAME_COUNT = 36;
export const DEFAULT_IDLE_FRAME = 10;

export interface SpinState {
  f: number;
}

export interface PixelSample {
  u: number;
  v: number;
  c: string;
}

export interface SampleResult {
  list: PixelSample[];
  u0: number;
  u1: number;
  v0: number;
  v1: number;
}

export class ProductSpinner {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  public sp: SpinState;
  private frames: HTMLImageElement[] = [];
  private introDone = false;
  private isDestroyed = false;
  public frameCount: number;
  public idleFrame: number;
  public folderPath: string;
  public productId: string;

  constructor(
    canvas: HTMLCanvasElement,
    folderPath: string,
    productId: string,
    frameCount: number = DEFAULT_FRAME_COUNT,
    idleFrame: number = DEFAULT_IDLE_FRAME
  ) {
    this.canvas = canvas;
    this.folderPath = folderPath.endsWith("/") ? folderPath : folderPath + "/";
    this.productId = productId;
    this.frameCount = frameCount;
    this.idleFrame = idleFrame;
    this.sp = { f: idleFrame };
    this.ctx = canvas.getContext("2d");
    this.loadFrames();
  }

  private mod(a: number, b: number): number {
    return ((a % b) + b) % b;
  }

  private loadFrames() {
    // 1. Immediately load idle frame (frame 10 poster fallback)
    const idleImg = new Image();
    idleImg.src = `${this.folderPath}${String(this.idleFrame).padStart(2, "0")}.webp`;
    idleImg.onload = () => {
      if (this.isDestroyed) return;
      this.frames[this.idleFrame] = idleImg;
      this.draw();

      // Update SVG symbol for pouch & detail if matching symbol exists
      const sym = document.getElementById(`${this.productId}Sym`);
      if (sym) sym.setAttribute("href", idleImg.src);
    };

    // 2. Load remaining frames during idle time
    const loadRemaining = () => {
      for (let i = 0; i < this.frameCount; i++) {
        if (i === this.idleFrame) continue;
        const img = new Image();
        img.src = `${this.folderPath}${String(i).padStart(2, "0")}.webp`;
        img.onload = () => {
          if (this.isDestroyed) return;
          this.frames[i] = img;
        };
      }
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadRemaining, { timeout: 1500 });
    } else {
      setTimeout(loadRemaining, 200);
    }
  }

  public draw() {
    if (!this.ctx || this.frames.length === 0 || this.isDestroyed) return;
    const f = this.sp.f;
    const i0 = Math.floor(f);
    const t = f - i0;

    const idxA = this.mod(i0, this.frameCount);
    const idxB = this.mod(i0 + 1, this.frameCount);

    const a = this.frames[idxA] || this.frames[this.idleFrame];
    const b = this.frames[idxB] || this.frames[this.idleFrame];

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (a && a.complete) {
      this.ctx.drawImage(a, 0, 0, this.canvas.width, this.canvas.height);
    }

    if (t > 0.03 && b && b.complete) {
      this.ctx.globalAlpha = t;
      this.ctx.drawImage(b, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalAlpha = 1.0;
    }
  }

  public introSpin(reducedMotion: boolean) {
    if (this.introDone || reducedMotion || this.isDestroyed) return;
    this.introDone = true;
    gsap.to(this.sp, {
      f: `+=${this.frameCount}`,
      duration: 2.8,
      ease: "power2.inOut",
      overwrite: true,
      onUpdate: () => this.draw(),
    });
  }

  public sampleCurrentPixels(): SampleResult | null {
    const activeIdx = this.mod(Math.round(this.sp.f), this.frameCount);
    const im = this.frames[activeIdx] || this.frames[this.idleFrame];
    if (!im || !im.complete) return null;

    const W = 100;
    const H = 120;
    const oc = document.createElement("canvas");
    oc.width = W;
    oc.height = H;
    const o = oc.getContext("2d");
    if (!o) return null;

    o.drawImage(im, 0, 0, W, H);
    const d = o.getImageData(0, 0, W, H).data;
    const list: PixelSample[] = [];
    let u0 = 1,
      u1 = 0,
      v0 = 1,
      v1 = 0;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const k = (y * W + x) * 4;
        if (d[k + 3] < 200) continue; // transparent pixel
        const u = (x + 0.5) / W;
        const v = (y + 0.5) / H;
        const m = 0.3 + Math.random() * 0.3;
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

    return list.length ? { list, u0, u1, v0, v1 } : null;
  }

  public destroy() {
    this.isDestroyed = true;
    gsap.killTweensOf(this.sp);
  }
}

// Backwards compatibility alias
export const LemonSpinner = ProductSpinner;
export const FN = DEFAULT_FRAME_COUNT;
export const IDLE_FRAME = DEFAULT_IDLE_FRAME;
