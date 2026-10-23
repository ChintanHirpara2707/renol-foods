export interface NavLink {
  label: string;
  href: string;
}

export const nav = {
  /** Desktop header and mobile menu. */
  primary: [
    { label: "Products", href: "/products" },
    { label: "Industries", href: "/industries" },
    { label: "Manufacturing", href: "/manufacturing" },
    { label: "Quality", href: "/quality" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ] satisfies NavLink[],
  /** Mobile menu (below primary) and footer. */
  secondary: [
    { label: "Private Label", href: "/private-label" },
    { label: "Export & Logistics", href: "/export" },
    { label: "Resources", href: "/downloads" },
    { label: "FAQ", href: "/faq" },
  ] satisfies NavLink[],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookies", href: "/cookies" },
  ] satisfies NavLink[],
};
