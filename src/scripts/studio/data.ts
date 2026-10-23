import { existsSync } from "node:fs";
import { join } from "node:path";
import { products } from "../../data/products";
import { GL_KIND } from "./fruit-gl";

/**
 * Build-time only (runs in the Astro frontmatter): turns src/data/products.ts into the visual
 * data the Powder Studio needs and serialises it into the page. The client script imports the
 * type only, so none of the product data module ships in the JS bundle.
 */
export interface StudioProduct {
  id: string;
  slug: string;
  name: string;
  cat: string;
  accent: string;
  glow: string;
  base: string;
  pouch: string;
  powder: string;
  particles: string[];
  blurb: string;
  /** WebGL scene id, or null when the fruit is not a shader scene. */
  kind: number | null;
  /** Photographed rotation frames (lemon), or null. */
  frames: { folder: string; count: number; idle: number } | null;
  /** Static poster used when WebGL is unavailable; null when the file does not exist yet. */
  poster: string | null;
}

const POSTER_DIR = join(process.cwd(), "public", "images", "fruit");

export interface StudioData {
  /** Products that can be drawn (shader, frames or poster). */
  items: StudioProduct[];
  /** Products with no artwork yet; listed in TODO_CONTENT.md. */
  missingArt: string[];
}

export function studioData(): StudioData {
  const items: StudioProduct[] = [];
  const missingArt: string[] = [];

  for (const p of products) {
    const posterFile = `${p.slug}.webp`;
    const entry: StudioProduct = {
      id: p.id,
      slug: p.slug,
      name: p.name,
      cat: p.cat,
      accent: p.accent,
      glow: p.glow,
      base: p.base,
      pouch: p.pouch,
      powder: p.powder,
      particles: p.particles,
      blurb: p.blurb,
      kind: GL_KIND[p.id] ?? null,
      frames: p.spin ? { folder: p.framesFolder ?? "/frames/lemon/", count: p.spinFrames ?? 36, idle: 10 } : null,
      poster: existsSync(join(POSTER_DIR, posterFile)) ? `/images/fruit/${posterFile}` : null,
    };
    if (entry.kind !== null || entry.frames || entry.poster) items.push(entry);
    else missingArt.push(p.slug);
  }

  return { items, missingArt };
}
