import fragmentSource from "./fruit.frag.glsl?raw";

/**
 * Shared WebGL ray-marching renderer for the studio fruits (ported 1:1 from the client's
 * prototype, reference/powder-studio.html). One offscreen canvas draws any fruit; the result
 * is copied into the card's own 2D canvas. Lemon is photographed frames and never goes
 * through here.
 */

/** Scene id passed to the shader as uniform K. */
export const GL_KIND: Record<string, number> = { beetroot: 0, apple: 1, pomegranate: 2, blueberry: 3, strawberry: 4, orange: 5, "white-guava": 6 };

const VERTEX_SOURCE = "attribute vec2 P;void main(){gl_Position=vec4(P,0.,1.);}";

export interface FruitRenderer {
  /** False when WebGL is missing, the shader failed to compile/link, or the context was lost. */
  readonly ok: boolean;
  /** Sizes the shared canvas from a CSS width: width x min(dpr, 2), max 960 px; height = width * 1.2. */
  resize(cssWidth: number, dpr: number): { width: number; height: number };
  /** Draws one fruit and, if `target` is given, copies the result into its 2D context. */
  draw(kind: number, angle: number, target?: HTMLCanvasElement): void;
  /** Draws one fruit on the shared canvas and returns it as a PNG data URL (detail view art). */
  snapshot(kind: number, angle: number): string;
  dispose(): void;
}

const MAX_WIDTH = 960;
const ASPECT = 1.2;

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

export function createFruitRenderer(onLost?: () => void): FruitRenderer {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    preserveDrawingBuffer: true,
  });

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

  const handleLost = (event: Event) => {
    event.preventDefault();
    ok = false;
    onLost?.();
  };
  canvas.addEventListener("webglcontextlost", handleLost);

  return {
    get ok() {
      return ok;
    },
    resize(cssWidth, dpr) {
      const width = Math.min(MAX_WIDTH, Math.round(cssWidth * Math.min(dpr || 1, 2)));
      const height = Math.round(width * ASPECT);
      canvas.width = width;
      canvas.height = height;
      gl?.viewport(0, 0, width, height);
      return { width, height };
    },
    draw(kind, angle, target) {
      if (!ok || !gl) return;
      gl.uniform1f(uK, kind);
      gl.uniform1f(uA, angle);
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      const context = target?.getContext("2d");
      if (target && context) {
        context.clearRect(0, 0, target.width, target.height);
        context.drawImage(canvas, 0, 0);
      }
    },
    snapshot(kind, angle) {
      if (!ok || !gl) return "";
      this.draw(kind, angle);
      return canvas.toDataURL("image/png");
    },
    dispose() {
      canvas.removeEventListener("webglcontextlost", handleLost);
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
      ok = false;
    },
  };
}
