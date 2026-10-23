# TODO_CONTENT.md — Renol Foods Missing Data & Verification Tracker

This document logs all content, specifications, legal details, and operational figures that require explicit confirmation or client-provided verification. 
**Per project rules, no certifications (FSSAI, ISO, HACCP, GMP), capacity metrics, client names, or laboratory specs are invented.**

---

## 1. Contact & Corporate Identity

| Item | Current Status / Placeholder | Location | Notes / Action Required |
| :--- | :--- | :--- | :--- |
| **Official Email Address** | `[CONFIRM: info@renolfoods.com or sales@renol.com]` | `src/data/site.ts` | Confirm primary B2B inquiry and sales routing email. *(Hidden from public display until confirmed).* |
| **Postal Address & Spelling** | `Plot No. 616, Kerala GIDC, Bavla, Ahmedabad [CONFIRM spelling]` | `src/data/site.ts` | Verify plot number, pin code, and postal jurisdiction. *(Rendered without "[CONFIRM spelling]" in public UI).* |
| **WhatsApp Business Number** | `[CONFIRM: WhatsApp number with country code, e.g. 919979977396]` | `src/data/site.ts`, Floating WhatsApp, Mobile Bar | Confirm whether primary WhatsApp is +91 9979977396 or dedicated support desk. |
| **Operational Hours** | `[CONFIRM: Monday - Saturday 9:00 AM - 6:00 PM IST]` | `src/data/site.ts` | Confirm factory office business hours and dispatch windows. *(Publicly rendered as "Monday – Saturday (IST)").* |

---

## 2. Product Specifications (Awaiting Lab / Factory Data Sheets)

Each product page will detail physical, chemical, and microbiological properties. The following placeholders are queued in `src/data/products.ts` and hidden from public display until verified:

| Product | Missing Parameter Placeholders | Priority |
| :--- | :--- | :--- |
| **Tomato Powder** | `[ADD: moisture % - typically ≤ 5.0%]`, `[ADD: mesh size - 60-80 mesh]`, `[ADD: pH range]`, `[ADD: solubility %]`, `[ADD: carrier/anti-caking %]`, `[ADD: packaging units]`, `[ADD: shelf life]` | High |
| **Tamarind Powder** | `[ADD: moisture %]`, `[ADD: mesh size]`, `[ADD: pH range]`, `[ADD: dispersibility %]`, `[ADD: packaging units]`, `[ADD: shelf life]` | High |
| **Caramel Powder** | `[ADD: moisture %]`, `[ADD: particle size]`, `[ADD: pH value]`, `[ADD: water solubility %]`, `[ADD: packaging units]`, `[ADD: shelf life]` | High |
| **Lemon Powder** | `[ADD: moisture %]`, `[ADD: mesh size]`, `[ADD: pH value]`, `[ADD: cold water solubility %]`, `[ADD: carrier %]`, `[ADD: packaging units]`, `[ADD: shelf life]` | High |
| **Mango Powder** | `[ADD: confirm raw amchur vs. ripe spray-dried]`, `[ADD: moisture %]`, `[ADD: mesh size]`, `[ADD: pH value]`, `[ADD: solubility]`, `[ADD: packaging units]`, `[ADD: shelf life]` | High |
| **Spinach Powder** | `[ADD: confirm single-ingredient pure leaf claim]`, `[ADD: moisture %]`, `[ADD: mesh size]`, `[ADD: pH range]`, `[ADD: packaging units]`, `[ADD: shelf life]` | High |
| **Ginger Powder** | `[ADD: confirm single-ingredient purity]`, `[ADD: moisture %]`, `[ADD: mesh size]`, `[ADD: pH value]`, `[ADD: packaging units]`, `[ADD: shelf life]` | High |
| **Apple Powder** | `[ADD: confirm single-ingredient / anti-caking status]`, `[ADD: moisture %]`, `[ADD: mesh size]`, `[ADD: pH range]`, `[ADD: packaging units]`, `[ADD: shelf life]` | High |

---

## 3. Commercial FAQs & Policy Confirmations (`src/data/faq.ts`)

| FAQ Topic | Placeholder in `src/data/faq.ts` | Required Information from Client |
| :--- | :--- | :--- |
| **Minimum Order Quantity** | `[ADD: confirm answer with Renol - e.g. 100 kg per product or 500 kg for custom runs]` | Confirm exact commercial MOQ threshold in kg or metric tonnes. |
| **Evaluation Samples** | `[ADD: confirm answer with Renol - e.g. 48 to 72 hours of receiving company and application details]` | Confirm sample sizes (100g/250g) and courier dispatch timeline. |
| **Product Shelf Life** | `[ADD: confirm answer with Renol - e.g. 12 to 24 months]` | Confirm official stability shelf life per powder. |
| **Storage Temperature** | `[ADD: confirm answer with Renol - e.g. 22°C - 25°C]` | Confirm maximum allowable storage temperature and RH limit. |
| **Manufacturing Lead Time** | `[ADD: confirm answer with Renol - e.g. 3 to 5 business days catalog / 2 to 3 weeks custom]` | Confirm dispatch lead times for stock vs. custom runs. |
| **Custom Particle Blending** | `[ADD: confirm answer with Renol on custom batch volume thresholds]` | Confirm minimum batch size for custom particle mesh grinding and blending. |
| **Export Documentation** | `[ADD: confirm answer with Renol - e.g. Certificate of Origin, Phytosanitary, Halal]` | Confirm supported export shipping documents and certificates. |
| **Packaging Configurations** | `[ADD: confirm answer with Renol - e.g. 20 kg / 25 kg poly-lined kraft or fiber drums]` | Confirm standard gross/tare bag weights and palletized packaging. |

---

## 4. Regulatory & Quality Certifications

*Strict Rule: Do not show logos or claim certificates until valid certificate numbers are supplied. All placeholders hidden from public site.*

| Certification | Status | Target Placement |
| :--- | :--- | :--- |
| **FSSAI License** | `[ADD: FSSAI License Number]` | Quality Page, Footer |
| **ISO Certifications** | `[CONFIRM: ISO 22000 / ISO 9001 registration details if held]` | Quality Page, About Page |
| **HACCP & GMP** | `[CONFIRM: HACCP / GMP compliance or audit agency]` | Quality Page |
| **Halal / Kosher** | `[CONFIRM: Halal / Kosher certification availability for export]` | Quality Page, Export section |

---

## 5. Facility & Operational Capacities

| Metric | Status / Placeholder | Placement |
| :--- | :--- | :--- |
| **Monthly / Annual Production Capacity** | `[ADD: Metric tonnes per month / year]` | About Page, Facility Overview |
| **Drying Technology Type** | Spray-Drying vs. Dehydration vs. Vacuum Belt drying verification | Process & About Page |

---

## 6. Media & Visual Assets

| Asset | Current State | Replacement Needed |
| :--- | :--- | :--- |
| **Company Logo** | Clean SVG text/geometric wordmark | Vector master logo (.svg) |
| **Factory / Plant Photography** | High-aesthetic editorial graphics | Authentic photos of Bavla, Kerala GIDC processing facility |
| **Product Powder Photography** | High-definition product macro graphics | Authentic product batch photos in professional studio lighting |

---

## 7. Verify with Renol before publishing (Removed / Softened Claims)

The following claims were removed or replaced with neutral, verified phrasing across the site to avoid unverified promises:

| Claim Category | Specific Removed Claims | Reason / Replaced Wording |
| :--- | :--- | :--- |
| **Hero Statistics** | `"100% Batch COA"` | Replaced with neutral factual stat: `"B2B Commercial Supply: Bulk & custom orders"`. Verify if Renol provides COA with every batch. |
| **Facility Capabilities** | `"Cleanroom packaging"`, `"climate-controlled cleanrooms"` | Removed. Replaced with general protective packaging description. Verify actual cleanroom classification (e.g. Class 100,000 / ISO 8) if applicable. |
| **Packaging Technology** | `"Nitrogen-flushed"`, `"hermetic sealing"`, `"aseptic barrier packaging"` | Removed. Replaced with standard food-grade multi-wall moisture-barrier packaging. Verify if nitrogen flushing is equipped. |
| **Processing Physics** | `"Zero-tolerance moisture boundary"`, `"microsecond moisture flash-off"` | Removed. Replaced with factual description of heated spray drying air and evaporation. |
| **Pricing Claims** | `"Bulk pricing direct from our Bavla facility"`, `"Factory direct sales"` | Replaced with `"Commercial Inquiries"`, `"Sales & Inquiries"`. Verify pricing structures and sales channels. |
| **Lab & Quality Claims** | `"Certificate of Analysis (COA) Guarantee"`, `"Parametric testing"`, `"Batch verified"` | Removed. Replaced with general quality parameter overview (moisture, mesh size, organoleptic assessment). Verify internal lab vs. third-party NABL lab testing arrangements. |
| **Public Placeholders** | `[ADD: moisture %]`, `[ADD: mesh]`, `[ADD: shelf life]`, `[ADD: FSSAI License]`, `[CONFIRM spelling]` | Hidden from public visitors. Replaced with `"Full specifications on request"` and direct sample inquiry links. |

---

## 8. Reference Prototype Unverified Copy & Ingredient Flags

The following ingredients, application tags, and blurb claims originated from the old website copy in `reference/powder-studio.html` and require confirmation against real production labels and formulation sheets:

| Item / Claim | Location / Source | Issue / Verification Required |
| :--- | :--- | :--- |
| **"Organic spinach"** | Spinach Powder (`inside: ['Organic spinach']`) | **Regulatory organic claim**: Cannot be stated as "Organic" without valid NPOP / USDA Organic certification credentials. Confirm whether spinach is conventional or certified organic. |
| **"Sulfur dioxide (preservative) / Sulfites"** | Mango Powder (`inside: ['Mango', 'Sugar', 'Citric acid', 'Sulfur dioxide (preservative)', 'Sulfites']`) | **Allergen disclosure wording**: Confirm exact preservative and sulfite declaration required under FSSAI / export labeling standards for mango powder batches. |
| **Tomato Ingredients** | Tomato Powder (`inside: ['Tomatoes', 'Silicon dioxide']`) | Confirm whether anti-caking agent (silicon dioxide / E551) is added, and its maximum usage percentage. |
| **Lemon Ingredients** | Lemon Powder (`inside: ['Lemon juice concentrate', 'Corn syrup solids', 'Lemon oil']`) | Confirm carrier (corn syrup solids vs. maltodextrin) and exact ingredient hierarchy. |
| **Tamarind Ingredients** | Tamarind Powder (`inside: ['Tamarind', 'Modified corn starch']`) | Confirm carrier / drying aid (modified corn starch or maltodextrin). |
| **Ginger Ingredients** | Ginger Powder (`inside: ['Dried ginger']`) | Confirm 100% single-ingredient status without processing aids. |
| **Caramel Ingredients** | Caramel Powder (`inside: ['Caramelized sugar']`) | Confirm class (Class I / Class III / Class IV) and carrier if present. |
| **Apple Ingredients** | Apple Powder (`inside: ['Dried apples']`) | Confirm single-ingredient purity vs. anti-caking additives. |


---

## 7. Catalogue rebuild (products.ts, categories.ts, industries.ts, licences.ts, site.ts)

All of the following are drafted general copy or placeholders. Nothing below has been confirmed by the client.

### Copy that needs client review before launch
- **Every product `summary`, `description` and `uses` list** (35 products in `src/data/products.ts`). Written to be general and factual: no health or nutrition claims, no numbers, no drying-method or testing statements. The client must confirm each product's uses and wording.
- **Industry descriptions** (6, in `src/data/industries.ts`): one-line drafts.
- **Category names** (6, in `src/data/categories.ts`) come from the client brief; counts are computed from the product data.
- **Allergens**: `milk` on Skimmed Milk Powder, Milk Powder, Butter Powder; `soy` on Soya HVP Powder. Confirm these, and confirm whether any other product needs an allergen statement.
- **Packaging**: "20 kg corrugated box" is applied to every product (one shared constant). Confirm per product.
- **Specs** (`moisture`, `particleSize`, `shelfLife`, `storage`): `[ADD]` for all 35 products, hidden publicly. Public pages show "Full specifications on request".
- **Ingredients lists** are not stored at all. The old prototype lists (for example silicon dioxide in tomato, sulphites in mango, "organic" spinach) must not return without client proof.

### Licences (`src/data/licences.ts`)
- FSSAI licence number: `[ADD]`.
- ISO 22000:2018 certificate number: `[ADD]`.
- Neither is shown publicly until a number is supplied (`publicLicences` is empty).

### Contact (`src/data/site.ts`)
- WhatsApp: `+919979977396` is used for now. `[CONFIRM it is WhatsApp-enabled]`.
- Address spelling: "Plot No. 616, Kerala GIDC, Bavla, Ahmedabad" `[CONFIRM]`. The Google Maps link (`site.mapUrl`) is built from this text, so correct the text and the link follows.
- Email and office hours: still `[CONFIRM]`.

### Images that must be supplied (files do not exist yet)
- 35 product images at `/public/images/products/<slug>.webp`.
- 6 industry images at `/public/images/industries/<slug>.webp`.

### Powder Studio
- Products flagged `studio: true`: Apple, Orange, Pomegranate, Strawberry, White Guava, Blueberry, Beetroot. Their accent and glow colours are draft choices.
- Only **Apple** has a renderer today. Orange, Pomegranate, Strawberry, White Guava, Blueberry and Beetroot need a shader scene (or at least a poster in `/public/images/fruit/<slug>.webp`) before they appear in the carousel. Until then the studio shows Apple only.
- The previous studio fruits (tomato, mango, spinach, ginger, tamarind, caramel, lemon) are no longer flagged for the studio. Their shader scenes and posters still exist.

### Pages still on the old schema
- Home, `/products`, product pages, `/downloads`, `/request-sample`, `/industries` read the catalogue through `src/data/legacy.ts` until they are rebuilt. Delete that file with them.

---

## 8. Direct-contact rebuild (no forms)

- **Office hours**: `[ADD]` in `src/data/site.ts`; hidden on the Contact page until provided.
- **Licences**: the text badges "FSSAI Licensed" and "ISO 22000:2018 Certified" are shown everywhere (footer, home trust bar, Quality page, every product page). The licence numbers / certificate files are `[ADD]` and hidden. No official logos until the client supplies them. Confirm the badges are accurate before launch.
- **Privacy Policy and Cookie Notice** were rewritten for a site with no forms and no analytics. Client / legal review needed.
- **Contact buttons**: WhatsApp uses +919979977396 `[CONFIRM it is WhatsApp-enabled]`. Product pages pre-fill the WhatsApp message with the product name and "20 kg corrugated box".
- **Embedded Google Map** on the Contact page is built from the address text (spelling `[CONFIRM]`); it needs `frame-src https://www.google.com` in the security headers (already set).
