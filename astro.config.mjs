import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Production origin — drives canonical URLs, the sitemap, and absolute
// og:image URLs.
const SITE = 'https://www.palashawasthi.com';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  // Static output is the default in Astro 7.
  // The dev toolbar is a development-only overlay (never in the build); turn it
  // off so the preview is clean.
  devToolbar: { enabled: false },
  integrations: [mdx(), sitemap()],
  markdown: {
    // Astro 7's default markdown engine is Sätteri (Rust). It supports Shiki
    // highlighting via shikiConfig. We compute reading time in JS rather than a
    // remark plugin, so we keep the fast default engine.
    shikiConfig: {
      theme: 'vitesse-light',
      wrap: true,
    },
  },
});
