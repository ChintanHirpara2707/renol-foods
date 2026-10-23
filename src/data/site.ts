import { CONFIRM } from "./public";
import { products } from "./products";
import { nav } from "./nav";


const phones = [
  { tel: "+919979977396", display: "+91 9979977396" },
  { tel: "+919979977395", display: "+91 9979977395" },
  { tel: "+919979977392", display: "+91 9979977392" },
];

export const site = {
  name: "Renol Foods",
  legalName: "Renol Foods",
  foundedYear: 2021,
  tagline: "Dehydrated and spray-dried food powders, made in Bavla, Ahmedabad",
  description:
    "Renol Foods is a B2B manufacturer of dehydrated and spray-dried food powders for food processors, industrial bakeries, snack brands, beverage formulators and exporters, based in Bavla, Ahmedabad.",
  address: {
    street: "Plot No. 616, Kerala GIDC",
    city: "Bavla, Ahmedabad",
    state: "Gujarat",
    country: "India",
    countryCode: "IN",
  },
  phones,
  /** Not confirmed by the client: hidden until replaced with a real value. */
  email: CONFIRM("primary sales email"),
  /** The primary phone line is used for WhatsApp until a dedicated number is confirmed. */
  whatsapp: phones[0].tel.replace(/\D/g, ""),
  whatsappMessage: "Hello Renol Foods, I would like to talk about your food powders.",
  hours: CONFIRM("office hours"),
  /** Open questions for the client, mirrored in TODO_CONTENT.md. */
  pending: ["email", "address spelling", "dedicated WhatsApp number", "office hours", "production domain"],
};

/** Compatibility shape for pages that predate the redesign. Prefer `site`. */
export const siteConfig = {
  name: site.name,
  legalName: site.legalName,
  tagline: site.tagline,
  description: site.description,
  foundedYear: site.foundedYear,
  location: {
    city: site.address.city,
    state: site.address.state,
    country: site.address.country,
    fullAddress: `${site.address.street}, ${site.address.city}, ${site.address.state}`,
  },
  contact: {
    phones: phones.map((p) => p.tel),
    displayPhones: phones.map((p) => p.display),
    email: site.email,
    whatsappNumber: site.whatsapp,
    whatsappMessage: site.whatsappMessage,
  },
  navigation: [{ label: "Home", href: "/" }, ...nav.primary],
  products: products.map((p) => ({
    name: p.fullName,
    slug: p.slug,
    color: p.accent,
    shortDescription: p.shortDescription,
  })),
  workingHours: site.hours,
};
