# Renol Foods Website

Official website of **Renol Foods**, a B2B manufacturer of spray-dried fruit, vegetable, dairy, seasoning, beverage and food colour powders based in **Bavla, Ahmedabad, Gujarat, India** (founded 2021).

The site presents the company's 36-product catalogue, manufacturing and quality information, and lets buyers contact the company directly through WhatsApp, phone or Google Maps. It is a fast, fully static website with no backend and no database.

**Live site:** https://renol-foods.vercel.app/

---

## Contents

- [Renol Foods Website](#renol-foods-website)
  - [Contents](#contents)
  - [Features](#features)
  - [Tech stack](#tech-stack)
  - [Pages](#pages)
  - [Getting started](#getting-started)
    - [Requirements](#requirements)
    - [Install and run](#install-and-run)
    - [Commands](#commands)
  - [Project structure](#project-structure)
  - [Editing content](#editing-content)
  - [Images](#images)
  - [The interactive product showcase](#the-interactive-product-showcase)
  - [Request for Sample form](#request-for-sample-form)
  - [Performance and accessibility](#performance-and-accessibility)
  - [Deployment](#deployment)
  - [Going live on renolfoods.com](#going-live-on-renolfoodscom)
  - [Content still needed from the client](#content-still-needed-from-the-client)
  - [Credits and licence](#credits-and-licence)

---

## Features

- **Interactive product showcase** on the home page: seven fruits (Beetroot, Blueberry, Strawberry, Pomegranate, Orange, White Guava, Apple) rendered as 3D objects in real time. Visitors drag or swipe to rotate them, step through them with arrows, dots or keyboard, and click a fruit to watch it crumble into powder before the product page opens.
- **Full product catalogue:** 37 products in 6 categories (Fruit, Vegetable, Food Colour, Dairy, Seasoning, Beverage) with category filters, live search and a page for every product.
- **Direct contact, no forms to host:** WhatsApp, Google Maps and Call buttons in a footer contact panel, plus a WhatsApp-based "Request for Sample" form.
- **Trust signals:** FSSAI and ISO 22000:2018 licence badges, factory and machinery photo gallery, manufacturing process and quality pages.
- **Industry pages and private label** information for bakeries, beverage brands, snack makers, dairy, sauces and nutraceuticals.
- **Fully responsive** design for phones, tablets and desktops, with a mobile menu and touch-friendly interactions.
- **Accessible and motion-aware:** keyboard navigation, focus states, semantic HTML, and reduced-motion versions of the animations.
- **Static and fast:** pre-built pages served from Vercel's edge network.

---

## Tech stack

| Area | Technology |
|---|---|
| Framework | [Astro](https://astro.build) (static output) |
| Language | TypeScript |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Animation | [GSAP](https://gsap.com) (+ ScrollTrigger), [Lenis](https://lenis.darkroom.engineering) smooth scrolling |
| 3D fruits | WebGL with a custom GLSL ray-marching shader (no 3D library) |
| Hosting | [Vercel](https://vercel.com) |
| Enquiries | WhatsApp deep links (`wa.me`), no backend |

---

## Pages

| Page | URL |
|---|---|
| Home (product showcase, process, industries, history, quality, FAQ) | `/` |
| Products (36, filter + search) | `/products` |
| Product pages | `/products/<product-name>` |
| Industries | `/industries` |
| Manufacturing | `/manufacturing` |
| Quality | `/quality` |
| About (company and factory photos) | `/about` |
| Contact | `/contact` |
| Private Label | `/private-label` |
| FAQ | `/faq` |
| Request for Sample | `/request-demo` |
| Privacy, Terms, Cookies | `/privacy`, `/terms`, `/cookies` |

---

## Getting started

### Requirements

- Node.js 20 or newer
- npm (comes with Node.js)

### Install and run

```sh
npm install
npm run dev
```

The site opens at http://localhost:4321.

### Commands

| Command | What it does |
|---|---|
| `npm install` | Installs dependencies |
| `npm run dev` | Starts the local dev server at `localhost:4321` |
| `npm run build` | Builds the production site into `./dist/` |
| `npm run preview` | Serves the production build locally before deploying |
| `npm run astro ...` | Runs Astro CLI commands, for example `astro check` |

---

## Project structure

> Folder names below are the intended layout. If your copy differs slightly, update this section to match.

```text
/
├── public/                     Files served as-is
│   ├── images/
│   │   ├── logo.png            Company logo
│   │   ├── products/           One image per product (<product-name>.webp)
│   │   ├── industries/         One image per industry (<industry-name>.webp)
│   │   └── factory/            Factory and machinery photos
│   ├── frames/                 Image sequences for rotating products (if used)
│   └── favicon files, og-default.png, robots.txt
├── src/
│   ├── components/             Header, Footer, cards, gallery strip, showcase, etc.
│   ├── layouts/                Base page layout (SEO tags, fonts, scripts)
│   ├── pages/                  One file per route
│   ├── data/                   Site content: contact details, products, categories,
│   │                           industries, process steps, FAQ, licences
│   ├── scripts/                Interactive showcase, WebGL fruit renderer, demo form
│   └── styles/                 Global styles and design tokens
├── scripts/                    Helper scripts (for example image generation)
├── reference/                  Client reference files, NOT deployed
├── astro.config.mjs            Astro configuration (including the site address)
└── package.json
```

---

## Editing content

Almost all text lives in `src/data/`, not in the page files, so most edits are one-line changes.

| To change | Edit |
|---|---|
| Phone numbers, WhatsApp number, email, address, Google Maps link | The site details file in `src/data/` (for example `site.ts`) |
| Products: names, descriptions, uses, categories | The products file in `src/data/` |
| Industries and their descriptions | The industries file in `src/data/` |
| Manufacturing process steps | The process file in `src/data/` |
| FAQ questions and answers | The FAQ file in `src/data/` |
| FSSAI and ISO licence details | The licences file in `src/data/` |

After editing, the pages update automatically on the next build. Product counts and category totals are calculated from the data, so do not type them by hand.

**Packaging:** every product ships in a fixed **20 kg corrugated box**. Keep every page, FAQ answer and product description consistent with this.

---

## Images

Replace any image by **overwriting the file with the same name**. No code change is needed.

| Folder | Recommended size | Format |
|---|---|---|
| `public/images/products/` | 500 × 304 (landscape, cream background) | WebP, under 150 KB |
| `public/images/industries/` | 1200 × 800 | WebP, under 200 KB |
| `public/images/factory/` | 1600 × 1200 or similar 4:3 | WebP, under 250 KB |
| `public/images/logo.png` | Transparent background, at least 400 px wide (SVG also works) | PNG or SVG |
| `public/og-default.png` | 1200 × 630 | PNG or JPG (the image shown when the site is shared) |

Tip: use clear, well-lit photos. Better source images give noticeably sharper product pages.

---

## The interactive product showcase

The home page opens with a full-screen showcase of seven fruits.

- Fruits are drawn live by one shared **WebGL fragment shader** (ray marching with procedural skin textures, lighting and ambient occlusion), then copied into each carousel card. This keeps them sharp on any screen without 3D model files.
- Controls: drag or swipe to rotate, horizontal swipe or arrows to change fruit, dots, left/right keyboard keys, click or tap to turn the fruit into powder and open its product page.
- The page's normal scrolling is never hijacked: vertical scrolling always scrolls the page.
- If a device cannot run WebGL, or the user has *reduce motion* turned on, a simpler version is shown.
- Particle counts and render quality are reduced on phones and low-power devices to keep the site smooth.

The shader code lives in `src/scripts/` with the showcase logic.

---

## Request for Sample form

`/request-demo` collects name, mobile number, company, email, address and the powders the visitor wants, validates the fields, builds a formatted message and opens **WhatsApp** with the message ready to send.

- **Nothing is stored or emailed by the website.** The visitor sends the message themselves, so no server, database or form service is needed.
- The WhatsApp number is read from the site details file in `src/data/`. Make sure the number is WhatsApp-enabled.
- The list of powders is built from the product data, so it always matches the catalogue.

---

## Performance and accessibility

- Animate only `transform` and `opacity`; heavy effects pause when off-screen or when the tab is hidden.
- Images are lazy-loaded with explicit sizes, and fonts are self-hosted.
- Smooth scrolling (Lenis) is used only on devices with a fine pointer.
- All interactive elements are keyboard accessible and have visible focus states.
- Animations respect the `prefers-reduced-motion` setting.

---

## Deployment

The site is a static build hosted on **Vercel**.

1. Push the project to a GitHub repository.
2. In Vercel, import the repository. Framework: Astro. Build command: `npm run build`. Output directory: `dist`.
3. Every push to the main branch deploys automatically.

---

## Going live on renolfoods.com

The domain currently shows the previous website, so switch only when the new site is ready.

1. In the project, replace the temporary site address (for example `renol-foods.vercel.app`) with `renolfoods.com` everywhere it appears (search and replace in `src/`, `public/` and `astro.config.mjs`).
2. In Vercel, open **Domains**, add `renolfoods.com` and `www.renolfoods.com`, and set the DNS records Vercel shows you.
3. **Change only the web records (A or CNAME). Do not delete or change MX records**, or email addresses on this domain (for example `Info@renolfoods.com`) will stop working.
4. Add **301 redirects** from the old website's addresses (for example `/product/<name>/`) to the new ones (`/products/<name>`) so search rankings carry over.
5. Submit the new sitemap in Google Search Console.

---

## Content still needed from the client

- FSSAI licence number and ISO 22000:2018 certificate details (badges currently show names only)
- A confirmed WhatsApp-enabled phone number and one confirmed email address
- The exact company address spelling and working hours
- Technical specifications for each product (moisture, particle size, shelf life, storage). These stay hidden on the site until real values are added.
- Confirmation of any technical or process statement on the site (equipment, drying method per product, testing and COA claims)
- Higher-resolution product photos and a 1200 × 630 share image
- Written permission and real details before adding client logos or testimonials

---

## Credits and licence

Built for **Renol Foods** Chintan Hirpara and Mahipal Chothani.

© Renol Foods. All rights reserved. The code, images and text may not be copied or reused without the company's written permission.
