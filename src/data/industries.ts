import { products, type Product } from "./products";
import type { CategoryId } from "./categories";

export interface Industry {
  slug: string;
  name: string;
  /** One line. */
  description: string;
  /** Image file is supplied by the client/design team (see TODO_CONTENT.md). */
  image: string;
  /** Words matched against product `uses` to find relevant products. */
  keywords: string[];
  /** Used instead of keywords when an industry has none. */
  categories: CategoryId[];
}

const kebab = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const make = (name: string, description: string, keywords: string[], categories: CategoryId[] = []): Industry => {
  const slug = kebab(name);
  return { slug, name, description, image: `/images/industries/${slug}.webp`, keywords, categories };
};

export const industries: Industry[] = [
  make("Bakery & Confectionery", "Fruit, dairy and colour powders for bakery products and confectionery.", ["bakery", "confectionery"]),
  make("Beverages & Juices", "Fruit and beverage powders for drink mixes and juices.", ["beverage"]),
  make("Snacks & Seasonings", "Vegetable, fruit and seasoning powders for snack coatings and seasoning blends.", ["snack", "seasoning"]),
  make("Soups, Sauces & Ready Mixes", "Vegetable and savoury powders for soups, sauces and ready-to-cook mixes.", ["soups", "sauces", "ready mixes", "gravy"]),
  make("Dairy & Ice Cream", "Fruit and dairy powders for ice cream, frozen desserts and dairy products.", ["ice cream", "dessert"]),
  make("Nutraceuticals & Health Foods", "Fruit and vegetable powders for health food and nutraceutical formulations.", [], ["fruit", "vegetable"]),
];

/**
 * Products relevant to an industry: those whose typical uses mention one of its keywords (or, for
 * an industry without keywords, those in its categories). Interleaved across categories so a
 * short list is not all one kind. Derived, so the client should confirm it (TODO_CONTENT.md).
 */
export function industryProducts(industry: Industry): Product[] {
  const matches = products.filter((p) =>
    industry.keywords.length
      ? p.uses.some((u) => industry.keywords.some((k) => u.toLowerCase().includes(k)))
      : industry.categories.includes(p.category),
  );
  const groups = new Map<CategoryId, Product[]>();
  for (const p of matches) groups.set(p.category, [...(groups.get(p.category) ?? []), p]);
  const lists = [...groups.values()];
  const out: Product[] = [];
  for (let i = 0; out.length < matches.length; i++) for (const list of lists) if (list[i]) out.push(list[i]);
  return out;
}
