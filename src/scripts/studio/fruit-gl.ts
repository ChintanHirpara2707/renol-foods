import fragmentSource from "./fruit.frag.glsl?raw";
import { TIER_CONFIG, getTier, isAdaptive, startGovernor, stepDown, type Tier } from "./quality";

/**
 * Shared WebGL ray-marching renderer for the studio fruits. One offscreen canvas draws any fruit;
 * the result is copied into the card's own 2D canvas. The quality governor (quality.ts) decides
 * how big the canvas is, how often neighbouring fruits render, and when to fall back to posters.
 */

/** Scene id passed to the shader as uniform K (see fruit.frag.glsl). */
export const GL_KIND: Record<string, number> = { beetroot: 0, apple: 1, pomegranate: 2, blueberry: 3, strawberry: 4, orange: 5, "white-guava": 6 };

const SNAPSHOT_ANGLE = 0.55;
const VERTEX_SOURCE = "attribute vec2 P;void main(){gl_Position=vec4(P,0.,1.);}";
const ASPECT = 1.2;

export interface FruitRenderer {
  /** False when WebGL is missing, the shader failed, the context was lost, or the tier is STATIC. */
  readonly ok: boolean;
  readonly tier: Tier;
  /** Sizes the shared canvas from a CSS width, limited by the current tier; height = width * 1.2. */
  resize(cssWidth: number, dpr: number): { width: number; height: number };
  /**
   * Draws one fruit. With a `target` (a card canvas) the tier decides what actually happens: the
   * centred card renders live, neighbours render less often (MID) or show a cached frame (LOW).
   */
  draw(kind: number, angle: number, target?: HTMLCanvasElement): void;
  /** Draws one fruit on the shared canvas and returns it as a PNG data URL (detail view art). */
  snapshot(kind: number, angle: number): string;
  dispose(): void;
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[fruit-gl] shader compile error:\n" + gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

const inertRenderer = (tier: Tier): FruitRenderer => ({
  ok: false,
  tier,
  resize: () => ({ width: 0, height: 0 }),
  draw() {},
  snapshot: () => "",
  dispose() {},
});

export function createFruitRenderer(onLost?: () => void): FruitRenderer {
  // STATIC: no WebGL at all, the studio shows posters.
  if (getTier() === "STATIC") return inertRenderer("STATIC");

  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true });

  let ok = false;
  let uK: WebGLUniformLocation | null = null;
  let uA: WebGLUniformLocation | null = null;
  let uR: WebGLUniformLocation | null = null;

  if (gl) {
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SOURCE);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (vertex && fragment) {
      const program = gl.createProgram();
      if (program) {
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
          gl.useProgram(program);
          gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
          const location = gl.getAttribLocation(program, "P");
          gl.enableVertexAttribArray(location);
          gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
          uK = gl.getUniformLocation(program, "K");
          uA = gl.getUniformLocation(program, "A");
          uR = gl.getUniformLocation(program, "R");
          ok = true;
        } else {
          console.warn("[fruit-gl] program link error:\n" + gl.getProgramInfoLog(program));
        }
      }
    }
  }

  let lastResize: { cssWidth: number; dpr: number } | null = null;
  // LOW: one cached frame per fruit. MID: last time each neighbour card was rendered.
  let cache = new Map<number, HTMLCanvasElement>();
  let shown = new WeakMap<HTMLCanvasElement, string>();
  const lastDraw = new WeakMap<HTMLCanvasElement, number>();

  const render = (kind: number, angle: number) => {
    gl!.uniform1f(uK, kind);
    gl!.uniform1f(uA, angle);
    gl!.uniform2f(uR, canvas.width, canvas.height);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  };

  const copy = (target: HTMLCanvasElement, source: HTMLCanvasElement) => {
    if (target.width !== source.width || target.height !== source.height) {
      target.width = source.width;
      target.height = source.height;
    }
    const context = target.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, target.width, target.height);
    context.drawImage(source, 0, 0);
  };

  const cachedFrame = (kind: number): HTMLCanvasElement => {
    let frame = cache.get(kind);
    if (!frame) {
      render(kind, SNAPSHOT_ANGLE);
      frame = document.createElement("canvas");
      frame.width = canvas.width;
      frame.height = canvas.height;
      frame.getContext("2d")?.drawImage(canvas, 0, 0);
      cache.set(kind, frame);
    }
    return frame;
  };

  const resize = (cssWidth: number, dpr: number) => {
    lastResize = { cssWidth, dpr };
    const cfg = TIER_CONFIG[getTier()];
    const width = Math.max(1, Math.min(cfg.maxWidth, Math.round(cssWidth * Math.min(dpr || 1, cfg.dpr))));
    const height = Math.round(width * ASPECT);
    canvas.width = width;
    canvas.height = height;
    gl?.viewport(0, 0, width, height);
    cache = new Map();
    shown = new WeakMap();
    return { width, height };
  };

  const handleLost = (event: Event) => {
    event.preventDefault();
    if (!ok) return;
    ok = false;
    onLost?.();
  };
  canvas.addEventListener("webglcontextlost", handleLost);

  let stopGovernor: (() => void) | null = null;
  const retire = () => {
    stopGovernor?.();
    stopGovernor = null;
    canvas.removeEventListener("webglcontextlost", handleLost);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  };

  if (ok && isAdaptive()) {
    stopGovernor = startGovernor(document.querySelector("[data-studio]"), (avg) => {
      const next = stepDown(`avg ${avg.toFixed(1)} ms over 2 s`);
      if (!next) return;
      if (next === "STATIC") {
        ok = false;
        retire();
        onLost?.(); // the studio swaps the canvases for posters
      } else if (lastResize) {
        resize(lastResize.cssWidth, lastResize.dpr); // card canvases follow lazily in draw()
      }
    });
  }

  return {
    get ok() {
      return ok;
    },
    get tier() {
      return getTier();
    },
    resize,
    draw(kind, angle, target) {
      if (!ok || !gl) return;
      if (!target) {
        render(kind, angle);
        return;
      }
      const cfg = TIER_CONFIG[getTier()];
      const centred = target.closest(".ps-card")?.getAttribute("aria-current") === "true";
      if (!centred) {
        if (cfg.neighbourMs === Infinity) {
          // LOW: neighbours show their cached poster frame and are not rendered again
          const key = `${kind}:${canvas.width}`;
          if (shown.get(target) !== key) {
            copy(target, cachedFrame(kind));
            shown.set(target, key);
          }
          return;
        }
        if (cfg.neighbourMs > 0) {
          const now = performance.now();
          if (now - (lastDraw.get(target) ?? 0) < cfg.neighbourMs) return;
          lastDraw.set(target, now);
        }
      }
      render(kind, angle);
      copy(target, canvas);
      shown.set(target, "live");
    },
    snapshot(kind, angle) {
      if (!ok || !gl) return "";
      render(kind, angle);
      return canvas.toDataURL("image/png");
    },
    dispose() {
      retire();
      ok = false;
    },
  };
}
