> **Historical.** Written before the decision to remove all forms and the "Request a Sample" button. The live rules are in `CLAUDE.md`.

# PLAN.md — Renol Foods redesign (branch `redesign-v2`)

Status: **draft for approval. No code has been changed.** Findings behind this plan are in `AUDIT.md`.
Goal of the site: B2B lead generation. One action everywhere: **Request a Sample**. No cart, prices or checkout.

---

## 0. Decisions I need from you before phase 1

1. **Rules file.** `CLAUDE.md` does not exist. I will create it in phase 0 from the project rules you pasted (stack, never-touch, CTA rules, dependency rules, standards), so every session has them. OK?
2. **Reference file.** `powder-studio.ORIGINAL.html` is not in the repo; I will use `reference/powder-studio.html` and its cleaned copy `reference/clean.html`. Say so if you have a different file.
3. **Logo.** The file is `public/images/Logo.png` (436×200, wordmark only). I will rename it to `logo.png` (Linux hosts are case-sensitive) and generate favicons from a square crop of the wordmark's "R", unless you can supply a square mark or an SVG. Favicons from a wide 436 px wordmark will look weak without one.
4. **Dependencies.** Remove `three`, `@types/three`, `@fontsource/playfair-display`, `@fontsource-variable/inter`. Add the allowed list: `sharp`, `@astrojs/sitemap`, `@astrojs/check`, `typescript`, and dev: `playwright`, `@axe-core/playwright`, `lighthouse`. Pin all versions exactly. **`@tailwindcss/vite` is required by Tailwind 4 but is not on your allowed list: may I keep it?**
5. **Lenis.** Allowed, but I propose to **drop it** (see §4). Agree?
6. **Form key name.** Rules say `PUBLIC_WEB3FORMS_KEY`; the code says `PUBLIC_WEB3FORMS_ACCESS_KEY`. I will use `PUBLIC_WEB3FORMS_KEY` and add `.env.example`. Do you have the key and the production domain (for `site`, canonical, sitemap, CSP)?
7. **Content that came from the client prototype but is unverified**: ingredient lists ("Silicon dioxide", "Corn syrup solids", "Modified corn starch", "Organic spinach", Mango "sulfites"), the 6-step manufacturing process, "particle size customisation", export ports and container loads. My default: **hide all of it** and list it in `TODO_CONTENT.md` until you confirm. Product blurbs and "uses" from the prototype I will keep, because they are descriptive rather than factual claims about Renol. OK?
8. **Caramel and Apple art.** The prototype has fruit art for 6 of the 8 products. I will draw SVG fruit and pouch art for Caramel (a caramel-block / drizzle shape) and Apple in the same style. OK, or will you supply art?

---

## 1. Sitemap

```
/                         Home (Powder Studio first screen)
/products                 Filterable catalog (category + application)
/products/tomato-powder   ┐
/products/lemon-powder    │
/products/mango-powder    │ 8 product pages
/products/spinach-powder  │
/products/ginger-powder   │
/products/tamarind-powder │
/products/caramel-powder  │
/products/apple-powder    ┘
/industries               Industries served
/manufacturing            Manufacturing & Infrastructure
/quality                  Quality & Certifications (see below)
/private-label            Private label & custom
/export                   Export & Logistics
/resources                Resources / Downloads (renamed from /downloads; /downloads redirects)
/faq                      FAQ
/about                    About
/contact                  Contact
/request-sample           Request a Sample (multi-step form)
/privacy  /terms  /cookies
/404
```

Removed or redirected: `/quote`, `/request-quote` → `/request-sample` (301 via `_redirects`, or `<meta refresh>` fallback); `/legal/privacy`, `/legal/terms` → `/privacy`, `/terms`; `/downloads` → `/resources`.

**Quality & Certifications** and **Resources** have almost no confirmed facts today. They ship as honest pages: what Renol can state (company, location, products, "specifications on request"), a clearly worded "Documents available on request" list, and **no certification badges** until you provide evidence. Empty sections are hidden, not stubbed with placeholders.

---

## 2. Homepage structure

1. **Powder Studio** (100svh first screen, `min-height` removed, short-viewport layout for 1366×636): ring carousel of 8 fruits, ghost product name, accent glow, circular reveal into a product summary. **No wheel hijack**: vertical scroll always scrolls the page; only horizontal drag/swipe, arrow buttons, arrow keys and horizontal trackpad gestures move the ring. One hero button: **Request a Sample**. Scroll cue below.
2. **Trust bar** — confirmed facts only: Founded 2021 · Bavla, Ahmedabad · 8 powders · Made for food manufacturers. Certification and client-logo slots are rendered only when data exists.
3. **What we make** — 8 product tiles (link to product pages, no Request buttons on cards).
4. **Manufacturing timeline** — animated, scroll-driven steps. *Shown only after you confirm the steps* (decision 7). Until then the section is replaced by a visual of the fruit-to-powder transformation (the studio animation, replayed on scroll) with no process claims. The brief confirms only "spray-dried".
5. **Industries** — bakeries, beverage, snack, seasoning, exporters (names from the brief; descriptions neutral).
6. **Private label** — short block linking to `/private-label`.
7. **Numbers** — only **2021 (founded)**, **8 powders**, **1 plant in Bavla**. No capacity, client or certificate counts.
8. **Quality** — what we can say without certificates; link to `/quality`.
9. **FAQ teaser** — 4 questions with confirmed answers only; unanswered ones hidden.
10. **Closing CTA band** with the short form (name, company, email/phone, product, message). This is the one closing CTA.

CTA budget (rule): header button (≥1024 px), one hero button, one closing band, mobile bottom bar (<768 px: Call / WhatsApp / Request a Sample), WhatsApp float on desktop only. Nothing else says "Request a Sample"; secondary links read "View product", "Learn more", "Contact".

---

## 3. Design system

**Tokens** (CSS custom properties in `src/styles/tokens.css`, mapped into Tailwind's `@theme`)
- Colour: `--bg #0b0b0d`, `--panel #121214`, `--surface #1b1b1f`, `--ink #fff`, `--ink-2 rgba(255,255,255,.70)`, `--ink-3 rgba(255,255,255,.62)` (raised from the reference's .46/.40 so small text passes AA), `--line rgba(255,255,255,.18)`.
- Per-product accents (`tomato #ff5a4d`, `lemon #ffe14a`, `mango #ffb020`, `spinach #4ade80`, `ginger #f0c48a`, `tamarind #d98b4e`, `caramel #d48238`, `apple #e0564c`) plus `glow`, `base`, `pouch`, `powder`, `particles[]` from the brief's palette table. Set as `--accent`, `--glow` on the page or section, never hard-coded in components.
- Focus ring: 2 px accent outline, 3 px offset, always visible on `:focus-visible`.
- Type: Bricolage Grotesque (display, 500/800) and Instrument Sans (body, 400/500/600), self-hosted via Fontsource, `font-display: swap`, Latin subset only. Fluid scale with `clamp()`: display `clamp(2.5rem, 1.2rem + 5.5vw, 6rem)`, h1 `clamp(2rem, 1.2rem + 3vw, 3.75rem)`, h2 `clamp(1.5rem, 1rem + 2vw, 2.5rem)`, h3 1.25–1.5rem, body 1–1.125rem, small 0.875rem, line-height 1.1 headings / 1.6 body. Ghost outlined names use `-webkit-text-stroke: 1.5px rgba(255,255,255,.15)`.
- Spacing: 4 px base; scale 4/8/12/16/24/32/48/64/96/128. Section padding `clamp(4rem, 3rem + 5vw, 8rem)`. Gutter 16 px (mobile), 24 px (tablet), 32 px (desktop). Max content width 1200 px; prose 68 ch.
- Radius: pill 999 px for buttons/tags, 16 px cards, 24 px panels. Shadows minimal; depth from glow and borders.
- Breakpoints: 360, 390 (design floor 360), 640, 768, 1024, 1280, 1440, 1920.

**Components** (`src/components/ui/` and `src/components/site/`, all typed props, all copy from `/src/data`)
- `Header` — logo (real PNG/`<picture>`), nav, header "Request a Sample" button from 1024 px, sticky with solid-on-scroll background (CSS only).
- `MobileMenu` — native `<dialog>`-based drawer or `popover` panel, focus trap via `<dialog>`, `Escape` closes, scroll lock only while open and always released (including on `pagehide`, resize past 1024 px and link click), `aria-expanded`/`aria-controls` on the trigger, 44 px targets. Lives outside the header's stacking context so it cannot be clipped.
- `Footer` — logo, nav groups, the three phone numbers as `tel:` links, address (confirmed spelling only), legal links. Email is shown only once confirmed.
- `Button` — variants `primary` (accent pill), `ghost` (outlined pill), `link`; min height 44 px; one label constant `CTA_LABEL = "Request a Sample"` used by every call site.
- `Card`, `Section` (eyebrow, heading, lede), `Tag`, `Stat`, `Timeline`, `Accordion` (native `<details>`), `Dialog` (native `<dialog>` with scroll-lock helper), `Field`/`Select`/`Textarea`/`Checkbox` with visible labels and error text linked by `aria-describedby`, `Stepper` (form progress), `ProductArt` (SVG fruit/pouch), `Breadcrumb`.
- `CookieNotice` — small bottom bar (not a modal), never covers primary content on short viewports, hidden when the mobile bar is present; "Essential only" and "Accept". Choice stored in `localStorage` in a `try/catch`. No analytics is installed, so this is a notice only.

**Motion rules**
- Durations 0.3–0.8 s; easing `cubic-bezier(.22,1,.36,1)` (out) / `ease-in-out` for state swaps. Animate `transform` and `opacity` only (plus `clip-path` for the reveal).
- Animation only where it explains something: product change, fruit-to-powder dissolve, reveal, timeline progress, section entrance (small 16 px fade-up).
- `prefers-reduced-motion: reduce` → no spin, no particles, no parallax; instant state changes; static final frame of the lemon; timeline fully visible.
- Low-power fallback (`hardwareConcurrency ≤ 2`, `saveData`, `prefers-reduced-data`) → fewer particles (≤ 400), no spin on load, no scroll-linked effects.
- Canvas: DPR capped at 2; `IntersectionObserver` and `visibilitychange` pause the loop; always cancel on `astro:before-swap`/`pagehide`.
- Never `preventDefault` on vertical wheel or touch-move; overlays lock scroll only while open.

---

## 4. Animation tools: what and why

| Need | Tool | Why |
| :-- | :-- | :-- |
| Section entrances, timeline progress, number reveals, sticky header state | **Native CSS** scroll-driven animations (`animation-timeline: view()/scroll()`) behind `@supports`; plain visible fallback | Zero JS, runs off the main thread, no scroll hijack, degrades to static content. |
| Page-to-page transitions | **Native cross-document View Transitions** (`@view-transition { navigation: auto }`) | Works with static Astro with no router; ignored where unsupported; respects reduced motion. No `ClientRouter` (it re-runs scripts and complicates cleanup). |
| Ring carousel easing, fruit-to-powder sequence, circular `clip-path` reveal, detail stagger | **GSAP core** (allowed) | The reference's signature timeline (killable tweens, overwrite, sequenced timelines, shared `pos` tween driving the ring) is exactly GSAP's job and I would have to rebuild it badly in WAAPI. Imported from npm and loaded only on `/` (studio chunk), never on other pages. |
| 36-frame lemon spin | **Canvas 2D** drawing preloaded WebP frames, driven by a GSAP-tweened frame index | Matches the reference; a `<video>` or CSS sprite cannot be scrubbed by drag. |
| Powder dissolve and pile | **Canvas 2D** particle loop (hand-written, ported from the reference, N ≤ 900 mobile / 1500 desktop, lower under low-power) | Needed for the signature effect; no library required. |
| Smooth scroll | **Not used** (Lenis dropped) | It intercepts the wheel, runs a constant rAF loop, and conflicts with "never hijack scroll". Native scrolling plus `scroll-behavior: smooth` for anchors (disabled for reduced motion) covers the need. |
| **ScrollTrigger** | **Not used** unless a specific effect cannot be done in CSS; I will justify it in the commit if it is added. | Keeps the JS budget low. |
| `three` | Removed | Dead code, not on the allowed list. |

JS budget target: no JS on content pages except the menu, the form and the cookie notice (≈ 3 KB); GSAP + studio code only on `/` and the product detail overlay.

---

## 5. Responsive strategy

Mobile-first. Units: `svh/dvh` (never `vh`), `clamp()` type and spacing, CSS grid with `minmax()` and container queries for cards. No `overflow-x: hidden` on `html`/`body` (bugs are fixed, not hidden); `overflow-x: clip` only on specific decorative layers. Tap targets ≥ 44×44 px. Test widths: 360, 390, 768, 1024, 1280, 1440, 1920 and 1366×636.

| Page | ≤ 640 | 768 | 1024 | ≥ 1280 / 1366×636 |
| :-- | :-- | :-- | :-- | :-- |
| Home studio | Ring shows 1 front card, 2 peeking; arrows at bottom; ghost name behind; bottom bar visible; studio height `100svh − header − bar` | Larger ring, name and sub beside arrows | Full ring, side arrows, header CTA | Short-viewport mode at `max-height: 700px`: ring and name scale from `min(…vw, …svh)`, hint text hidden, scroll cue stays visible, no overlap with header |
| Home sections | single column, timeline vertical | 2-col grids | 3–4-col, timeline horizontal with sticky progress | max 1200 px container |
| Products | filter chips scroll horizontally (visible scrollbar-free, keyboard operable), 1-col cards | 2-col | 3-col, filter bar sticky | 4-col at ≥1440 |
| Product page | stacked: art, title, summary, uses, spec block ("Full specifications on request"), CTA band | art left / text right | sticky art column | normal document flow always; **never a fixed full-screen wrapper** |
| Industries / Private label / Export / Quality / Manufacturing / About | single column, tables become stacked definition lists | 2-col | split layouts | wide layouts capped |
| Request a Sample | one step per screen, large inputs, sticky Back/Next | same, 2-col fields | form + side panel (phones, what happens next) | same |
| Contact / FAQ / Legal / 404 | 1-col, prose 68 ch | same | same | same |

Overlays (menu, studio detail, form confirmation): lock scroll only while open, restore on close and on `pagehide`.

---

## 6. Phases (each ends in `npm run build`, checks, `npm audit` where deps changed, a report to you, and one commit on `redesign-v2`)

I will wait for your instruction before starting each phase.

**Phase 0 — Foundation and clean-up**
Create `CLAUDE.md`; remove dead code (`Hero*`, `Welcome`, `Layout.astro`, `StickyDesktopQuoteButton`, Astro starter assets, `three`, unused fonts, duplicate routes, `appmap.log` + gitignore); fix deps (decision 4); set `site` in `astro.config.mjs`; add `.env.example`; `robots.txt`; `@astrojs/sitemap`; `public/_headers` (strict CSP, no CDN scripts, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, frame-ancestors none); logo rename and favicons; `TODO_CONTENT.md` and `RESPONSIVE_REPORT.md` skeletons; scripts `check`, `test:e2e`, `lighthouse`; Playwright + axe harness that visits every route at the 8 sizes and fails on horizontal scroll.
*Check:* build, `astro check`, `npm audit`, harness runs against current pages (baseline report).

**Phase 1 — Design system and shell**
Tokens, type scale, `Button`/`Card`/`Section`/`Tag`/`Field`/`Dialog`, `Header`, `MobileMenu`, `Footer`, `CookieNotice`, `MobileBottomBar`, `WhatsAppFloat`, `BaseLayout` (meta, OG, canonical, skip link, View Transitions CSS), global reduced-motion rules. A hidden `/_kit` page (noindex, excluded from the sitemap) shows every component.
*Check:* menu opens/closes by mouse, keyboard and `Escape`; scroll unlocks; axe clean; no overflow at 8 sizes.

**Phase 2 — Data and content model**
Rewrite `/src/data/*.ts` with typed schemas: `site`, `products` (id, slug, name, category, blurb, uses, palette, `specs` as optional fields that render only when present), `industries`, `process`, `faq`, `cta`. Move all hard-coded copy out of pages. Strip invented claims (AUDIT §4). Every missing fact becomes `[ADD: …]` in data, never rendered, and listed in `TODO_CONTENT.md`. Add a build-time test that fails if `[ADD`/`[CONFIRM`/`&amp;` reaches `dist/`.
*Check:* build, `dist` placeholder scan.

**Phase 3 — Powder Studio**
Port the reference as typed modules: ring carousel, 36-frame lemon spin, particle dissolve, circular reveal, detail overlay with "View full details" link. 8 products including new Caramel and Apple art. No wheel hijack; drag, arrows, keys; reduced-motion and low-power paths; server-rendered `<ul>` of product links as the no-JS fallback; preloading of the first 4 lemon frames only; cleanup on `pagehide`.
*Check:* 1366×636 and 360×640 screenshots, page scrolls from the studio, keyboard-only walk, CPU idle check, Lighthouse on `/`.

**Phase 4 — Homepage sections**
Trust bar, product tiles, timeline (if confirmed), industries, private label, numbers, quality, FAQ teaser, closing CTA band with form, section-entrance CSS animations.
*Check:* CTA budget test (counts "Request a Sample" per page against the rule), Lighthouse mobile ≥ 90 across categories.

**Phase 5 — Products**
`/products` with filter (progressive: works as anchor links without JS, enhanced with JS), 8 product pages from one template, ProductArt, JSON-LD `Product` **without** `Offer`/price, `BreadcrumbList`, "Full specifications on request" where specs are missing.
*Check:* all 8 pages scroll at 1366×636 and 360 px, schema validity, axe.

**Phase 6 — Content pages**
About, Industries, Manufacturing & Infrastructure, Quality & Certifications, Private Label, Export & Logistics, Resources, FAQ (with `FAQPage` JSON-LD from confirmed answers). Honest copy, no badges without evidence.
*Check:* claims scan against the allow-list of confirmed facts, responsive harness.

**Phase 7 — Request a Sample and Contact**
Multi-step form (who you are → what you need → confirm), Web3Forms via `PUBLIC_WEB3FORMS_KEY`, client-side validation, honeypot, accessible errors and success state, no data in URLs, graceful message when the key is missing; contact page with the three numbers; redirects from old routes.
*Check:* keyboard flow, error states, mocked submit via Playwright, no secrets in `dist`.

**Phase 8 — Legal, 404, cookie notice**
Privacy, Terms, Cookies rewritten to match what the site actually does (no analytics; Web3Forms processes submissions), 404 with product links.
*Check:* axe, link check across `dist`.

**Phase 9 — SEO, performance, accessibility, final QA**
Unique titles and descriptions, canonical, Open Graph and Twitter images (1200×630 generated with `sharp`), Organization JSON-LD, sitemap/robots verified, image pipeline (AVIF/WebP, explicit sizes, lazy loading), font subsetting, CSP verified with no violations, full responsive harness, Lighthouse mobile ≥ 90 on every category for `/`, a product page, `/products`, `/request-sample`, final `RESPONSIVE_REPORT.md` and `TODO_CONTENT.md`.
*Check:* all reports delivered; I list anything that still misses a target.

---

## 7. Risks I want you to know about

- Lighthouse performance ≥ 90 on mobile with a canvas hero, 36 frames and particles is achievable only if frames and effects are lazy and the studio JS is isolated; I will report real numbers each phase and flag misses.
- Without confirmed facts the Quality, Manufacturing and Export pages will be short. That is intentional.
- The logo wordmark is small and wide; favicon and social-image quality depend on a better source file.
- CSP plus Web3Forms requires `connect-src https://api.web3forms.com`; any analytics or embeds later need an explicit CSP change.
