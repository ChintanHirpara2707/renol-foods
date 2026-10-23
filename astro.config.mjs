// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Production domain is not confirmed yet (see TODO_CONTENT.md). Set SITE_URL at build time.
const site = process.env.SITE_URL ?? 'https://renol-foods.example';

// https://astro.build/config
export default defineConfig({
  site,
  output: 'static',
  build: {
    // Strict CSP: never inline stylesheets or small scripts into the HTML.
    inlineStylesheets: 'never',
  },
  redirects: {
    '/quote': '/request-sample',
    '/request-quote': '/request-sample',
    '/legal/privacy': '/privacy',
    '/legal/terms': '/terms',
  },
  integrations: [sitemap({ filter: (page) => !page.includes('/kit') })],
  vite: {
    plugins: [tailwindcss()],
    build: { assetsInlineLimit: 0 },
  },
});
