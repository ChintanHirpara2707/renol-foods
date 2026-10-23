// Renders a still poster of every shader fruit with the Powder Studio's own fragment shader
// (src/scripts/studio/fruit.frag.glsl) and writes public/images/fruit/<slug>.webp.
// Posters are the no-WebGL fallback.
// Run: node scripts/make-fruit-posters.mjs   (needs Playwright's Chromium)
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";

const KINDS = { beetroot: 0, apple: 1, pomegranate: 2, blueberry: 3, strawberry: 4, orange: 5, "white-guava": 6 };
const ANGLE = 0.55; // same still angle the prototype uses for its snapshots
const W = 400;
const H = 480;
const out = "public/images/fruit";

const fragment = await readFile("src/scripts/studio/fruit.frag.glsl", "utf8");
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage();

const pngs = await page.evaluate(
  ({ fragment, kinds, angle, w, h }) => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true });
    if (!gl) throw new Error("WebGL unavailable in this Chromium");
    const make = (type, src) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      return shader;
    };
    const program = gl.createProgram();
    gl.attachShader(program, make(gl.VERTEX_SHADER, "attribute vec2 P;void main(){gl_Position=vec4(P,0.,1.);}"));
    gl.attachShader(program, make(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "P");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.viewport(0, 0, w, h);
    const result = {};
    for (const [name, kind] of Object.entries(kinds)) {
      gl.uniform1f(gl.getUniformLocation(program, "K"), kind);
      gl.uniform1f(gl.getUniformLocation(program, "A"), angle);
      gl.uniform2f(gl.getUniformLocation(program, "R"), w, h);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      result[name] = canvas.toDataURL("image/png");
    }
    return result;
  },
  { fragment, kinds: KINDS, angle: ANGLE, w: W, h: H },
);
await browser.close();

for (const [name, dataUrl] of Object.entries(pngs)) {
  const buffer = Buffer.from(dataUrl.split(",")[1], "base64");
  await sharp(buffer).webp({ quality: 88, alphaQuality: 100 }).toFile(`${out}/${name}-powder.webp`);
  console.log(`wrote ${out}/${name}-powder.webp`);
}
