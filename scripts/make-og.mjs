// Generates public/og-default.png (1200x630) from the logo. Run: node scripts/make-og.mjs
import sharp from "sharp";

const logo = await sharp("public/images/logo.png").resize({ width: 560 }).toBuffer();
const logoMeta = await sharp(logo).metadata();
const text = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <text x="600" y="470" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="38" font-weight="600" fill="#ffffff">Dehydrated and spray-dried food powders</text>
    <text x="600" y="526" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#b8b8bd">Bavla, Ahmedabad, India</text>
  </svg>`,
);

await sharp({ create: { width: 1200, height: 630, channels: 4, background: "#0b0b0d" } })
  .composite([
    { input: logo, left: Math.round((1200 - logoMeta.width) / 2) + 48, top: 90 },
    { input: text, left: 0, top: 0 },
  ])
  .png({ compressionLevel: 9 })
  .toFile("public/og-default.png");
console.log("wrote public/og-default.png");
