import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';

import externalLinks from './scripts/satteri-external-links.mjs';

// Pages is served from the apex domain, so the site lives at the root and needs no base.
// The old `/website` base was for the uwsunlab.github.io/website preview URL, which GitHub
// now 301s to the custom domain — so that base only broke asset paths in production.
export default defineConfig({
  site: 'https://camsunlab.com',
  output: 'static',
  markdown: {
    processor: satteri({ hastPlugins: [externalLinks] })
  }
});
