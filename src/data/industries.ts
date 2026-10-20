export interface IndustryItem {
  slug: string;
  name: string;
  description: string;
  relevantProductSlugs: string[];
  keyBenefits: string[];
}

export const industries: IndustryItem[] = [
  {
    slug: "bakery",
    name: "Bakery",
    description:
      "Heat-stable natural colors, aromatic depth, and fruit solids for biscuits, crackers, cakes, and bread doughs.",
    relevantProductSlugs: [
      "caramel-powder",
      "apple-powder",
      "ginger-powder",
      "tomato-powder",
      "spinach-powder",
    ],
    keyBenefits: [
      "Consistent color without artificial caramel IV dyes",
      "Natural moisture retention via apple pectin fractions",
      "Clean dough incorporation with no liquid phase disruption",
    ],
  },
  {
    slug: "beverages",
    name: "Beverages",
    description:
      "Rapidly dispersible fruit and spice powders for instant drink mixes, iced teas, wellness blends, and chai premixes.",
    relevantProductSlugs: [
      "lemon-powder",
      "ginger-powder",
      "mango-powder",
      "apple-powder",
      "caramel-powder",
    ],
    keyBenefits: [
      "Instant cold-water and hot-water solubility without clump formation",
      "True-to-fruit citric brightness and natural essential oil volatiles",
      "High carrier-efficiency for commercial high-speed packaging lines",
    ],
  },
  {
    slug: "snacks",
    name: "Snacks",
    description:
      "Uniform particle sizing and electrostatic adhesion properties for topical seasoning on extruded pellets, chips, and roasted nuts.",
    relevantProductSlugs: [
      "tomato-powder",
      "tamarind-powder",
      "mango-powder",
      "lemon-powder",
      "spinach-powder",
    ],
    keyBenefits: [
      "Controlled mesh size for superior adhesion to fried and baked substrates",
      "Sharp, mouthwatering acidity from natural tartaric, citric, and malic acids",
      "Vibrant visual dusting appeal with no synthetic azo dye additives",
    ],
  },
  {
    slug: "soups-and-sauces",
    name: "Soups & Sauces",
    description:
      "Instant viscosity, rich natural umami, and acidic balance for dry soup mixes, noodle seasonings, and culinary marinades.",
    relevantProductSlugs: [
      "tomato-powder",
      "tamarind-powder",
      "spinach-powder",
      "ginger-powder",
      "caramel-powder",
    ],
    keyBenefits: [
      "Immediate reconstitution in hot culinary broths without lumping",
      "Rich savory umami profile from natural tomato glutamate and lycopene",
      "Clean-handling replacement for perishable culinary pastes",
    ],
  },
  {
    slug: "seasonings-and-spice-blends",
    name: "Seasonings & Spice Blends",
    description:
      "Free-flowing tart, herbal, and pungent building blocks for industrial curry powders, chaat masalas, and meat rubs.",
    relevantProductSlugs: [
      "tamarind-powder",
      "mango-powder",
      "ginger-powder",
      "tomato-powder",
      "lemon-powder",
    ],
    keyBenefits: [
      "Low moisture content preventing moisture transfer and caking in blended spice tins",
      "Standardized acidity metrics ensuring identical batch flavor profiles",
      "Hygienic microbial control compared to whole raw spice grinding",
    ],
  },
  {
    slug: "nutraceuticals",
    name: "Nutraceuticals",
    description:
      "Concentrated natural botanical powders rich in chlorophyll, gingerols, and fruit polyphenols for capsules, tablets, and health shakes.",
    relevantProductSlugs: [
      "spinach-powder",
      "ginger-powder",
      "apple-powder",
      "lemon-powder",
    ],
    keyBenefits: [
      "Bioactive phytochemical preservation via gentle thermal processing",
      "Clean-label single-ingredient botanical raw materials",
      "Micro-milled particle profiles suitable for direct tablet compression or capsule filling",
    ],
  },
];
