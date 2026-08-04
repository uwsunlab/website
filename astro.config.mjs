import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';

import externalLinks from './scripts/satteri-external-links.mjs';

// Pages is served from the apex domain, so the site lives at the root and needs no base.
// The old `/website` base was for the uwsunlab.github.io/website preview URL, which GitHub
// now 301s to the custom domain — so that base only broke asset paths in production.
export default defineConfig({
  site: 'https://camsunlab.com',
  output: 'static',
  // The joining page moved from /contact/ to /join-us/. Pages is a static host with no
  // server-side redirects, so Astro emits a meta-refresh page to keep the old URL — which
  // was live on the previous site — working for bookmarks and search results.
  redirects: {
    '/contact': '/join-us/'
  },
  markdown: {
    processor: satteri({ hastPlugins: [externalLinks] })
  }
});
