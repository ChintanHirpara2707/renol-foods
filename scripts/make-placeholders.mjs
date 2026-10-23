// Generates local placeholder WebPs for every product and industry in src/data.
// Existing files are never touched, so real images dropped in later are safe.
// Run: npm run placeholders
import sharp from "sharp";
import { createServer } from "vite";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const { products } = await vite.ssrLoadModule("/src/data/products.ts");
const { industries } = await vite.ssrLoadModule("/src/data/industries.ts");
await vite.close();

const CATEGORY_COLOURS = {
  fruit: ["#c2410c", "#3b0d0d"],
  vegetable: ["#15803d", "#06200f"],
  "food-colour": ["#92602b", "#1d1006"],
  dairy: ["#64748b", "#10151c"],
  seasoning: ["#b45309", "#231004"],
  beverage: ["#a16207", "#1d1503"],
};
const INDUSTRY_COLOURS = [
  ["#b45309", "#1c0f03"],
  ["#0e7490", "#04161c"],
  ["#a21caf", "#1a0620"],
  ["#b91c1c", "#1e0606"],
  ["#1d4ed8", "#060d22"],
  ["#15803d", "#05190c"],
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const FONT = "Arial, Helvetica, sans-serif";

function wrap(text, max) {
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && (line + " " + word).length > max) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function label(lines, cx, cy, size, weight = 700) {
  const lead = size * 1.15;
  const top = cy - ((lines.length - 1) * lead) / 2;
  return lines
    .map((l, i) => `<text x="${cx}" y="${top + i * lead}" text-anchor="middle" dominant-baseline="middle" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="#fff" fill-opacity=".94">${esc(l)}</text>`)
    .join("");
}

function productSvg(p) {
  const [light, dark] = CATEGORY_COLOURS[p.category] ?? CATEGORY_COLOURS.fruit;
  const lines = wrap(p.name, 16);
  const size = lines.length > 2 ? 54 : 64;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></radialGradient>
    <linearGradient id="pile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity=".18"/></linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#bg)"/>
  <path d="M110 640 C230 620 300 520 370 440 C395 412 405 412 430 440 C500 520 570 620 690 640 L690 700 L110 700 Z" fill="url(#pile)"/>
  <path d="M330 470 C375 430 425 430 470 470 C430 452 370 452 330 470 Z" fill="#fff" fill-opacity=".32"/>
  <g fill="#000" fill-opacity=".12"><circle cx="250" cy="650" r="4"/><circle cx="340" cy="610" r="3"/><circle cx="470" cy="590" r="3"/><circle cx="560" cy="640" r="4"/><circle cx="400" cy="660" r="3"/></g>
  ${label(lines, 400, 235, size)}
</svg>`;
}

function industrySvg(ind, i) {
  const [light, dark] = INDUSTRY_COLOURS[i % INDUSTRY_COLOURS.length];
  const lines = wrap(ind.name, 20);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  <circle cx="1020" cy="170" r="230" fill="#fff" fill-opacity=".08"/>
  <circle cx="1090" cy="260" r="120" fill="#fff" fill-opacity=".07"/>
  <circle cx="140" cy="720" r="260" fill="#000" fill-opacity=".14"/>
  <path d="M0 640 C220 560 380 700 620 620 C860 540 1000 660 1200 600 L1200 800 L0 800 Z" fill="#fff" fill-opacity=".09"/>
  <rect x="120" y="150" width="90" height="8" rx="4" fill="#fff" fill-opacity=".6"/>
  ${label(lines, 600, 400, 84)}
</svg>`;
}

async function write(dir, slug, svg, size) {
  const file = `${dir}/${slug}.webp`;
  if (existsSync(file)) return "skipped";
  await sharp(Buffer.from(svg)).resize(size[0], size[1]).webp({ quality: 78 }).toFile(file);
  return "written";
}

const counts = { written: 0, skipped: 0 };
await mkdir("public/images/products", { recursive: true });
await mkdir("public/images/industries", { recursive: true });
for (const p of products) counts[await write("public/images/products", p.slug, productSvg(p), [800, 800])]++;
for (const [i, ind] of industries.entries()) counts[await write("public/images/industries", ind.slug, industrySvg(ind, i), [1200, 800])]++;
console.log(`placeholders: ${counts.written} written, ${counts.skipped} skipped (${products.length} products, ${industries.length} industries)`);
