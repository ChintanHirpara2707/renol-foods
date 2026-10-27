import { CONFIRM } from "./public";
import { products, productTheme, type Product } from "./products";
import { nav } from "./nav";

// Phone lines and the email address, as supplied by the client.
const contacts: ({ tel: string; display: string } | { mail: string; display: string })[] = [
  { tel: "+919979977396", display: "+91 9979977396" },
  { tel: "+919979977395", display: "+91 9979977395" },
  { tel: "+919979977392", display: "+91 9979977392" },
  { mail: "Info@renolfoods.com", display: "Info@renolfoods.com" },
];
const phones = contacts.filter((c): c is { tel: string; display: string } => "tel" in c);
const emailEntry = contacts.find((c): c is { mail: string; display: string } => "mail" in c);

/** Spelling not confirmed by the client yet (see `confirm.addressSpelling`). */
const ADDRESS_LINE = "Plot No. 616, GIDC, Kerala, Bavla, Gujarat 382220";

const WHATSAPP_NUMBER = "+919979977396";

export const site = {
  name: "Renol Foods",
  legalName: "Renol Foods",
  foundedYear: 2021,
  tagline: "Spray-dried food powders, made in Bavla, Ahmedabad",
  description:
    "Renol Foods is a B2B manufacturer of spray-dried food powders for food processors, industrial bakeries, snack brands, beverage formulators and exporters, based in Bavla, Ahmedabad.",
  address: {
    line: ADDRESS_LINE,
    street: "Plot No. 616, Kerala GIDC",
    city: "Bavla, Ahmedabad",
    state: "Gujarat",
    country: "India",
    countryCode: "IN",
  },
  /** The client's Google Maps share link: every "location" button opens this. */
  mapUrl: "https://maps.app.goo.gl/AvTviu73BBb27tRG7",
  phones,
  /** From the client's contact list; stays hidden if it is ever removed or a placeholder. */
  email: emailEntry?.mail ?? CONFIRM("primary sales email"),
  /** The primary phone line, used for WhatsApp until the client confirms it is WhatsApp-enabled. */
  whatsappNumber: WHATSAPP_NUMBER,
  /** Digits only, for wa.me links. */
  whatsapp: WHATSAPP_NUMBER.replace(/\D/g, ""),
  whatsappMessage: "Hello Renol Foods, I would like to talk about your food powders.",
  /** "[ADD]" until the client provides office hours; hidden publicly. */
  hours: "[ADD]",
  /** Open questions for the client, mirrored in TODO_CONTENT.md. Never rendered. */
  confirm: {
    whatsapp: CONFIRM("it is WhatsApp-enabled"),
    addressSpelling: CONFIRM("address spelling"),
  },
  pending: ["email", "address spelling", "WhatsApp-enabled number", "office hours", "production domain"],
};

/** WhatsApp chat link. Pass a message to override the default (product pages name the product). */
export const whatsappLink = (message: string = site.whatsappMessage): string =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;

/** Phone link for the primary line: tel:+<digits>. */
export const callLink = `tel:${site.phones[0].tel}`;

/** WhatsApp text for a product page: names the product and the shared packaging. */
export const productChatMessage = (p: Product): string =>
  `Hello Renol Foods, I would like to ask about ${p.name} (${p.packaging}).`;

/** The one form on the site: /request-demo (opens WhatsApp, no backend, nothing stored). */
export const DEMO = { label: "Request for Sample", href: "/request-demo" } as const;

/** Link to the demo form; with a slug the form opens with that powder already ticked. */
export const demoLink = (slug?: string): string => (slug ? `${DEMO.href}?product=${encodeURIComponent(slug)}` : DEMO.href);

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
    name: p.name,
    slug: p.slug,
    color: productTheme(p).accent,
    shortDescription: p.summary,
  })),
  workingHours: site.hours,
};
