import { existsSync } from "node:fs";
import { join } from "node:path";
import { products, productTheme, publicSpecs, shortName, type StudioTheme } from "../../data/products";
import { categoryById } from "../../data/categories";
import { publicList } from "../../data/public";
import { GL_KIND } from "./fruit-gl";

/**
 * Build-time only (runs in the Astro frontmatter): turns the studio products of
 * src/data/products.ts into the visual data the Powder Studio needs and serialises it into the
 * page. The client script imports the type only, so none of the product data ships in the JS bundle.
 */
export interface StudioProduct {
  /** Artwork key ("apple", "mango"): names the shader scene and the poster file. */
  id: string;
  slug: string;
  /** Short label for the carousel ("Mango"). */
  name: string;
  /** Catalogue name ("Kesar Mango Powder"). */
  fullName: string;
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

/**
 * TEMPORARY. These products have finished artwork (shader scene, frames or poster) but are not
 * flagged `studio` in products.ts. They stay in the carousel, in this order and with their
 * original colours, until shaders exist for the products that are flagged. Remove an entry
 * (or this whole block) once its replacement is ready.
 */
const KEPT_UNTIL_NEW_SHADERS: { slug: string; art: string; label?: string; theme: StudioTheme }[] = [
  { slug: "tomato-powder", art: "tomato", theme: { accent: "#ff5a4d", glow: "#d81a28", base: "#1c0507", pouch: "#b91c1c", powder: "#d94a36", particles: ["#ff6b57", "#e11d2a", "#c4162a", "#ff8a73"] } },
  { slug: "lemon-powder", art: "lemon", theme: { accent: "#ffe14a", glow: "#7d6200", base: "#1a1700", pouch: "#b58900", powder: "#f1e07a", particles: ["#fff176", "#ffd400", "#f2e27a", "#e9c600"] } },
  { slug: "kesar-mango-powder", art: "mango", label: "Mango", theme: { accent: "#ffb020", glow: "#f27a00", base: "#1c0d02", pouch: "#c2410c", powder: "#f3b94e", particles: ["#ffcf4a", "#ff9a1f", "#f2542d", "#f6c667"] } },
  { slug: "spinach-powder", art: "spinach", theme: { accent: "#4ade80", glow: "#128a3c", base: "#04150a", pouch: "#15803d", powder: "#5fa046", particles: ["#52c46a", "#2f9e44", "#1f7a3a", "#7ad08a"] } },
  { slug: "ginger-powder", art: "ginger", theme: { accent: "#f0c48a", glow: "#a8702c", base: "#1a1007", pouch: "#92602b", powder: "#dcbf90", particles: ["#e8c58f", "#c79a5b", "#f3e3a8", "#a8773c"] } },
  { slug: "tamarind-powder", art: "tamarind", theme: { accent: "#d98b4e", glow: "#8f4a18", base: "#170a03", pouch: "#7c3f14", powder: "#9a6a42", particles: ["#a8683a", "#8b5a2b", "#c98f5b", "#6b3f1d"] } },
  { slug: "caramel-colour-powder-type-4", art: "caramel", label: "Caramel", theme: { accent: "#d48238", glow: "#7c3d10", base: "#140903", pouch: "#8a4313", powder: "#b36628", particles: ["#c67d36", "#9c4f17", "#e29d52", "#7a380e"] } },
];

const POSTER_DIR = join(process.cwd(), "public", "images", "fruit");

export interface StudioData {
  /** Products that can be drawn (shader, frames or poster), in carousel order. */
  items: StudioProduct[];
  /** Studio-flagged products with no artwork yet (need a shader scene or a poster); see TODO_CONTENT.md. */
  missingArt: string[];
}

export function studioData(): StudioData {
  const items: StudioProduct[] = [];
  const missingArt: string[] = [];
  const kept = new Map(KEPT_UNTIL_NEW_SHADERS.map((k) => [k.slug, k]));

  for (const p of products) {
    const keep = kept.get(p.slug);
    if (!p.studio && !keep) continue;

    const art = keep?.art ?? p.slug.replace(/-powder$/, "");
    const entry: StudioProduct = {
      id: art,
      slug: p.slug,
      name: keep?.label ?? shortName(p),
      fullName: p.name,
      cat: categoryById(p.category).name.replace(/ Powders$/, ""),
      ...(keep?.theme ?? productTheme(p)),
      blurb: p.summary,
      uses: publicList(p.uses),
      specs: publicSpecs(p),
      kind: GL_KIND[art] ?? null,
      frames: art === "lemon" ? { folder: "/frames/lemon/", count: 36, idle: 10 } : null,
      poster: existsSync(join(POSTER_DIR, `${art}-powder.webp`)) ? `/images/fruit/${art}-powder.webp` : null,
    };
    if (entry.kind !== null || entry.frames || entry.poster) items.push(entry);
    else missingArt.push(p.slug);
  }

  // Kept products first, in their original order; newly flagged ones after them.
  const order = (slug: string) => {
    const i = KEPT_UNTIL_NEW_SHADERS.findIndex((k) => k.slug === slug);
    return i < 0 ? KEPT_UNTIL_NEW_SHADERS.length : i;
  };
  items.sort((a, b) => {
    const ka = a.slug === "apple-powder" ? KEPT_UNTIL_NEW_SHADERS.length - 0.5 : order(a.slug);
    const kb = b.slug === "apple-powder" ? KEPT_UNTIL_NEW_SHADERS.length - 0.5 : order(b.slug);
    return ka - kb;
  });

  return { items, missingArt };
}
