# AUDIT.md — Renol Foods (branch `redesign-v2`)

Read-only audit of the current build. No application code was changed. Date: 2026-10-23.
Method: static scan of `src/`, `public/`, config and data; `npm run build`; runtime checks in a real browser against the dev server (page scroll, horizontal overflow, mobile menu, text scan for `&amp;`, `[ADD]`, `[CONFIRM]`).

---

## 0. Things in the brief that do not match the repo

| Brief says | Actual state |
| :-- | :-- |
| "Read CLAUDE.md first" | **`CLAUDE.md` does not exist.** Only `AGENTS.md` (Astro dev notes) and `PROJECT_BRIEF.md`. The rules pasted in chat are not saved in the repo. |
| `/reference/powder-studio.ORIGINAL.html` | **Not present.** `reference/` holds `powder-studio.html` (736 KB, contains the `lemonFrames` base64 line), `clean.html` (same file with that line removed, 1393 lines) and `cleaned-reference.txt`. I used `clean.html`. |
| Logo at `/public/images/logo.png` | File is **`/public/images/Logo.png`** (capital L), PNG 436 × 200 px, 32 KB. Case matters on Cloudflare/Netlify (Linux). It is a wide wordmark ("RENOL – A NAME OF TRUST", red), so a square favicon needs a crop or a separate mark. |
| Env var `PUBLIC_WEB3FORMS_KEY` | Code and brief use `PUBLIC_WEB3FORMS_ACCESS_KEY`. |
| Product pages do not scroll | **Not reproducible.** `/products/lemon-powder` scrolls normally (scrollY moved to 600; Lenis active). The page uses a normal-flow hero (`min-h-[100svh]`), not a fixed wrapper. |
| `&amp;` in headings | **Not reproducible.** No `&amp;` text on any of the 20 URLs tested; none in `dist/`. |
| Mobile menu not working | **Unconfirmed / probably still broken** (see §3). Open/close logic runs and `aria-expanded` toggles, but the drawer renders clipped in the emulated 390 px viewport and its measured position (x = 390) disagrees with where it paints. Needs a Playwright retest on a real viewport. |
| Content overlapping at 1366×636 | **Partly confirmed:** the cookie notice covers the product hero's content at 1366×636. Other pages had no horizontal overflow, but I did not test every section visually. |
| "Request Sample" repeated everywhere | Confirmed: "Request a Sample" appears 45× in `src`; 3–5 visible CTAs per page. |
| Placeholder `[ADD]`/`[CONFIRM]` visible | Confirmed on `/` and `/products` and `/downloads` (visible text scan). |
| Invented claims | Confirmed, see §4. (`cleanroom`, "free samples" and "100% COA" are **not** in the current text; others are.) |

---

## 1. Pages and routes (27 built)

| Route | File | Notes |
| :-- | :-- | :-- |
| `/` | `pages/index.astro` (721 lines) | Powder Studio first screen, then trust bar, process, industries, FAQ. Own inline GSAP/ScrollTrigger script. |
| `/products` | `pages/products.astro` | Catalog. Not filterable. |
| `/products/[slug]` ×8 | `pages/products/[slug].astro` (438 lines) | tomato, lemon, mango, spinach, ginger, tamarind, caramel, apple. |
| `/about`, `/industries`, `/manufacturing`, `/quality`, `/private-label`, `/export`, `/downloads`, `/faq`, `/contact` | one file each | All exist. |
| `/request-quote`, `/quote` | `request-quote.astro`, `quote.astro` (5-line redirect/duplicate) | Single-step form. `/quote` is a duplicate route (same title/content). |
| `/privacy`, `/terms`, `/cookies` | one file each | |
| `/legal/privacy`, `/legal/terms` | 5-line duplicates | Duplicate routes of `/privacy` and `/terms`. |
| `/404` | `404.astro` | |

Missing vs. requested sitemap: filterable Products, multi-step Request a Sample, Resources hub naming. No `robots.txt`, no `sitemap-index.xml`, no `_headers`.

## 2. Components and layouts

| File | Status |
| :-- | :-- |
| `layouts/BaseLayout.astro` | Used by all pages. Sets meta, JSON-LD, Lenis. |
| `layouts/Layout.astro` | Astro starter leftover; **unused**. |
| `Header.astro` (405 lines) | Used. Logo image, desktop nav, mobile drawer. |
| `Footer.astro`, `WhatsAppButton.astro`, `MobileBottomBar.astro`, `CookieNotice.astro`, `SectionHeading.astro` | Used. |
| `studio/PowderStudio.astro` (1402 lines) + `scripts/studio/*.ts` (carousel, detail, spin, powder-fx, index) | Used on `/`. Closest thing to the reference. Large, mixes markup, CSS and global styles. |
| `studio/FruitDefs.astro` | Used only by product page. |
| `hero/Hero.astro`, `hero/Hero3DScene.astro` (714 lines), `hero/HeroContent.astro` | **Dead code.** Not used by any page. Hero3DScene imports `three` and draws an "RF" mark on a canvas. |
| `Welcome.astro`, `assets/astro.svg`, `assets/background.svg` | Astro starter leftovers, unused. |
| `StickyDesktopQuoteButton.astro` | Unused; only a stale CSS selector in `[slug].astro` refers to it. |
| `CookieNotice.astro` | Used, but large enough to cover content on short viewports. |

Data (`src/data/*.ts`): `site`, `products`, `industries`, `process`, `faq`, `index`. Good start, but copy is still hard-coded in `index.astro` (FAQ array), `faq.astro`, `export.astro` (container table), `downloads.astro`, `quality.astro`, `about.astro`. `site.ts` duplicates product short descriptions already in `products.ts`.

## 3. What is broken or fragile

1. **Mobile drawer.** At 390×844 the drawer paints clipped (right side cut off). Script state is correct, geometry is not. Retest needed; likely a layout issue (`fixed` + `w-[min(85vw,24rem)]` + `100dvh`) interacting with global `html, body { overflow-x: hidden; max-width: 100vw }`.
2. **Global `overflow-x: hidden` on `html, body`** (`global.css`). It hides real horizontal-overflow bugs instead of fixing them, and can break `position: sticky`. `!important` overflow rule at `global.css:74`.
3. **Cookie notice** overlaps hero content at 1366×636 (seen in a screenshot). Its interaction with the mobile bottom bar is untested.
4. **Canonical URL is `http://localhost:4321/`** in the built HTML: `site` is not set in `astro.config.mjs`. Sitemap and OG URLs will be wrong too.
5. **OG image is the logo** (`/images/Logo.png`, 436×200). Too small for social cards.
6. **Duplicate routes** (`/quote`, `/legal/*`) with the same content; no redirect or canonical.
7. **Dead `three` dependency** (≈1 MB source, not on allowed list) kept only for dead code.
8. **`astro:page-load` / reinit**: scripts use `astro:page-load`, but no `ClientRouter` is installed, so that event fires once; cleanup on route change is moot today but will matter if View Transitions are adopted.
9. **Studio on small viewports** (1366×636): `h-[100svh] min-h-[640px]` means the studio is taller than a 636 px viewport; the scroll cue and ring may sit under the fold. First-screen composition needs a short-viewport layout.
10. **Studio has 8 products in data but the reference art covers 6** (no Caramel or Apple fruit illustration in the reference). The studio needs two new fruit/pouch illustrations.
11. **`appmap.log`** (76 KB) is committed and not gitignored.
12. **Only `Request a Sample` as label** is mostly followed, but `Quote` appears 11× (page titles, `request-quote` slug, form copy, footer).

## 4. Invented, unverified or placeholder content

Everything below must be removed, rewritten as neutral fact, or moved to `TODO_CONTENT.md` and hidden.

**Visible placeholder text**
- Home trust bar: `[FSSAI Central Lic. - Pending Verification]`, `[ISO 22000 / HACCP - Verification Slot]`, "Compliance Placeholders Pending Final Renol Audits" (`index.astro:50–67`).
- FAQ answers contain `[ADD: …]` in MOQ, shelf life, storage, lead time, particle size, shipping docs, packaging (`faq.ts`, `index.astro` FAQ array, `faq.astro`).
- `products.ts`: every spec (moisture, particle size, pH, solubility, packaging, shelf life, ingredients) is an `[ADD: … typically …]` string for all 8 products. They should be hidden; the "typically …" values in them are guesses.
- `site.ts`: email and WhatsApp number are `[CONFIRM …]`; address has `[CONFIRM spelling]`.

**Claims with no source in the brief**
- "Lot-wise COA provided" / "COA provided" on product cards and pages (`[slug].astro:228`, `products.astro:98`), and a "Sample COA Technical Template" download (`downloads.astro`).
- Product JSON-LD `AggregateOffer` / `PriceSpecification` with "B2B commercial bulk pricing upon specification inquiry" (`[slug].astro:76`). Contradicts "no prices".
- "nitrogen-flushed foil pouches" (`private-label.astro:78`).
- "Engineered with modern stainless steel processing and drying systems" (`about.astro:66`); "operates specialized dehydration and spray drying production lines" (`about.astro:40`).
- Export page: dispatch via Mundra and Pipavav ports, ISPM-15 pallets, 20 ft = "10 to 12 Metric Tonnes", 40 ft = "22 to 24 Metric Tonnes", "Estimated Capacity" column (`export.astro`).
- Particle-size options "40–60 mesh … 80–120 mesh" as offered services (FAQ, quality, private-label, request form dropdown).
- "Plant Hours: Monday – Saturday 9:00 AM – 6:00 PM (IST)" hard-coded as fallback (`contact.astro:102`).
- "Evaluation sample packets (typically 200 g to 500 g)" (index FAQ).
- "We welcome technical representatives … site audit" (index FAQ) — a policy statement, unconfirmed.
- Spinach `inside: ["Organic spinach"]`, Mango "Sulfur dioxide/Sulfites" — these came from the client reference; flagged in `TODO_CONTENT.md` already, still need sign-off before display.
- Product ingredient text such as "Silicon dioxide", "Corn syrup solids", "Modified corn starch" comes from the reference prototype; unverified.
- Tagline and hero copy ("Precision", "Engineered", "premium industrial-grade") are style claims; keep only if the client agrees.

**Confirmed real (from the brief)**: company name, founded 2021, address (spelling to confirm), Bavla/Ahmedabad, three phone numbers, the 8 product names, the customer types.

## 5. Performance and accessibility risks

**Performance**
- Lenis runs a permanent `requestAnimationFrame` loop on every page and, with `smoothWheel: true`, intercepts the wheel. That sits uneasily with the "never hijack scroll" rule even though scrolling still works.
- GSAP + ScrollTrigger loaded on home and product pages; `three` (dead) in dependencies.
- 36 lemon frames at `/public/frames/lemon/*.webp` (1.2 MB total) plus a second folder `frames/lemon-powder/`; need preload strategy, explicit sizes, and no frame loading on non-home pages.
- Images: logo is a PNG used at several sizes; no `<Image>`/`sharp` pipeline; `loading="lazy"` not used anywhere.
- Fonts: 5 weights self-hosted via Fontsource (OK). `@fontsource-variable/inter` and `playfair-display` are installed but not imported (unused).
- Lighthouse has not been run; no dev tooling installed (playwright, axe, lighthouse).

**Accessibility**
- Good: skip link, `aria-expanded` on menu, focus return to the toggle, `Escape` closes menu, reduced-motion handling in most scripts, `:focus-visible` styles on studio cards.
- Risks: unconfirmed drawer focus trap; cookie notice focus handling; studio carousel keyboard flow and detail dialog (`aria-modal`, focus trap, scroll lock) need testing; `text-white/40` and below on dark fails AA for body text (46% white on `#0b0b0d` ≈ 4.7:1 passes, 40% ≈ 3.9:1 does not); `placeholder` colours need a check; canvas effects not hidden for reduced motion everywhere; the `<table>`s use `min-w-[540px]` (works inside `.table-responsive`, needs focus access for keyboard scroll).
- Not tested yet: axe scan, keyboard walkthrough, screen-reader names for studio controls.

## 6. Animation libraries in use

| Tool | Where | Verdict |
| :-- | :-- | :-- |
| **GSAP** (core) | `scripts/studio/*`, `index.astro`, `Hero3DScene.astro` | Needed for studio (ring, reveal). Allowed. |
| **ScrollTrigger** | `index.astro`, dead `Hero3DScene` | Allowed; use sparingly, or replace with CSS scroll-driven animations. |
| **Lenis** | `BaseLayout.astro` (all pages) | Allowed, but smooth-scroll is optional and risky; plan makes it opt-in or removes it. |
| **three** | dead `Hero3DScene.astro` only | **Not allowed; remove.** |
| Hand-written Canvas 2D | `powder-fx.ts` (powder dissolve) and `spin.ts` (lemon frames) | Keep; matches reference. DPR capped at 2, pauses on `visibilitychange` (good). |
| CSS transitions / keyframes | menu drawer, buttons | Keep. |
| View Transitions / `ClientRouter` | none | Not used. |

## 7. Build result

`npm run build` → **succeeds**, 27 pages, ~7 s, no errors or warnings reported. `dist/` is 3.1 MB. This does not validate output correctness (canonical points at localhost, `[ADD]` text ships in HTML).

## 8. Dependencies

`package.json` lists: astro, tailwindcss, @tailwindcss/vite, gsap, lenis, three, @types/three, @fontsource/bricolage-grotesque, @fontsource/instrument-sans, @fontsource/playfair-display, @fontsource-variable/inter. All use `^` ranges (rules require exact pins). Missing from the allowed set: `sharp`, `@astrojs/sitemap`, `@astrojs/check`, `typescript` (declared in tsconfig only), `playwright`, `@axe-core/playwright`, `lighthouse`. Not allowed and present: `three`, `@types/three`. `@tailwindcss/vite` is required by Tailwind 4 and is not on the allowed list as written — needs your OK. `npm audit` has not been run in this audit (no installs were made).

## 9. Keep / rebuild summary

- **Keep**: palette and tokens in `global.css`, fonts, data-file pattern, studio concept and the `powder-fx` / `spin` / `carousel` logic (after refactor), header drawer logic (after layout fix), lemon frames, the page list.
- **Rebuild**: home page (split into sections/components), product pages, products catalog (filter), request form (multi-step), footer/header markup, cookie notice, all long-form pages' copy, SEO layer, security headers.
- **Delete**: `Hero*`, `Welcome`, `Layout.astro`, `StickyDesktopQuoteButton`, Astro starter assets, `three`, duplicate routes, `appmap.log`, unused fontsource packages.
