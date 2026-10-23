import { ADD, isPublic } from "./public";

export type ProductCategory = "Fruit" | "Vegetable" | "Spice" | "Colour & Flavour";

export interface ProductSpecs {
  moisture: string;
  particleSize: string;
  pH: string;
  solubility: string;
  colour: string;
  aroma: string;
}

export interface ProductItem {
  id: string;
  slug: string;
  /** Short name used in the studio ("Tomato"). */
  name: string;
  /** Full name used in pages ("Tomato Powder"). */
  fullName: string;
  cat: ProductCategory;
  category: ProductCategory;
  accent: string;
  /** Alias of accent, kept for older pages. */
  accentColor: string;
  glow: string;
  base: string;
  pouch: string;
  powder: string;
  particles: string[];
  spin?: boolean;
  spinFrames?: number;
  framesFolder?: string;
  /** Client-supplied one-liner. */
  blurb: string;
  shortDescription: string;
  longDescription: string;
  /** Client-supplied uses; empty list = hidden. */
  uses: string[];
  applications: string[];
  /** Verified ingredients only; empty list = hidden. */
  inside: string[];
  /** Everything below is "[ADD: ...]" until the client confirms; render with isPublic()/publicSpecs(). */
  ingredients: string;
  form: string;
  packagingSizes: string;
  shelfLife: string;
  storage: string;
  specs: ProductSpecs;
}

const pending = (ingredientsNote: string) => ({
  ingredients: ADD(ingredientsNote),
  form: ADD("physical form"),
  packagingSizes: ADD("packaging sizes"),
  shelfLife: ADD("shelf life"),
  storage: ADD("storage conditions"),
  specs: {
    moisture: ADD("moisture %"),
    particleSize: ADD("particle size / mesh"),
    pH: ADD("pH range"),
    solubility: ADD("solubility"),
    colour: ADD("colour description"),
    aroma: ADD("aroma description"),
  },
});

interface Seed {
  id: string;
  name: string;
  cat: ProductCategory;
  accent: string;
  glow: string;
  base: string;
  pouch: string;
  powder: string;
  particles: string[];
  blurb: string;
  uses: string[];
  ingredientsNote: string;
  spin?: boolean;
}

const build = (s: Seed): ProductItem => ({
  id: s.id,
  slug: `${s.id}-powder`,
  name: s.name,
  fullName: `${s.name} Powder`,
  cat: s.cat,
  category: s.cat,
  accent: s.accent,
  accentColor: s.accent,
  glow: s.glow,
  base: s.base,
  pouch: s.pouch,
  powder: s.powder,
  particles: s.particles,
  ...(s.spin ? { spin: true, spinFrames: 36, framesFolder: "/frames/lemon/" } : {}),
  blurb: s.blurb,
  shortDescription: s.blurb,
  longDescription: s.blurb,
  uses: s.uses,
  applications: s.uses,
  inside: [],
  ...pending(s.ingredientsNote),
});

/**
 * Palette, blurbs and uses for the first six products come from the client's
 * prototype (reference/powder-studio.html). Caramel and Apple are not in the
 * prototype: their blurbs are neutral and their uses hidden until the client
 * supplies copy (TODO_CONTENT.md).
 */
export const products: ProductItem[] = [
  build({
    id: "tomato",
    name: "Tomato",
    cat: "Vegetable",
    accent: "#ff5a4d",
    glow: "#d81a28",
    base: "#1c0507",
    pouch: "#b91c1c",
    powder: "#d94a36",
    particles: ["#ff6b57", "#e11d2a", "#c4162a", "#ff8a73"],
    blurb: "Hot break and cold break tomato powder made with a low-temperature spray drying process.",
    uses: ["Soups", "Sauces", "Ready dishes", "Seasoning blends"],
    ingredientsNote: 'ingredients; client prototype lists "Tomatoes, Silicon dioxide"',
  }),
  build({
    id: "lemon",
    name: "Lemon",
    cat: "Fruit",
    accent: "#ffe14a",
    glow: "#7d6200",
    base: "#1a1700",
    pouch: "#b58900",
    powder: "#f1e07a",
    particles: ["#fff176", "#ffd400", "#f2e27a", "#e9c600"],
    blurb: "Spray-dried lemon juice with a concentrated citrus kick and no squeezing.",
    uses: ["Fish", "Chicken", "Salads", "Marinades", "Baking", "Beverages"],
    ingredientsNote: 'ingredients; client prototype lists "Lemon juice concentrate, Corn syrup solids, Lemon oil"',
    spin: true,
  }),
  build({
    id: "mango",
    name: "Mango",
    cat: "Fruit",
    accent: "#ffb020",
    glow: "#f27a00",
    base: "#1c0d02",
    pouch: "#c2410c",
    powder: "#f3b94e",
    particles: ["#ffcf4a", "#ff9a1f", "#f2542d", "#f6c667"],
    blurb: "A tangy-sweet fruit powder for North Indian chaats and chutneys, and for smoothies and baking.",
    uses: ["Chaats", "Soups", "Gravies", "Pakoras", "Chutneys", "Smoothies", "Baking"],
    ingredientsNote:
      'ingredients and allergen statement; client prototype lists "Mango, Sugar, Citric acid, Sulfur dioxide (preservative), Sulfites"',
  }),
  build({
    id: "spinach",
    name: "Spinach",
    cat: "Vegetable",
    accent: "#4ade80",
    glow: "#128a3c",
    base: "#04150a",
    pouch: "#15803d",
    powder: "#5fa046",
    particles: ["#52c46a", "#2f9e44", "#1f7a3a", "#7ad08a"],
    blurb: "Deep green spinach powder that adds colour and nutrition. Made to customer specifications.",
    uses: ["Smoothies", "Juices", "Soups", "Pasta sauces", "Baked goods"],
    ingredientsNote: 'ingredients; client prototype lists "Organic spinach" (organic claim needs proof)',
  }),
  build({
    id: "ginger",
    name: "Ginger",
    cat: "Vegetable",
    accent: "#f0c48a",
    glow: "#a8702c",
    base: "#1a1007",
    pouch: "#92602b",
    powder: "#dcbf90",
    particles: ["#e8c58f", "#c79a5b", "#f3e3a8", "#a8773c"],
    blurb: "Warm, bold ginger powder without the peeling and grating.",
    uses: ["Curries", "Stir-fries", "Soups", "Marinades", "Baked goods", "Beverages"],
    ingredientsNote: 'ingredients; client prototype lists "Dried ginger"',
  }),
  build({
    id: "tamarind",
    name: "Tamarind",
    cat: "Fruit",
    accent: "#d98b4e",
    glow: "#8f4a18",
    base: "#170a03",
    pouch: "#7c3f14",
    powder: "#9a6a42",
    particles: ["#a8683a", "#8b5a2b", "#c98f5b", "#6b3f1d"],
    blurb: "Concentrated sweet-and-sour tamarind, ready to use with no sticky pods.",
    uses: ["Chutneys", "Curries", "Soups", "Tamarind rice", "Sauces", "Desserts"],
    ingredientsNote: 'ingredients; client prototype lists "Tamarind, Modified corn starch"',
  }),
  build({
    id: "caramel",
    name: "Caramel",
    cat: "Colour & Flavour",
    accent: "#d48238",
    glow: "#7c3d10",
    base: "#140903",
    pouch: "#8a4313",
    powder: "#b36628",
    particles: ["#c67d36", "#9c4f17", "#e29d52", "#7a380e"],
    blurb: "Caramel powder for colour and flavour in food manufacturing.",
    uses: [],
    ingredientsNote: "ingredients, caramel class and carrier (no client copy yet)",
  }),
  build({
    id: "apple",
    name: "Apple",
    cat: "Fruit",
    accent: "#e0564c",
    glow: "#a8261e",
    base: "#180606",
    pouch: "#99221b",
    powder: "#c94d43",
    particles: ["#e8655b", "#b52f26", "#f28c84", "#8a1d16"],
    blurb: "Apple powder for food manufacturers.",
    uses: [],
    ingredientsNote: "ingredients (no client copy yet)",
  }),
];

export const productBySlug = (slug: string): ProductItem | undefined =>
  products.find((p) => p.slug === slug);

/** Spec rows that are confirmed and safe to show; empty array means show SPECS_ON_REQUEST. */
export function publicSpecs(p: ProductItem): { label: string; value: string }[] {
  const rows: [string, string][] = [
    ["Form", p.form],
    ["Ingredients", p.ingredients],
    ["Moisture", p.specs.moisture],
    ["Particle size", p.specs.particleSize],
    ["pH", p.specs.pH],
    ["Solubility", p.specs.solubility],
    ["Colour", p.specs.colour],
    ["Aroma", p.specs.aroma],
    ["Packaging", p.packagingSizes],
    ["Shelf life", p.shelfLife],
    ["Storage", p.storage],
  ];
  return rows.filter(([, v]) => isPublic(v)).map(([label, value]) => ({ label, value }));
}
