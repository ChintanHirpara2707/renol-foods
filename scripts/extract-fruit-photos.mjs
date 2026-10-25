// Extracts the embedded fruit photos from the client's studio prototype
// (reference/Fruit Powder Studio (prototype).html, <script id="fruitPhotos">) into
// public/images/fruit/<name>.webp. Run: node scripts/extract-fruit-photos.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const html = readFileSync("reference/Fruit Powder Studio (prototype).html", "utf8");
const match = html.match(/<script type="application\/json" id="fruitPhotos">([\s\S]*?)<\/script>/);
if (!match) throw new Error("fruitPhotos block not found");
const photos = JSON.parse(match[1]);

// prototype id -> file name (matches the product slug without "-powder")
const NAMES = { guava: "white-guava" };
mkdirSync("public/images/fruit", { recursive: true });
for (const [id, dataUrl] of Object.entries(photos)) {
  const file = `public/images/fruit/${NAMES[id] ?? id}.webp`;
  writeFileSync(file, Buffer.from(dataUrl.split(",")[1], "base64"));
  console.log(file, `${(Buffer.from(dataUrl.split(",")[1], "base64").length / 1024).toFixed(0)} KB`);
}
