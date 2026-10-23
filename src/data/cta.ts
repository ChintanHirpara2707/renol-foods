/**
 * The only call to action on the site. Render it with <CtaButton placement="..." />.
 * Allowed placements (see CLAUDE.md): header (>=1024px), hero (one), closing (one),
 * bar (mobile bottom bar, <768px).
 */
export const CTA = {
  label: "Request a Sample",
  href: "/request-sample",
} as const;

export type CtaPlacement = "header" | "hero" | "closing" | "bar";
