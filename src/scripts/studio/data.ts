import { existsSync } from "node:fs";
import { join } from "node:path";
import { products, publicSpecs, shortName } from "../../data/products";
import { categoryById } from "../../data/categories";
import { whatsappLink, productChatMessage } from "../../data/site";
import { publicList } from "../../data/public";

/**
 * Build-time only (runs in the Astro frontmatter): turns the studio products of
 * src/data/products.ts into the data the Powder Studio needs and serialises it into the page.
 * The client script imports the type only, so none of the product data ships in the JS bundle.
 *
 * Fruit art and colours come from the client's studio prototype
 * (reference/Fruit Powder Studio (prototype).html): a transparent photo per fruit
 * (public/images/fruit/<name>.webp, extracted by scripts/extract-fruit-photos.mjs) and a colour set
 * per fruit.
 */
export interface StudioProduct {
  /** Art key ("apple", "white-guava"): names the photo file. */
  id: string;
  slug: string;
  /** Short label for the carousel ("Apple"). */
  name: string;
  /** Catalogue name ("Apple Powder"). */
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
  /** WhatsApp link whose text names the product and the packaging. */
  chatUrl: string;
  /** Confirmed uses only. */
  uses: string[];
  /** Confirmed spec rows only; empty means "Full specifications on request". */
  specs: { label: string; value: string }[];
  /** Transparent fruit photo. */
  photo: string;
}

interface Colours {
  accent: string;
  glow: string;
  base: string;
  pouch: string;
  powder: string;
  particles: string[];
}

/** Carousel order and colours, as in the prototype. */
const STUDIO: { slug: string; colours: Colours }[] = [
  { slug: "beetroot-powder", colours: { accent: "#e0609a", glow: "#8c1d4f", base: "#1a0610", pouch: "#7a1740", powder: "#a8305f", particles: ["#c2185b", "#8e1466", "#d63384", "#6a0f3a"] } },
  { slug: "blueberry-powder", colours: { accent: "#8fa6ff", glow: "#2d46b0", base: "#070b22", pouch: "#2a3a94", powder: "#6672b8", particles: ["#5a63d8", "#3b43a8", "#8c96e8", "#2a2f7a"] } },
  { slug: "strawberry-powder", colours: { accent: "#ff6b6b", glow: "#e11d2e", base: "#1c0508", pouch: "#b91c1c", powder: "#ee6a6a", particles: ["#ff4d5e", "#e11d48", "#ff8a96", "#b3122e"] } },
  { slug: "pomegranate-powder", colours: { accent: "#ff6f8a", glow: "#9b1030", base: "#17030a", pouch: "#7f1230", powder: "#c0506a", particles: ["#9f1239", "#c2284f", "#7c1230", "#e05a77"] } },
  { slug: "orange-powder", colours: { accent: "#ffa13d", glow: "#ee6a00", base: "#1c0b02", pouch: "#c2410c", powder: "#f4a04a", particles: ["#ff9a1f", "#f97316", "#ffc060", "#d9570a"] } },
  { slug: "white-guava-powder", colours: { accent: "#dff59a", glow: "#86b53c", base: "#0e1604", pouch: "#5f8f1c", powder: "#dbe9a8", particles: ["#dfeaa8", "#b7d36a", "#f2f6d2", "#8fb04a"] } },
  { slug: "apple-powder", colours: { accent: "#ff6b5e", glow: "#b3151b", base: "#190405", pouch: "#9b1a1a", powder: "#e6b0a0", particles: ["#d92d20", "#f04438", "#9be864", "#7fc944"] } },
];

const PHOTO_DIR = join(process.cwd(), "public", "images", "fruit");

export interface StudioData {
  /** Studio products with a photo, in carousel order. */
  items: StudioProduct[];
  /** Studio products whose photo file is missing. */
  missingArt: string[];
}

export function studioData(): StudioData {
  const items: StudioProduct[] = [];
  const missingArt: string[] = [];

  for (const { slug, colours } of STUDIO) {
    const p = products.find((x) => x.slug === slug);
    if (!p) continue;
    const art = slug.replace(/-powder$/, "");
    if (!existsSync(join(PHOTO_DIR, `${art}.webp`))) {
      missingArt.push(slug);
      continue;
    }
    items.push({
      id: art,
      slug,
      name: shortName(p),
      fullName: p.name,
      cat: categoryById(p.category).name.replace(/ Powders$/, ""),
      ...colours,
      blurb: p.summary,
      chatUrl: whatsappLink(productChatMessage(p)),
      uses: publicList(p.uses),
      specs: publicSpecs(p),
      photo: `/images/fruit/${art}.webp`,
    });
  }
  return { items, missingArt };
}
