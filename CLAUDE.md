# Renol Foods: project rules

## What this is
B2B food powder manufacturer, Bavla, Ahmedabad, India (founded 2021). Products: Tomato, Tamarind, Caramel, Lemon, Mango, Spinach, Ginger, Apple powder. Customers: food manufacturers, bakeries, beverage and snack brands, exporters.
GOAL: lead generation, NOT online sales. No cart, prices or checkout. One action everywhere: "Request a Sample".

## Stack (fixed)
Astro (static output), Tailwind CSS 4, TypeScript, GSAP + ScrollTrigger, Lenis. No backend or database. Forms use Web3Forms with the key from env `PUBLIC_WEB3FORMS_KEY`. Deploy: Cloudflare Pages or Netlify. Dev server: `astro dev --background` (manage with `astro dev stop|status|logs`).

## Never touch
## Powder Studio reference (v2)
/reference/powder-studio.html is the source of truth. Read it with: sed '/id="lemonFrames"/d' reference/powder-studio.v2.html
Fruits are rendered by one shared WebGL ray-marching fragment shader (not SVG): K = 0 tomato, 1 mango, 2 spinach, 3 ginger, 4 tamarind. Lemon uses 36 photo frames. Do NOT redraw fruits as SVG, and do NOT change the shader look except where a prompt says so.

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
One label: "Request a Sample" (constant `CTA.label` in `src/data/cta.ts`; never type it by hand). Render it only with `CtaButton` and a `placement`:
- `header`: header button (>= 1024px)
- `hero`: one hero button
- `closing`: one closing CTA band
- `bar`: mobile bottom bar (Call / WhatsApp / Request a Sample, < 768px)
WhatsApp float: desktop only. No Request buttons repeated on every card. Secondary links read "View product", "Learn more", "Contact".

## Content architecture
All content lives in `/src/data/*.ts` (site, products, industries, process, faq, cta, nav). Components never hardcode copy. Contact: +91 9979977396, +91 9979977395, +91 9979977392. Email and address spelling are "[CONFIRM]" until the client confirms.

## Dependencies: security rules
Only the allowed list. Ask before adding anything else.
Allowed: astro, tailwindcss, @tailwindcss/vite (approved, required by Tailwind 4), typescript, gsap (incl. ScrollTrigger), lenis, @fontsource/*, sharp, @astrojs/sitemap, @astrojs/check, playwright (dev), @axe-core/playwright (dev), lighthouse (dev).
Rules: install only from the official npm registry by exact package name (check for typosquats), pin exact versions (`--save-exact`), commit the lockfile, install with `--ignore-scripts`, run `npm audit` after installs and report results, no CDN `<script>` tags, no copy-pasted minified code, no packages with unknown maintainers or install scripts, strict CSP + security headers (`_headers`).

## Workflow
Work on branch `redesign-v2`. Commit after each phase. After each phase run `npm run build`, `npm run check` and `npm run qa`, and report. Keep `TODO_CONTENT.md` and `RESPONSIVE_REPORT.md` up to date. `npm run qa` screenshots every route at 360, 390, 768, 1024, 1366x636 and 1440 and 1920, fails on horizontal overflow, runs axe, and scans for leaked placeholders; output in `qa-output/` (gitignored).

## Token discipline
- Do not re-read the whole repo. Read only files named in the task plus what you must edit.
- Never open screenshots or images unless an automated check fails. Prefer DOM measurements and text output.
- Batch related edits into few tool calls. Do not rewrite whole files to change a few lines.
- Max 2 fix attempts per issue, then stop and report what is blocking.
- Do not run full QA after every change. Run it once at the end of a phase, on the pages changed.
- Keep replies short: what changed, what to check, what is next.