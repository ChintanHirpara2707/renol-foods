import { products, productTheme, shortName, type Product } from "./products";
import type { CategoryId } from "./categories";
import { ADD } from "./public";

/**
 * Bridge for pages written against the old 8-product schema (home, /products, product pages,
 * downloads, request form). Delete it together with those pages when they are rebuilt.
 */
const CAT_LABEL: Record<CategoryId, string> = {
  fruit: "Fruit",
  vegetable: "Vegetable",
  "food-colour": "Food colour",
  dairy: "Dairy",
  seasoning: "Seasoning",
  beverage: "Beverage",
};

export interface LegacyProduct {
  id: string;
  slug: string;
  /** Short name ("Ripe Banana"). */
  name: string;
  fullName: string;
  cat: string;
  category: string;
  accent: string;
  accentColor: string;
  glow: string;
  base: string;
  pouch: string;
  powder: string;
  particles: string[];
  blurb: string;
  shortDescription: string;
  longDescription: string;
  uses: string[];
  applications: string[];
  inside: string[];
  ingredients: string;
  form: string;
  packagingSizes: string;
  shelfLife: string;
  storage: string;
  specs: { moisture: string; particleSize: string; pH: string; solubility: string; colour: string; aroma: string };
}

export function toLegacy(p: Product): LegacyProduct {
  const theme = productTheme(p);
  return {
    id: p.slug,
    slug: p.slug,
    name: shortName(p),
    fullName: p.name,
    cat: CAT_LABEL[p.category],
    category: CAT_LABEL[p.category],
    ...theme,
    accentColor: theme.accent,
    blurb: p.summary,
    shortDescription: p.summary,
    longDescription: p.description,
    uses: p.uses,
    applications: p.uses,
    inside: [],
    ingredients: ADD("ingredients"),
    form: ADD("physical form"),
    packagingSizes: p.packaging,
    shelfLife: p.specs.shelfLife,
    storage: p.specs.storage,
    specs: {
      moisture: p.specs.moisture,
      particleSize: p.specs.particleSize,
      pH: ADD("pH"),
      solubility: ADD("solubility"),
      colour: ADD("colour"),
      aroma: ADD("aroma"),
    },
  };
}

export const legacyProducts: LegacyProduct[] = products.map(toLegacy);
