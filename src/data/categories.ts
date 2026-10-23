import { products } from "./products";

export const CATEGORY_IDS = ["fruit", "vegetable", "food-colour", "dairy", "seasoning", "beverage"] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

const definitions: { id: CategoryId; name: string }[] = [
  { id: "fruit", name: "Fruit Powders" },
  { id: "vegetable", name: "Vegetable Powders" },
  { id: "food-colour", name: "Food Colour Powders" },
  { id: "dairy", name: "Dairy Powders" },
  { id: "seasoning", name: "Seasoning Powders" },
  { id: "beverage", name: "Beverage Powders" },
];

export interface Category {
  id: CategoryId;
  /** URL-safe key, same as id. */
  slug: string;
  name: string;
  /** Number of products in the category, computed from products.ts. */
  count: number;
}

export const categories: Category[] = definitions.map((d) => ({
  ...d,
  slug: d.id,
  count: products.filter((p) => p.category === d.id).length,
}));

export const categoryById = (id: CategoryId): Category => categories.find((c) => c.id === id)!;
