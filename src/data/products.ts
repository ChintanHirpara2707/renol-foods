import type { CategoryId } from "./categories";
import { isPublic } from "./public";

/**
 * Product catalogue. Copy (summary, description, uses) is general and factual and is listed in
 * TODO_CONTENT.md for client review. Specs are "[ADD]" until the client supplies them and are
 * hidden publicly (see publicSpecs / isPublic).
 */

/** Shared by every product until the client says otherwise. */
export const PACKAGING = "20 kg corrugated box";

export interface ProductSpecs {
  moisture: string;
  particleSize: string;
  shelfLife: string;
  storage: string;
}

export interface Product {
  slug: string;
  /** Full display name, e.g. "Ripe Banana Powder". */
  name: string;
  category: CategoryId;
  /** One line. */
  summary: string;
  /** Two or three sentences. */
  description: string;
  /** Typical food applications. */
  uses: string[];
  packaging: string;
  /** Product image; the file is added by the client/design team (see TODO_CONTENT.md). */
  image: string;
  /** Only where obvious from the product itself. */
  allergens: string[];
  /** Appears in the Powder Studio carousel. */
  studio: boolean;
  /** Studio colours (studio products only). */
  accent?: string;
  glow?: string;
  specs: ProductSpecs;
}

const kebab = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const PENDING_SPECS: ProductSpecs = {
  moisture: "[ADD]",
  particleSize: "[ADD]",
  shelfLife: "[ADD]",
  storage: "[ADD]",
};

interface Seed {
  name: string;
  category: CategoryId;
  summary: string;
  description: string;
  uses: string[];
  allergens?: string[];
  studio?: { accent: string; glow: string };
}

const build = (s: Seed): Product => {
  const slug = kebab(s.name);
  return {
    slug,
    name: s.name,
    category: s.category,
    summary: s.summary,
    description: s.description,
    uses: s.uses,
    packaging: PACKAGING,
    image: `/images/products/${slug}.webp`,
    allergens: s.allergens ?? [],
    studio: Boolean(s.studio),
    ...(s.studio ? { accent: s.studio.accent, glow: s.studio.glow } : {}),
    specs: { ...PENDING_SPECS },
  };
};

const CONTACT = "Contact us for specifications and samples.";

export const products: Product[] = [
  /* ---------- Fruit ---------- */
  build({
    name: "Apple Powder",
    category: "fruit",
    summary: "Apple powder for beverage, bakery and cereal products.",
    description: `Apple Powder is a food ingredient in powder form for manufacturers who want apple character in dry mixes and finished products. It blends into other powders and into recipes that start from a dry base. ${CONTACT}`,
    uses: ["Beverage premixes", "Bakery fillings", "Breakfast cereals", "Snack coatings", "Dessert mixes"],
    studio: { accent: "#e0564c", glow: "#a8261e" },
  }),
  build({
    name: "Ripe Banana Powder",
    category: "fruit",
    summary: "Ripe banana powder for bakery, shake and dessert mixes.",
    description: `Ripe Banana Powder brings banana flavour to products that are made from dry ingredients. Manufacturers use it where a fruit component has to mix evenly with flours, sugars and other powders. ${CONTACT}`,
    uses: ["Bakery mixes", "Shake and smoothie mixes", "Ice cream and dessert bases", "Breakfast cereals", "Snack coatings"],
  }),
  build({
    name: "Orange Powder",
    category: "fruit",
    summary: "Orange powder for drink mixes, confectionery and bakery.",
    description: `Orange Powder is a citrus fruit ingredient supplied in powder form for industrial food production. It suits formulations where orange taste and colour are wanted without adding liquid. ${CONTACT}`,
    uses: ["Beverage premixes", "Confectionery", "Bakery products", "Dessert mixes", "Seasoning blends"],
    studio: { accent: "#ff9a1f", glow: "#c55a00" },
  }),
  build({
    name: "Pomegranate Powder",
    category: "fruit",
    summary: "Pomegranate powder for beverages, desserts and sauces.",
    description: `Pomegranate Powder is a fruit ingredient in powder form for food and beverage manufacturers. It is used to add pomegranate taste and colour to dry blends and to products made from them. ${CONTACT}`,
    uses: ["Beverage premixes", "Confectionery", "Dessert and ice cream mixes", "Sauces and chutneys", "Bakery products"],
    studio: { accent: "#e0243a", glow: "#8e0f24" },
  }),
  build({
    name: "Ripe Papaya Powder",
    category: "fruit",
    summary: "Ripe papaya powder for drink, dessert and bakery mixes.",
    description: `Ripe Papaya Powder is a tropical fruit ingredient supplied for use in dry formulations. It helps manufacturers carry a papaya flavour through mixes, bases and finished products. ${CONTACT}`,
    uses: ["Beverage premixes", "Bakery products", "Dessert mixes", "Confectionery", "Breakfast cereals"],
  }),
  build({
    name: "Strawberry Powder",
    category: "fruit",
    summary: "Strawberry powder for ice cream, bakery and drink mixes.",
    description: `Strawberry Powder gives manufacturers a strawberry ingredient that can be handled like any other dry raw material. It is used where strawberry flavour and colour are needed in powdered or reconstituted products. ${CONTACT}`,
    uses: ["Ice cream and dessert mixes", "Bakery fillings", "Beverage premixes", "Confectionery", "Breakfast cereals"],
    studio: { accent: "#ff4d6d", glow: "#b0102f" },
  }),
  build({
    name: "White Guava Powder",
    category: "fruit",
    summary: "White guava powder for beverages, desserts and sauces.",
    description: `White Guava Powder is a fruit ingredient in powder form for industrial food production. Manufacturers use it to bring guava taste to drink bases, desserts and sauces without handling whole fruit. ${CONTACT}`,
    uses: ["Beverage premixes", "Dessert mixes", "Confectionery", "Chutneys and sauces", "Bakery products"],
    studio: { accent: "#cfe9a8", glow: "#5d7a2b" },
  }),
  build({
    name: "Kesar Mango Powder",
    category: "fruit",
    summary: "Kesar mango powder for drinks, ice cream and desserts.",
    description: `Kesar Mango Powder is a mango ingredient supplied in powder form for food and beverage manufacturers. It carries the taste and colour of kesar mango into dry mixes and the products made from them. ${CONTACT}`,
    uses: ["Beverage premixes", "Ice cream and frozen desserts", "Dessert mixes", "Bakery products", "Confectionery"],
  }),
  build({
    name: "Raw Mango Powder",
    category: "fruit",
    summary: "Raw mango powder for seasonings, chutneys and snacks.",
    description: `Raw Mango Powder is a sour fruit ingredient in powder form, used by manufacturers of seasonings and savoury products. It adds a tangy taste to dry blends without adding moisture. ${CONTACT}`,
    uses: ["Seasoning blends", "Chutneys and pickles", "Snack seasonings", "Beverage mixes", "Sauces"],
  }),
  build({
    name: "Tamarind Powder",
    category: "fruit",
    summary: "Tamarind powder for chutneys, sauces and snack seasonings.",
    description: `Tamarind Powder is a sweet and sour fruit ingredient supplied in powder form. Manufacturers use it where tamarind taste has to be built into dry seasonings, mixes and sauces. ${CONTACT}`,
    uses: ["Chutneys and sauces", "Snack seasonings", "Soups and ready mixes", "Beverage mixes", "Confectionery"],
  }),
  build({
    name: "Pineapple Powder",
    category: "fruit",
    summary: "Pineapple powder for beverages, desserts and bakery.",
    description: `Pineapple Powder is a tropical fruit ingredient in powder form for food manufacturers. It is used to give dry mixes and finished products a pineapple taste. ${CONTACT}`,
    uses: ["Beverage premixes", "Dessert mixes", "Confectionery", "Bakery products", "Sauces"],
  }),
  build({
    name: "Jamun Powder",
    category: "fruit",
    summary: "Jamun powder for drink, dessert and confectionery mixes.",
    description: `Jamun Powder is an Indian fruit ingredient supplied in powder form for industrial use. Manufacturers use it for jamun taste and a deep colour in dry blends and the products made from them. ${CONTACT}`,
    uses: ["Beverage premixes", "Confectionery", "Dessert mixes", "Bakery products"],
  }),
  build({
    name: "Blueberry Powder",
    category: "fruit",
    summary: "Blueberry powder for bakery, cereal and dessert mixes.",
    description: `Blueberry Powder is a berry ingredient in powder form for food manufacturers. It lets formulators add blueberry taste and colour to dry bases, fillings and toppings. ${CONTACT}`,
    uses: ["Bakery products", "Breakfast cereals", "Beverage premixes", "Dessert and ice cream mixes", "Confectionery"],
    studio: { accent: "#6c7bff", glow: "#2b2f8f" },
  }),
  build({
    name: "Mulberry Powder",
    category: "fruit",
    summary: "Mulberry powder for bakery, cereal and drink mixes.",
    description: `Mulberry Powder is a berry ingredient supplied in powder form for industrial food production. It is used in dry blends where a mulberry taste and a dark fruit colour are wanted. ${CONTACT}`,
    uses: ["Bakery products", "Breakfast cereals", "Beverage premixes", "Confectionery"],
  }),
  build({
    name: "Cranberry Powder",
    category: "fruit",
    summary: "Cranberry powder for drinks, bakery and cereal products.",
    description: `Cranberry Powder is a tart fruit ingredient in powder form for food and beverage manufacturers. It is used to bring cranberry taste to dry mixes, bases and finished products. ${CONTACT}`,
    uses: ["Beverage premixes", "Bakery products", "Breakfast cereals", "Confectionery", "Sauces"],
  }),
  build({
    name: "Blackberry Powder",
    category: "fruit",
    summary: "Blackberry powder for bakery, dessert and drink mixes.",
    description: `Blackberry Powder is a berry ingredient supplied in powder form. Manufacturers use it to add blackberry taste and colour to dry formulations without handling whole fruit. ${CONTACT}`,
    uses: ["Bakery products", "Dessert and ice cream mixes", "Beverage premixes", "Confectionery"],
  }),
  build({
    name: "Amla Powder",
    category: "fruit",
    summary: "Amla powder for beverages, chutneys and confectionery.",
    description: `Amla Powder is an Indian gooseberry ingredient supplied in powder form for food manufacturers. It is used in dry blends where amla taste is part of the recipe. ${CONTACT}`,
    uses: ["Beverage mixes", "Chutneys and pickles", "Confectionery", "Seasoning blends"],
  }),
  build({
    name: "Dry Dates Powder",
    category: "fruit",
    summary: "Dry dates powder for bakery, shake and dessert mixes.",
    description: `Dry Dates Powder is a fruit ingredient in powder form that suits sweet products made from dry raw materials. Manufacturers use it for date taste and colour in mixes, bases and fillings. ${CONTACT}`,
    uses: ["Bakery products", "Confectionery", "Shake and beverage mixes", "Dessert mixes", "Breakfast cereals"],
  }),
  build({
    name: "Raspberry Powder",
    category: "fruit",
    summary: "Raspberry powder for bakery, dessert and drink mixes.",
    description: `Raspberry Powder is a berry ingredient in powder form for industrial food production. It adds raspberry taste and colour to dry bases, toppings and the products made from them. ${CONTACT}`,
    uses: ["Bakery products", "Dessert and ice cream mixes", "Beverage premixes", "Confectionery"],
  }),

  /* ---------- Vegetable ---------- */
  build({
    name: "Beetroot Powder",
    category: "vegetable",
    summary: "Beetroot powder for drinks, bakery and savoury mixes.",
    description: `Beetroot Powder is a vegetable ingredient in powder form for food manufacturers. It is used to give dry mixes and finished products a beetroot taste and a deep red colour. ${CONTACT}`,
    uses: ["Beverage premixes", "Bakery products", "Snack seasonings", "Soups and ready mixes", "Sauces"],
    studio: { accent: "#d6336c", glow: "#8a1148" },
  }),
  build({
    name: "Spinach Powder",
    category: "vegetable",
    summary: "Spinach powder for pasta, soups, bakery and snacks.",
    description: `Spinach Powder is a leafy vegetable ingredient supplied in powder form for industrial food production. Manufacturers use it for spinach taste and a green colour in dry blends and doughs. ${CONTACT}`,
    uses: ["Pasta and noodles", "Soups and ready mixes", "Bakery products", "Snacks", "Sauces"],
  }),
  build({
    name: "Carrot Powder",
    category: "vegetable",
    summary: "Carrot powder for soups, sauces, bakery and snacks.",
    description: `Carrot Powder is a vegetable ingredient in powder form for food manufacturers. It brings carrot taste and an orange colour to dry mixes and to the products made from them. ${CONTACT}`,
    uses: ["Soups and ready mixes", "Bakery products", "Snacks", "Sauces", "Beverage mixes"],
  }),
  build({
    name: "Green Chilli Powder",
    category: "vegetable",
    summary: "Green chilli powder for seasonings, sauces and snacks.",
    description: `Green Chilli Powder is a hot vegetable ingredient supplied in powder form. Manufacturers use it in seasonings and savoury products where green chilli taste is wanted in a dry format. ${CONTACT}`,
    uses: ["Seasoning blends", "Snack seasonings", "Sauces", "Soups and ready mixes", "Marinades"],
  }),
  build({
    name: "Pumpkin Powder",
    category: "vegetable",
    summary: "Pumpkin powder for soups, sauces, bakery and snacks.",
    description: `Pumpkin Powder is a vegetable ingredient in powder form for industrial food production. It is used where pumpkin taste and colour have to be built into dry bases and mixes. ${CONTACT}`,
    uses: ["Soups and ready mixes", "Sauces", "Bakery products", "Snacks"],
  }),
  build({
    name: "Tomato Powder",
    category: "vegetable",
    summary: "Tomato powder for soups, sauces and snack seasonings.",
    description: `Tomato Powder is a savoury ingredient supplied in powder form for food manufacturers. It gives dry seasonings, soups and sauce bases a tomato taste and colour. ${CONTACT}`,
    uses: ["Soups and ready mixes", "Sauces and ketchup", "Snack seasonings", "Seasoning blends", "Gravy mixes"],
  }),
  build({
    name: "Lemon Powder",
    category: "vegetable",
    summary: "Lemon powder for drink mixes, seasonings and bakery.",
    description: `Lemon Powder is a citrus ingredient in powder form for food and beverage manufacturers. It carries a lemon taste into dry formulations and into products made from them. ${CONTACT}`,
    uses: ["Beverage premixes", "Seasoning blends", "Bakery products", "Marinades and dressings", "Confectionery"],
  }),
  build({
    name: "Garlic Powder",
    category: "vegetable",
    summary: "Garlic powder for seasonings, sauces and ready mixes.",
    description: `Garlic Powder is a savoury ingredient supplied in powder form for industrial food production. Manufacturers use it wherever garlic taste is needed in dry blends, sauces and snacks. ${CONTACT}`,
    uses: ["Seasoning blends", "Sauces and marinades", "Soups and ready mixes", "Snack seasonings", "Bakery products"],
  }),
  build({
    name: "Ginger Powder",
    category: "vegetable",
    summary: "Ginger powder for seasonings, drinks and bakery.",
    description: `Ginger Powder is a warm, pungent ingredient in powder form for food and beverage manufacturers. It is used to add ginger taste to dry blends, drink mixes and baked goods. ${CONTACT}`,
    uses: ["Seasoning blends", "Tea and beverage mixes", "Sauces and marinades", "Bakery products", "Soups and ready mixes"],
  }),
  build({
    name: "White Button Mushroom Powder",
    category: "vegetable",
    summary: "White button mushroom powder for soups, sauces and snacks.",
    description: `White Button Mushroom Powder is a savoury ingredient supplied in powder form for food manufacturers. It adds a mushroom taste to dry mixes, soups, gravies and seasonings. ${CONTACT}`,
    uses: ["Soups and ready mixes", "Sauces and gravies", "Seasoning blends", "Snacks", "Bakery products"],
  }),

  /* ---------- Food colour ---------- */
  build({
    name: "Caramel Colour Powder Type-4",
    category: "food-colour",
    summary: "Caramel colour in powder form for food and beverage use.",
    description: `Caramel Colour Powder Type-4 is a caramel food colour supplied in powder form for industrial use. It gives manufacturers a brown colouring ingredient for dry mixes and for products made from them. ${CONTACT}`,
    uses: ["Beverages", "Bakery products", "Sauces and gravies", "Confectionery", "Seasoning blends"],
  }),

  /* ---------- Dairy ---------- */
  build({
    name: "Skimmed Milk Powder",
    category: "dairy",
    summary: "Skimmed milk powder for bakery, dessert and drink mixes.",
    description: `Skimmed Milk Powder is a dairy ingredient in powder form for food manufacturers. It is used as a milk component in recipes that start from dry raw materials. ${CONTACT}`,
    uses: ["Bakery products", "Confectionery", "Ice cream and dessert mixes", "Beverage mixes", "Sauces"],
    allergens: ["milk"],
  }),
  build({
    name: "Milk Powder",
    category: "dairy",
    summary: "Milk powder for bakery, confectionery and drink mixes.",
    description: `Milk Powder is a dairy ingredient supplied in powder form for industrial food production. Manufacturers use it as a milk component in dry mixes and in the products made from them. ${CONTACT}`,
    uses: ["Bakery products", "Confectionery", "Ice cream and dessert mixes", "Beverage mixes", "Sauces and soups"],
    allergens: ["milk"],
  }),
  build({
    name: "Butter Powder",
    category: "dairy",
    summary: "Butter powder for bakery, sauces and savoury coatings.",
    description: `Butter Powder is a dairy ingredient in powder form for food manufacturers. It lets formulators bring butter taste into dry mixes and coatings. ${CONTACT}`,
    uses: ["Bakery products", "Sauces and soups", "Snack and seasoning coatings", "Ready mixes", "Confectionery"],
    allergens: ["milk"],
  }),

  /* ---------- Seasoning ---------- */
  build({
    name: "Soya HVP Powder",
    category: "seasoning",
    summary: "Soya HVP powder for soups, sauces and snack seasonings.",
    description: `Soya HVP Powder is a savoury seasoning ingredient supplied in powder form for food manufacturers. It is used to build savoury taste into dry blends and the products made from them. ${CONTACT}`,
    uses: ["Soups and ready mixes", "Sauces and gravies", "Snack seasonings", "Seasoning blends", "Marinades"],
    allergens: ["soy"],
  }),

  /* ---------- Beverage ---------- */
  build({
    name: "Apple Cider Vinegar Powder",
    category: "beverage",
    summary: "Apple cider vinegar powder for drinks and dry seasonings.",
    description: `Apple Cider Vinegar Powder is a vinegar ingredient in powder form for food and beverage manufacturers. It is used where a vinegar taste has to be added to dry mixes. ${CONTACT}`,
    uses: ["Beverage mixes", "Seasoning blends", "Dressings and sauces", "Snack seasonings", "Marinades"],
  }),
];

/** Older code and tests refer to the product type by this name. */
export type ProductItem = Product;

export const productBySlug = (slug: string): Product | undefined => products.find((p) => p.slug === slug);

/** "Ripe Banana Powder" -> "Ripe Banana" (studio and compact labels). */
export const shortName = (p: Product): string => p.name.replace(/ Powder$/, "");

/** Spec rows that are confirmed and safe to show; empty means show "Full specifications on request". */
export function publicSpecs(p: Product): { label: string; value: string }[] {
  const rows: [string, string][] = [
    ["Packaging", p.packaging],
    ["Moisture", p.specs.moisture],
    ["Particle size", p.specs.particleSize],
    ["Shelf life", p.specs.shelfLife],
    ["Storage", p.specs.storage],
  ];
  return rows.filter(([, v]) => isPublic(v)).map(([label, value]) => ({ label, value }));
}

/* ---------- studio colours ---------- */

const hex = (c: string): [number, number, number] => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) as [number, number, number];
const toHex = (c: number[]) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
const mix = (a: string, b: string, t: number): string => {
  const [x, y] = [hex(a), hex(b)];
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
};

export interface StudioTheme {
  accent: string;
  glow: string;
  base: string;
  pouch: string;
  powder: string;
  particles: string[];
}

const DEFAULT_THEME = { accent: "#ffb020", glow: "#7d6200" };

/** Full palette derived from a product's accent and glow (defaults for non-studio products). */
export function productTheme(p: Product): StudioTheme {
  const accent = p.accent ?? DEFAULT_THEME.accent;
  const glow = p.glow ?? DEFAULT_THEME.glow;
  return {
    accent,
    glow,
    base: mix(glow, "#000000", 0.88),
    pouch: mix(glow, "#000000", 0.15),
    powder: mix(accent, "#f3e9d2", 0.25),
    particles: [accent, mix(accent, "#ffffff", 0.25), glow, mix(accent, glow, 0.5)],
  };
}
