/**
 * Factory and machinery photos. `source` is the original JPG the client placed in
 * public/images/industries/; `npm run factory-images` writes the web-ready WebP to `image`.
 * Captions only describe what is visible in each photo; the client should confirm them
 * (TODO_CONTENT.md).
 */
export interface FactoryPhoto {
  slug: string;
  /** Original file name in public/images/industries/. */
  source: string;
  /** Optimised image used on the site. */
  image: string;
  alt: string;
  caption: string;
}

const photo = (slug: string, source: string, alt: string, caption: string): FactoryPhoto => ({
  slug,
  source,
  image: `/images/factory/${slug}.webp`,
  alt,
  caption,
});

export const factoryPhotos: FactoryPhoto[] = [
  photo("factory-building", "24981.jpg", "Outside view of the factory building", "The factory building"),
  photo("production-hall", "24977.jpg", "Production hall with stainless steel vessels and a conveyor", "Production hall with a conveyor and stainless steel vessels"),
  photo("processing-vessels", "24979.jpg", "Stainless steel processing vessels and pipework on a platform", "Stainless steel processing vessels"),
  photo("hopper-equipment", "24975.jpg", "Stainless steel hopper and equipment on the factory floor", "Stainless steel hopper and equipment"),
  photo("sifting-machine", "24983.jpg", "Stainless steel machine on the production floor", "Machine on the production floor"),
  photo("warehouse", "24985.jpg", "Warehouse with cartons stacked on pallets", "Warehouse with cartons on pallets"),
];
