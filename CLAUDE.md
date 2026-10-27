# Renol Foods: project rules

## What this is
B2B food powder manufacturer, Bavla, Ahmedabad, India (founded 2021). Products: Tomato, Tamarind, Caramel, Lemon, Mango, Spinach, Ginger, Apple powder. Customers: food manufacturers, bakeries, beverage and snack brands, exporters.
GOAL: lead generation by direct contact, NOT online sales. No cart, prices, checkout or forms. See the contact buttons below.

## Stack (fixed)
Astro (static output), Tailwind CSS 4, TypeScript, GSAP + ScrollTrigger, Lenis. No backend or database, and no forms. Deploy: Cloudflare Pages or Netlify. Dev server: `astro dev --background` (manage with `astro dev stop|status|logs`).

## Never touch
## Powder Studio reference
The studio follows the client's prototype `reference/Fruit Powder Studio (prototype).html`: a transparent photo per fruit (`public/images/fruit/<name>.webp`, extracted by `scripts/extract-fruit-photos.mjs`; replace a fruit by overwriting its file), the squash-then-crush animation that turns the photo's own pixels into powder, and the circular reveal into the product detail. There is no WebGL and no SVG fruit art any more. Studio products (7): Beetroot, Blueberry, Strawberry, Pomegranate, Orange, White Guava, Apple. `reference/powder-studio.html` is the older shader prototype and is no longer used.

## Design direction
Follows the client's reference: dark base (#0b0b0d), white text, Bricolage Grotesque (display) + Instrument Sans (body) via Fontsource, pill buttons, ghost outlined product names, per-product accent/glow colours. Premium, clean, trustworthy. Tokens live in `src/styles/tokens.css`.

## Standards (every page)
- Fully responsive, mobile-first, tested at 360, 390, 768, 1024, 1280, 1440, 1920 and 1366x636. No horizontal scroll, no overlap, no clipped text. Use svh/dvh not vh. Tap targets >= 44px. Never hide overflow on html/body to mask a bug.
- Never hijack page scroll. Normal vertical scroll always works. Overlays lock scroll only while open and always unlock. Use the `scrollLock` API in `src/scripts/scroll.ts` (named locks; `unlockAll()` runs on pagehide). Scrollable overlays carry `data-lenis-prevent`.
- Accessibility WCAG AA: semantic HTML, keyboard use, focus states, alt text, aria on menus/dialogs, prefers-reduced-motion respected everywhere.
- SEO: server-rendered content (never JS-only), unique title/description, canonical, Open Graph, sitemap, robots, JSON-LD (Organization, Product, FAQPage). Product JSON-LD never carries prices or offers.
- Performance: Lighthouse mobile 90+ on every category. WebP/AVIF, lazy loading, explicit image sizes, fonts self-hosted.
- Animations 0.3 to 0.8 s, only where they help. Provide reduced-motion and low-power fallbacks. Cap canvas DPR at 2 and pause off-screen/hidden-tab loops. Clean up on route change and re-init via `onPageLoad()` (`src/scripts/lifecycle.ts`).
- Strict CSP (`public/_headers`): no inline scripts, no CDN scripts. Every script lives in `src/scripts/` or a component `<script>` (bundled, never inlined: `assetsInlineLimit: 0`).

## Call-to-action rules (do not regress)
No "Request a Sample" / quote buttons and no forms anywhere. Wording: "Chat on WhatsApp" and "View More Products" (constants in `src/data/cta.ts`). Contact links come from `src/data/site.ts` (`whatsappLink()`, `callLink`, `site.mapUrl`) and are rendered by `ContactStack` (fixed, all pages) and `ChatLink`.

## Content architecture
All content lives in `/src/data/*.ts` (site, products, industries, process, faq, cta, nav). Components never hardcode copy. Contact: +91 9979977396, +91 9979977395, +91 9979977392. Email and address spelling are "[CONFIRM]" until the client confirms.

## Dependencies: security rules
Only the allowed list. Ask before adding anything else.
Allowed: astro, tailwindcss, @tailwindcss/vite (approved, required by Tailwind 4), typescript, gsap (incl. ScrollTrigger), lenis, @fontsource/*, sharp, @astrojs/sitemap, @astrojs/check, playwright (dev), @axe-core/playwright (dev), lighthouse (dev).
Rules: install only from the official npm registry by exact package name (check for typosquats), pin exact versions (`--save-exact`), commit the lockfile, install with `--ignore-scripts`, run `npm audit` after installs and report results, no CDN `<script>` tags, no copy-pasted minified code, no packages with unknown maintainers or install scripts, strict CSP + security headers (`_headers`).

## Workflow
Work on branch `redesign-v2`. Commit after each phase. After each phase run `npm run build`, `npm run check` and `npm run qa`, and report. Keep `TODO_CONTENT.md` and `RESPONSIVE_REPORT.md` up to date. `npm run qa` screenshots every route at 360, 390, 768, 1024, 1366x636 and 1440 and 1920, fails on horizontal overflow, runs axe, and scans for leaked placeholders and form controls; output in `qa-output/` (gitignored).

## Token discipline
- Do not re-read the whole repo. Read only files named in the task plus what you must edit.
- Never open screenshots or images unless an automated check fails. Prefer DOM measurements and text output.
- Batch related edits into few tool calls. Do not rewrite whole files to change a few lines.
- Max 2 fix attempts per issue, then stop and report what is blocking.
- Do not run full QA after every change. Run it once at the end of a phase, on the pages changed.
- Keep replies short: what changed, what to check, what is next.



## Goal (updated)
Lead generation by direct contact. NO forms anywhere. No "Request a Sample" label. Contact actions are three buttons: WhatsApp chat, Google Maps location, tap-to-call.
The only form is /request-demo (WhatsApp-based, no backend, no data stored).

## Contact buttons (site-wide, floating stack bottom-right, all pages, all devices)
1. WhatsApp: https://wa.me/<digits>?text=<encoded message>. On product pages the message names the product.
2. Map: opens the Google Maps URL from site.ts (mapUrl).
3. Call: tel:+<digits>.
Compact 48px round buttons with labels as aria-label and visible tooltip on desktop; respect safe-area insets; never cover content (page bottom padding). Header has one "Chat on WhatsApp" button (>=1024px). Remove: Web3Forms, /request-quote, sample dialogs, mobile bottom bar, all form markup, PUBLIC_WEB3FORMS_KEY.

## Licences
Show "FSSAI Licensed" and "ISO 22000:2018 Certified" as text badges. Licence numbers/certificate files are "[ADD]" placeholders, hidden until provided. Never use official logos until the client supplies them.

## Packaging (fixed for every product)
20 kg corrugated box. Show this on every product page and card. Inner packing details: "[CONFIRM]" hidden.

## Studio products (animated, 7 only)
Beetroot, Apple, Pomegranate, Blueberry, Strawberry, Orange, White Guava. Everything else appears only in the Products catalogue.

## Images
All images are local placeholders generated by script, named by slug. The client replaces them by overwriting files with the same names. No hotlinked images.

## Mobile performance
Animate only transform/opacity. Lenis only on fine-pointer devices. The crush effect scales its grain count by device tier (src/scripts/studio/quality.ts). Respect reduced motion.