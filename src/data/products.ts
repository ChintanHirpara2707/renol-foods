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
  name: string;
  cat: ProductCategory;
  category: ProductCategory; // compatibility
  accent: string;
  accentColor?: string; // alias for accent
  glow: string;
  base: string;
  pouch: string;
  powder: string;
  particles: string[];
  spin?: boolean;
  spinFrames?: number;
  framesFolder?: string;
  blurb: string;
  inside: string[];
  uses: string[];
  shortDescription: string;
  longDescription: string;
  ingredients: string;
  applications: string[];
  form: string;
  packagingSizes: string;
  shelfLife: string;
  storage: string;
  specs: ProductSpecs;
}

export const products: ProductItem[] = [
  {
    id: "tomato",
    slug: "tomato-powder",
    name: "Tomato",
    cat: "Vegetable",
    category: "Vegetable",
    accent: "#ff5a4d",
    glow: "#d81a28",
    base: "#1c0507",
    pouch: "#b91c1c",
    powder: "#d94a36",
    particles: ["#ff6b57", "#e11d2a", "#c4162a", "#ff8a73"],
    blurb: "Hot break and cold break tomato powder made with a low-temperature spray drying process.",
    inside: ["Tomatoes", "Silicon dioxide"],
    uses: ["Soups", "Sauces", "Ready dishes", "Seasoning blends"],
    shortDescription: "Rich lycopene profile, vibrant red colour, and intense umami acidity for seasonings and sauces.",
    longDescription:
      "Produced through low-temperature spray drying of select hot break and cold break tomato purees. Engineered to preserve natural lycopene, organic acids, and authentic savory tomato aroma with immediate dispersibility in dry seasoning matrices and sauce preparations.",
    ingredients: "Tomato solids [ADD: confirm anti-caking agent or carrier if spray-dried, e.g. silicon dioxide or maltodextrin %]",
    applications: [
      "Snack seasonings & dusting blends",
      "Instant soup and noodle tastemakers",
      "Ketchup, pasta sauces, and marinades",
      "Dry gravy mixes and culinary premixes",
      "Bakery dough flavoring (focaccia, crackers)",
    ],
    form: "Fine free-flowing powder",
    packagingSizes: "[ADD: Standard 20 kg / 25 kg multi-wall paper bags with LDPE inner liner]",
    shelfLife: "[ADD: 12 or 24 months from manufacturing date in unopened original packaging]",
    storage: "Store in a cool, dry warehouse below 25°C, away from direct sunlight, moisture, and high-humidity areas.",
    specs: {
      moisture: "[ADD: moisture % - typically ≤ 5.0%]",
      particleSize: "[ADD: mesh size - typically 60 - 80 mesh]",
      pH: "[ADD: pH range - typically 4.0 - 4.5]",
      solubility: "[ADD: solubility % in water at 25°C]",
      colour: "Characteristic vibrant natural tomato red",
      aroma: "Characteristic ripe, savory tomato aroma; clean and free from off notes",
    },
  },
  {
    id: "lemon",
    slug: "lemon-powder",
    name: "Lemon",
    cat: "Fruit",
    category: "Fruit",
    spin: true,
    spinFrames: 36,
    framesFolder: "/frames/lemon/",
    accent: "#ffe14a",
    glow: "#7d6200",
    base: "#1a1700",
    pouch: "#b58900",
    powder: "#f1e07a",
    particles: ["#fff176", "#ffd400", "#f2e27a", "#e9c600"],
    blurb: "Spray-dried lemon juice with a concentrated citrus kick and no squeezing.",
    inside: ["Lemon juice concentrate", "Corn syrup solids", "Lemon oil"],
    uses: ["Fish", "Chicken", "Salads", "Marinades", "Baking", "Beverages"],
    shortDescription: "High-citric punch and fresh citrus zest retention for instant drink mixes and marinades.",
    longDescription:
      "Formulated from spray-dried natural lemon juice solids. Captures the authentic sharp citric brightness and delicate aromatic terpene profiles of fresh citrus, delivering clean acidity and clean-label appeal to dry beverage and culinary formulations.",
    ingredients: "Lemon juice solids [ADD: carrier e.g. maltodextrin / lemon oil carrier %]",
    applications: [
      "Instant drink mixes, iced teas, and sports hydration powders",
      "Confectionery, hard candies, and sour gummies",
      "Salad dressing dry blends and poultry / seafood marinades",
      "Snack seasonings (lemon chili, citrus herb seasonings)",
      "Bakery glazes, cake mixes, and lemon tarts",
    ],
    form: "Fine crystalline / spray-dried powder",
    packagingSizes: "[ADD: 20 kg / 25 kg foil-laminated moisture-proof bags]",
    shelfLife: "[ADD: 18 months stored sealed at room temperature]",
    storage: "Store in a cool, dry area below 22°C. Keep tightly sealed in original foil packaging to prevent moisture uptake and aroma volatilization.",
    specs: {
      moisture: "[ADD: moisture % - typically ≤ 4.0%]",
      particleSize: "[ADD: mesh size - 80 - 100 mesh]",
      pH: "[ADD: pH - typically 2.2 - 2.8 in 10% solution]",
      solubility: "[ADD: instant solubility % in cold water]",
      colour: "Pale creamy yellow to light lemon hue",
      aroma: "Crisp, zesty, natural citrus lemon aroma with sharp citric top notes",
    },
  },
  {
    id: "mango",
    slug: "mango-powder",
    name: "Mango",
    cat: "Fruit",
    category: "Fruit",
    accent: "#ffb020",
    glow: "#f27a00",
    base: "#1c0d02",
    pouch: "#c2410c",
    powder: "#f3b94e",
    particles: ["#ffcf4a", "#ff9a1f", "#f2542d", "#f6c667"],
    blurb: "A tangy-sweet fruit powder for North Indian chaats and chutneys, and for smoothies and baking.",
    inside: ["Mango", "Sugar", "Citric acid", "Sulfur dioxide (preservative)", "Sulfites"],
    uses: ["Chaats", "Soups", "Gravies", "Pakoras", "Chutneys", "Smoothies", "Baking"],
    shortDescription: "Distinct tropical sweetness and natural fruit aromatics for desserts, ice creams, and snacks.",
    longDescription:
      "Crafted from choice mango pulp and green mangoes, dried under controlled temperatures. Imparts an authentic tangy-sour fruitiness essential for regional spice mixes, chatpata snack coatings, and culinary dry rubs.",
    ingredients: "Dehydrated mango pulp solids [ADD: confirm specific variant: raw amchur vs. ripe spray-dried]",
    applications: [
      "Traditional spice seasonings, chaat masala, and jaljeera",
      "Extruded snacks, chips, and roasted nut dustings",
      "Chutney premixes and instant culinary gravies",
      "Instant fruit drink mixes and dessert concentrates",
      "Marinades and dry rubs",
    ],
    form: "Fine free-flowing powder",
    packagingSizes: "[ADD: 25 kg food-grade poly-lined kraft bags]",
    shelfLife: "[ADD: 12 months under dry warehousing conditions]",
    storage: "Store sealed in cool, dry conditions. Avoid exposure to ambient humidity to retain peak aroma and flowability.",
    specs: {
      moisture: "[ADD: moisture % - typically ≤ 6.0%]",
      particleSize: "[ADD: mesh size - 60 - 80 mesh]",
      pH: "[ADD: pH value - typically 3.0 - 3.8]",
      solubility: "[ADD: solubility / suspension in water]",
      colour: "Light beige-tan to warm golden-yellow depending on formulation",
      aroma: "Distinct tart, fruity, slightly resinous mango bouquet",
    },
  },
  {
    id: "spinach",
    slug: "spinach-powder",
    name: "Spinach",
    cat: "Vegetable",
    category: "Vegetable",
    accent: "#4ade80",
    glow: "#128a3c",
    base: "#04150a",
    pouch: "#15803d",
    powder: "#5fa046",
    particles: ["#52c46a", "#2f9e44", "#1f7a3a", "#7ad08a"],
    blurb: "Deep green spinach powder that adds colour and nutrition. Made to customer specifications.",
    inside: ["Organic spinach"],
    uses: ["Smoothies", "Juices", "Soups", "Pasta sauces", "Baked goods"],
    shortDescription: "Natural chlorophyll green pigment and delicate earthy profile for pasta, snacks, and health blends.",
    longDescription:
      "Produced by gentle low-temperature drying and fine pulverization of freshly harvested, washed spinach leaves. Retains high concentrations of natural chlorophyll, providing a vibrant clean-label green coloring agent and botanical ingredient.",
    ingredients: "100% dehydrated spinach leaves (Spinacia oleracea) [ADD: confirm single-ingredient pure leaf claim]",
    applications: [
      "Natural clean-label green food colouring for pasta, noodles, and wraps",
      "Snack food extruded pellets and vegetable crisp doughs",
      "Green superfood blends and dietary mixes",
      "Instant soups, vegetable broths, and bakery doughs",
      "Sauces, dips, and culinary seasonings",
    ],
    form: "Micro-pulverized fine green powder",
    packagingSizes: "[ADD: 20 kg / 25 kg light-shielded, moisture-barrier poly-lined bags]",
    shelfLife: "[ADD: 12 months when protected from light and oxygen]",
    storage: "Store in a cool (below 20°C), dark, dry environment. Protection from UV light and oxygen is critical to preserve chlorophyll stability.",
    specs: {
      moisture: "[ADD: moisture % - typically ≤ 6.0%]",
      particleSize: "[ADD: fine mesh - typically 80 - 120 mesh]",
      pH: "[ADD: natural pH range - typically 6.0 - 7.0]",
      solubility: "[ADD: fine dispersion in water / suspension stability]",
      colour: "Intense, deep natural emerald to forest green",
      aroma: "Fresh, earthy, pleasant dried spinach leaf aroma; free from grassy off-odors",
    },
  },
  {
    id: "ginger",
    slug: "ginger-powder",
    name: "Ginger",
    cat: "Spice",
    category: "Spice",
    accent: "#f0c48a",
    glow: "#a8702c",
    base: "#1a1007",
    pouch: "#92602b",
    powder: "#dcbf90",
    particles: ["#e8c58f", "#c79a5b", "#f3e3a8", "#a8773c"],
    blurb: "Warm, bold ginger powder without the peeling and grating.",
    inside: ["Dried ginger"],
    uses: ["Curries", "Stir-fries", "Soups", "Marinades", "Baked goods", "Beverages"],
    shortDescription: "Pungent gingerol warmth and fine solubility for beverage, tea, and seasoning formulations.",
    longDescription:
      "Sourced from cleaned and dried mature ginger rhizomes, finely pulverized to optimize active gingerols and essential volatile oils. Delivers penetrating, pungent spice heat and warm aromatic depth across culinary and functional applications.",
    ingredients: "Dehydrated ginger rhizome (Zingiber officinale) [ADD: confirm single-ingredient purity]",
    applications: [
      "Instant tea premixes, chai masalas, and herbal beverages",
      "Industrial bakery (gingerbread, cookies, spiced cakes)",
      "Seasoning rubs and marinades",
      "Functional wellness shots and immunity blends",
      "Pickles, instant soups, and culinary bases",
    ],
    form: "Fine, free-flowing aromatic powder",
    packagingSizes: "[ADD: 25 kg airtight fiber drums or multi-wall poly-lined kraft bags]",
    shelfLife: "[ADD: 24 months in unopened, sealed packaging]",
    storage: "Store in a cool, dry warehouse. Ginger contains volatile aromatic oils; keep strictly sealed to prevent aroma loss.",
    specs: {
      moisture: "[ADD: moisture % - typically ≤ 8.0%]",
      particleSize: "[ADD: mesh size - 60 - 80 mesh]",
      pH: "[ADD: pH - typically 5.5 - 6.5]",
      solubility: "[ADD: cold / hot water dispersion %]",
      colour: "Pale creamy buff to light warm tan",
      aroma: "Intensely pungent, spicy, and characteristically sharp gingerol aroma",
    },
  },
  {
    id: "tamarind",
    slug: "tamarind-powder",
    name: "Tamarind",
    cat: "Fruit",
    category: "Fruit",
    accent: "#d98b4e",
    glow: "#8f4a18",
    base: "#170a03",
    pouch: "#7c3f14",
    powder: "#9a6a42",
    particles: ["#a8683a", "#8b5a2b", "#c98f5b", "#6b3f1d"],
    blurb: "Concentrated sweet-and-sour tamarind, ready to use with no sticky pods.",
    inside: ["Tamarind", "Modified corn starch"],
    uses: ["Chutneys", "Curries", "Soups", "Tamarind rice", "Sauces", "Desserts"],
    shortDescription: "Authentic tartness and deep tamarind pulp notes for snack dusting and spice blends.",
    longDescription:
      "Manufactured by dehydrating and micro-milling carefully de-seeded tamarind pulp. Delivers an immediate tartaric acid punch balanced with fruity sweetness, providing a free-flowing, clean-handling alternative to sticky tamarind paste.",
    ingredients: "Tamarind pulp solids [ADD: confirm carrier / anti-caking agent if used]",
    applications: [
      "Chaat seasonings, pani puri premixes, and jaljeera",
      "South Asian dry curry powders and rasam / sambar blends",
      "Barbecue sauces, marinades, and chutneys",
      "Savory snack dustings and extruded chips",
      "Beverage concentrate premixes",
    ],
    form: "Free-flowing fine powder",
    packagingSizes: "[ADD: 20 kg / 25 kg airtight barrier bags inside corrugated boxes]",
    shelfLife: "[ADD: 12 months in sealed moisture-barrier packaging]",
    storage: "Keep in a cool, dark, dry facility. Tamarind is naturally hygroscopic; ensure bags are re-sealed immediately after inspection.",
    specs: {
      moisture: "[ADD: moisture % - typically ≤ 6.0%]",
      particleSize: "[ADD: mesh size - 60 - 100 mesh]",
      pH: "[ADD: pH range - typically 2.5 - 3.2]",
      solubility: "[ADD: dispersibility % / insolubles in water]",
      colour: "Natural dark golden-brown to deep tan",
      aroma: "Distinct tart, fruity, and sour tamarind aroma with no fermentation odor",
    },
  },
  {
    id: "caramel",
    slug: "caramel-powder",
    name: "Caramel",
    cat: "Colour & Flavour",
    category: "Colour & Flavour",
    accent: "#d48238",
    glow: "#7c3d10",
    base: "#140903",
    pouch: "#8a4313",
    powder: "#b36628",
    particles: ["#c67d36", "#9c4f17", "#e29d52", "#7a380e"],
    blurb: "Controlled colour intensity and toasted caramel aroma for confectionery, bakery, and beverages.",
    inside: ["Caramelized sugar"],
    uses: ["Bakery", "Biscuits", "Confectionery", "Beverages", "Sauces", "Desserts"],
    shortDescription: "Controlled colour intensity and toasted caramel aroma for confectionery, bakery, and beverages.",
    longDescription:
      "Crafted through strictly monitored caramelization and drying processes to achieve precise visual depth and rich, toasted notes. Provides uniform coloring and appetizing warmth without the handling mess and pump-clogging viscosity of liquid caramel syrups.",
    ingredients: "Caramelized carbohydrate solids [ADD: confirm class / carrier if applicable]",
    applications: [
      "Industrial bakery (cookies, cakes, biscuits, dark breads)",
      "Confectionery fillings, toffees, and chocolates",
      "Powdered beverage mixes, hot chocolates, and malted drinks",
      "Puddings, custards, and ice cream premixes",
      "Culinary sauces, gravies, and seasoning glazes",
    ],
    form: "Uniform free-flowing powder",
    packagingSizes: "[ADD: 25 kg moisture-barrier multi-wall bags]",
    shelfLife: "[ADD: 24 months under recommended storage]",
    storage: "Store in ambient conditions below 25°C. Protect from humidity to prevent caking.",
    specs: {
      moisture: "[ADD: moisture % - typically ≤ 4.0%]",
      particleSize: "[ADD: particle size - 80 - 100 mesh]",
      pH: "[ADD: pH value - typically 4.5 - 6.5]",
      solubility: "[ADD: water solubility % - typically ≥ 98% readily soluble]",
      colour: "Rich golden-brown to dark mahogany",
      aroma: "Sweet, deeply toasted caramel aroma; free of acrid or burnt odor",
    },
  },
  {
    id: "apple",
    slug: "apple-powder",
    name: "Apple",
    cat: "Fruit",
    category: "Fruit",
    accent: "#e0564c",
    glow: "#a8261e",
    base: "#180606",
    pouch: "#99221b",
    powder: "#c94d43",
    particles: ["#e8655b", "#b52f26", "#f28c84", "#8a1d16"],
    blurb: "Mild pectin sweetness and clean fruit finish for cereal coatings, infant foods, and baked goods.",
    inside: ["Dried apples"],
    uses: ["Cereal bars", "Baby foods", "Bakery fillings", "Snack coatings", "Beverages"],
    shortDescription: "Mild pectin sweetness and clean fruit finish for cereal coatings, infant foods, and baked goods.",
    longDescription:
      "Manufactured by dehydrating choice sound apples under gentle temperature controls to retain natural pectin, balanced fruit sugars (fructose), and delicate malic acidity. Serves as a versatile natural sweetening agent, bulking fruit solid, and clean-label flavor enhancer.",
    ingredients: "Dehydrated apple solids [ADD: confirm anti-caking agent or single-ingredient status]",
    applications: [
      "Infant cereals, baby foods, and weaning porridge premixes",
      "Breakfast cereals, granola coatings, and cereal bars",
      "Industrial bakery fillings, pie premixes, and muffin mixes",
      "Dry fruit smoothie powders and dairy flavorings",
      "Clean-label fruit sweetening and moisture-retention in baked goods",
    ],
    form: "Fine free-flowing powder",
    packagingSizes: "[ADD: 20 kg / 25 kg moisture-barrier poly-lined bags]",
    shelfLife: "[ADD: 18 months from production date]",
    storage: "Store in a cool, well-ventilated dry warehouse below 22°C. Keep protected from moisture to prevent hygroscopic clumping.",
    specs: {
      moisture: "[ADD: moisture % - typically ≤ 5.0%]",
      particleSize: "[ADD: mesh size - 60 - 80 mesh]",
      pH: "[ADD: natural pH range - typically 3.5 - 4.5]",
      solubility: "[ADD: dispersion / rehydration properties in water]",
      colour: "Natural pale cream to light golden tan",
      aroma: "Gentle, sweet, fresh-cut dried apple aroma; free from fermented or oxidized notes",
    },
  },
];

products.forEach((p) => {
  p.accentColor = p.accent;
});
