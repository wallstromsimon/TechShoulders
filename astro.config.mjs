import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://techshoulders.com',
  output: 'static',
  integrations: [
    mdx(),
    react(),
    sitemap({
      filter: (page) => !page.includes('/search-index.json'),
    }),
  ],
});
