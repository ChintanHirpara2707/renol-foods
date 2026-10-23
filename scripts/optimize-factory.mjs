// Turns the client's factory JPGs (public/images/industries/*.jpg) into web-ready WebP files in
// public/images/factory/ (1200x800, each under 150 KB). The originals are never modified.
// Run: npm run factory-images
import sharp from "sharp";
import { createServer } from "vite";
import { existsSync, statSync } from "node:fs";
import { mkdir } from "node:fs/promises";

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const { factoryPhotos } = await vite.ssrLoadModule("/src/data/factory.ts");
await vite.close();

const MAX_BYTES = 150 * 1024;
await mkdir("public/images/factory", { recursive: true });

for (const p of factoryPhotos) {
  const from = `public/images/industries/${p.source}`;
  const to = `public/images${p.image.replace("/images", "")}`;
  if (!existsSync(from)) {
    console.warn(`missing source ${from}`);
    continue;
  }
  let quality = 78;
  do {
    await sharp(from).rotate().resize(1200, 800, { fit: "cover", position: "centre" }).webp({ quality }).toFile(to);
    quality -= 6;
  } while (statSync(to).size > MAX_BYTES && quality > 40);
  console.log(`${to}  ${(statSync(to).size / 1024).toFixed(0)} KB`);
}
