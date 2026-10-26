# Images

Every product and industry has an image path in `src/data`. Until real photos exist, the site uses generated placeholders.

## Replace an image
Overwrite the file with the same name:

- Products: `public/images/products/<slug>.webp`
- Industries: `public/images/industries/<slug>.webp`

The slug is in the data file (`src/data/products.ts`, `src/data/industries.ts`). Keep the `.webp` extension and the exact file name.

## Product images
Product images are 500 × 304 WebP files on a cream background. They are shown at 5:3 with the whole picture visible, never wider than 500 px. To replace one, overwrite `public/images/products/<slug>.webp` with a file of the same name. Raspberry Powder and White Button Mushroom Powder still use generated placeholders until their pictures arrive.

## Recommended sizes
| Type | Size | Max file size |
| :-- | :-- | :-- |
| Products | 500 × 304 px WebP on a cream (#F1EFEA) background, shown at 5:3 | 150 KB |
| Industries | 1200 × 800 px (3:2) | 150 KB |

Keep each file under 150 KB so pages stay fast on mobile. Convert photos to WebP (quality about 75 to 80) before adding them.

## Placeholders
`npm run placeholders` creates a placeholder for any product or industry that has no image yet. It skips files that already exist, so real images are never overwritten. Run it again after adding products or industries to the data files.
