export interface Industry {
  slug: string;
  name: string;
  /** One line. */
  description: string;
  /** Image file is supplied by the client/design team (see TODO_CONTENT.md). */
  image: string;
}

const kebab = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const make = (name: string, description: string): Industry => {
  const slug = kebab(name);
  return { slug, name, description, image: `/images/industries/${slug}.webp` };
};

export const industries: Industry[] = [
  make("Bakery & Confectionery", "Fruit, dairy and colour powders for bakery products and confectionery."),
  make("Beverages & Juices", "Fruit and beverage powders for drink mixes and juices."),
  make("Snacks & Seasonings", "Vegetable, fruit and seasoning powders for snack coatings and seasoning blends."),
  make("Soups, Sauces & Ready Mixes", "Vegetable and savoury powders for soups, sauces and ready-to-cook mixes."),
  make("Dairy & Ice Cream", "Fruit and dairy powders for ice cream, frozen desserts and dairy products."),
  make("Nutraceuticals & Health Foods", "Fruit and vegetable powders for health food and nutraceutical formulations."),
];
