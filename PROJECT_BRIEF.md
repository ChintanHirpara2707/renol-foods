# PROJECT_BRIEF.md — Renol Foods Website

## 1. Company & Project Overview
- **Client**: Renol Foods
- **Founded**: 2021
- **Location**: Plot No. 616, Kerala GIDC, Bavla, Ahmedabad, Gujarat, India
- **Core Business**: B2B manufacturer of spray-dried food powders for food processors, industrial bakeries, snack brands, beverage formulators, and exporters.
- **Product Portfolio (8 Powders)**: Tomato, Tamarind, Caramel, Lemon, Mango, Spinach, Ginger, Apple.
- **Primary Goal**: **Pure B2B Lead Generation by direct contact**. No e-commerce, no retail cart, no visible consumer pricing, no checkout and no forms. Every page offers three contact actions: Chat on WhatsApp, Call, and Open in Google Maps.

---

## 2. Updated Technology Stack
- **Framework**: Astro (Static Output mode)
- **Styling**: Tailwind CSS (Tailwind v4 with `@tailwindcss/vite`)
- **Language**: TypeScript
- **Animation & Motion**: **GSAP (GreenSock) + ScrollTrigger**
- **Smooth Scroll**: **Lenis**
- **Visual Engine**: **SVG + Canvas 2D + GSAP** (replacing Three.js based on the approved reference prototype)
- **Fonts**: Self-hosted via Fontsource
  - Display / Headings: **Bricolage Grotesque** (weights 500, 800)
  - Body / UI: **Instrument Sans** (weights 400, 500, 600)
- **Hosting / Deployment Target**: Cloudflare Pages / Netlify

> [!IMPORTANT]
> **Three.js has been removed from the architecture.** The client’s signature interaction is defined by the high-performance SVG ring stage, Canvas 2D particle burst, and interactive pouch transformations provided in `/reference/powder-studio.html`.

---

## 3. Visual Direction & Design Tokens (Dark Powder Studio Aesthetic)

The visual direction follows the reference prototype (`reference/powder-studio.html`):
- **Base Background**: Dark studio atmosphere (`#0b0b0d`)
- **Panel & Surface Backgrounds**: `#121214`, `#1b1b1f`
- **Typography Colors**:
  - Primary text: `#ffffff`
  - Secondary text: `rgba(255, 255, 255, 0.70)`
  - Tertiary / Muted text: `rgba(255, 255, 255, 0.46)`
- **Borders & Dividers**: `rgba(255, 255, 255, 0.18)`
- **UI Elements**:
  - Pill buttons (`rounded-full`, backdrop-blur, subtle translucent border, hover brightness)
  - Ghost outline product typography behind stage (`-webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.15)`)
  - Smooth background radial glow cross-fading on product switch (`radial-gradient(...)`)
  - Mound and pouch illustrations with dynamic powder coloring

### Exact Product Palette (8 Products)

| Product | Category | Accent Color | Radial Glow | Base Color | Pouch Color | Powder Fill | Particle Hues |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Tomato** | Vegetable | `#ff5a4d` | `#d81a28` | `#1c0507` | `#b91c1c` | `#d94a36` | `['#ff6b57', '#e11d2a', '#c4162a', '#ff8a73']` |
| **Lemon** | Fruit | `#ffe14a` | `#7d6200` | `#1a1700` | `#b58900` | `#f1e07a` | `['#fff176', '#ffd400', '#f2e27a', '#e9c600']` |
| **Mango** | Fruit | `#ffb020` | `#f27a00` | `#1c0d02` | `#c2410c` | `#f3b94e` | `['#ffcf4a', '#ff9a1f', '#f2542d', '#f6c667']` |
| **Spinach** | Vegetable | `#4ade80` | `#128a3c` | `#04150a` | `#15803d` | `#5fa046` | `['#52c46a', '#2f9e44', '#1f7a3a', '#7ad08a']` |
| **Ginger** | Vegetable / Spice | `#f0c48a` | `#a8702c` | `#1a1007` | `#92602b` | `#dcbf90` | `['#e8c58f', '#c79a5b', '#f3e3a8', '#a8773c']` |
| **Tamarind** | Fruit | `#d98b4e` | `#8f4a18` | `#170a03` | `#7c3f14` | `#9a6a42` | `['#a8683a', '#8b5a2b', '#c98f5b', '#6b3f1d']` |
| **Caramel** | Colour & Flavour | `#d48238` | `#7c3d10` | `#140903` | `#8a4313` | `#b36628` | `['#c67d36', '#9c4f17', '#e29d52', '#7a380e']` |
| **Apple** | Fruit | `#e0564c` | `#a8261e` | `#180606` | `#99221b` | `#c94d43` | `['#e8655b', '#b52f26', '#f28c84', '#8a1d16']` |

---

## 4. Reference Prototype Architecture & Rules
- The prototype file is stored at `reference/powder-studio.html`.
- **CRITICAL FILE HANDLING RULE**: `reference/powder-studio.html` contains an embedded ~700KB base64 JSON string (`id="lemonFrames"`). **NEVER open, print, or view that line directly in tools.** Read the file by filtering out `lemonFrames` (e.g. `sed '/lemonFrames/d' reference/powder-studio.html` or python equivalents).
- The 36 lemon rotation frames have already been extracted cleanly into individual static WebP assets at `public/frames/lemon/*.webp`.

---

## 5. Non-Negotiable Project Rules
1. **Never Invent Facts**:
   - Zero invented certifications (FSSAI, ISO, HACCP, GMP, Halal, Kosher).
   - Zero fabricated capacity numbers, test metrics, client logos, or pricing promises.
   - Any unverified information must be marked with `[ADD: ...]` in data files and logged in `TODO_CONTENT.md`.
2. **Hide Placeholders from Public UI**:
   - Spec rows with `[ADD...]` must be hidden from cards and tables.
   - Display `"Full specifications on request"` with a direct sample request link instead.
3. **Verified Content Flags**:
   - Unverified ingredient lists, "Organic spinach" claims, and allergen notices (e.g. "sulfur dioxide / sulfites" on Mango) must be flagged in `TODO_CONTENT.md` for client sign-off.
4. **Motion & Accessibility**:
   - Animations strictly 0.3s to 0.8s.
   - Full support for `prefers-reduced-motion` everywhere.
   - Keyboard accessible, visible focus states (`:focus-visible`), WCAG AA contrast.
5. **Clean Architecture**:
   - All content lives in `/src/data/*.ts`.
   - Reusable components in `/src/components/`, layouts in `/src/layouts/`.
   - Static HTML generation targeting 90+ Lighthouse performance on mobile.
