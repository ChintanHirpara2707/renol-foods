import { existsSync } from "node:fs";
import { join } from "node:path";
import { products, productTheme, publicSpecs, shortName } from "../../data/products";
import { categoryById } from "../../data/categories";
import { publicList } from "../../data/public";
import { GL_KIND } from "./fruit-gl";

/**
 * Build-time only (runs in the Astro frontmatter): turns the studio products of
 * src/data/products.ts into the visual data the Powder Studio needs and serialises it into the
 * page. The client script imports the type only, so none of the product data ships in the JS bundle.
 */
export interface StudioProduct {
  /** Short key ("apple"): slug without the trailing "-powder". */
  id: string;
  slug: string;
  /** Short name ("Apple"). */
  name: string;
  /** Category label for the sub line ("Fruit"). */
  cat: string;
  accent: string;
  glow: string;
  base: string;
  pouch: string;
  powder: string;
  particles: string[];
  blurb: string;
  /** Confirmed uses only. */
  uses: string[];
  /** Confirmed spec rows only; empty means "Full specifications on request". */
  specs: { label: string; value: string }[];
  /** WebGL scene id, or null when the fruit is not a shader scene. */
  kind: number | null;
  /** Photographed rotation frames (lemon), or null. */
  frames: { folder: string; count: number; idle: number } | null;
  /** Static poster used when WebGL is unavailable; null when the file does not exist yet. */
  poster: string | null;
}

const POSTER_DIR = join(process.cwd(), "public", "images", "fruit");

export interface StudioData {
  /** Studio products that can be drawn (shader, frames or poster). */
  items: StudioProduct[];
  /** Studio products with no artwork yet (need a shader scene or a poster); see TODO_CONTENT.md. */
  missingArt: string[];
}

export function studioData(): StudioData {
  const items: StudioProduct[] = [];
  const missingArt: string[] = [];

  for (const p of products.filter((x) => x.studio)) {
    const id = p.slug.replace(/-powder$/, "");
    const posterFile = `${p.slug}.webp`;
    const entry: StudioProduct = {
      id,
      slug: p.slug,
      name: shortName(p),
      cat: categoryById(p.category).name.replace(/ Powders$/, ""),
      ...productTheme(p),
      blurb: p.summary,
      uses: publicList(p.uses),
      specs: publicSpecs(p),
      kind: GL_KIND[id] ?? null,
      frames: id === "lemon" ? { folder: "/frames/lemon/", count: 36, idle: 10 } : null,
      poster: existsSync(join(POSTER_DIR, posterFile)) ? `/images/fruit/${posterFile}` : null,
    };
    if (entry.kind !== null || entry.frames || entry.poster) items.push(entry);
    else missingArt.push(p.slug);
  }

  return { items, missingArt };
}
