export interface NavLink {
  label: string;
  href: string;
  badge?: string;
}

export interface SiteConfig {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  foundedYear: number;
  location: {
    city: string;
    state: string;
    country: string;
    fullAddress: string;
  };
  contact: {
    phones: string[];
    displayPhones: string[];
    email: string;
    whatsappNumber: string;
    whatsappMessage: string;
  };
  navigation: NavLink[];
  products: {
    name: string;
    slug: string;
    color: string;
    shortDescription: string;
  }[];
  workingHours: string;
}

export const siteConfig: SiteConfig = {
  name: "Renol Foods",
  legalName: "Renol Foods",
  tagline: "Precision Dehydrated & Spray-Dried Food Powders for Global Industry",
  description:
    "Manufacturer of premium industrial-grade fruit, vegetable, and culinary powders in Bavla, Ahmedabad. Supplying bakeries, snack brands, beverage formulators, and food exporters worldwide.",
  foundedYear: 2021,
  location: {
    city: "Bavla, Ahmedabad",
    state: "Gujarat",
    country: "India",
    fullAddress: "Plot No. 616, Kerala GIDC, Bavla, Ahmedabad [CONFIRM spelling]",
  },
  contact: {
    phones: ["+919979977396", "+919979977395", "+919979977392"],
    displayPhones: ["+91 9979977396", "+91 9979977395", "+91 9979977392"],
    email: "[CONFIRM: info@renolfoods.com or sales@renol.com]",
    whatsappNumber: "[CONFIRM: WhatsApp number with country code, e.g. 919979977396]",
    whatsappMessage: "Hello Renol Foods, I am requesting technical specifications and sample pricing for food powders.",
  },
  navigation: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Products", href: "/products" },
    { label: "Industries", href: "/industries" },
    { label: "Quality", href: "/quality" },
    { label: "Contact", href: "/contact" },
  ],
  products: [
    {
      name: "Tomato Powder",
      slug: "tomato-powder",
      color: "#D63A2A",
      shortDescription: "Rich lycopene profile, vibrant red colour, and intense umami acidity for seasonings and sauces.",
    },
    {
      name: "Tamarind Powder",
      slug: "tamarind-powder",
      color: "#6B3A1E",
      shortDescription: "Authentic tartness and deep tamarind pulp notes for snack dusting and spice blends.",
    },
    {
      name: "Caramel Powder",
      slug: "caramel-powder",
      color: "#8B4513",
      shortDescription: "Controlled colour intensity and toasted caramel aroma for confectionery, bakery, and beverages.",
    },
    {
      name: "Lemon Powder",
      slug: "lemon-powder",
      color: "#F2C230",
      shortDescription: "High-citric punch and fresh citrus zest retention for instant drink mixes and marinades.",
    },
    {
      name: "Mango Powder",
      slug: "mango-powder",
      color: "#E8A317",
      shortDescription: "Distinct tropical sweetness and natural fruit aromatics for desserts, ice creams, and snacks.",
    },
    {
      name: "Spinach Powder",
      slug: "spinach-powder",
      color: "#3F7D3A",
      shortDescription: "Natural chlorophyll green pigment and delicate earthy profile for pasta, snacks, and health blends.",
    },
    {
      name: "Ginger Powder",
      slug: "ginger-powder",
      color: "#C98A3B",
      shortDescription: "Pungent gingerol warmth and fine solubility for nutraceutical, tea, and seasoning formulations.",
    },
    {
      name: "Apple Powder",
      slug: "apple-powder",
      color: "#B5322B",
      shortDescription: "Mild pectin sweetness and clean fruit finish for cereal coatings, infant foods, and baked goods.",
    },
  ],
  workingHours: "[CONFIRM: Monday - Saturday 9:00 AM - 6:00 PM IST]",
};
