import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';

import externalLinks from './scripts/satteri-external-links.mjs';

export default defineConfig({
  site: 'https://camsunlab.com',
  output: 'static',
  markdown: {
    processor: satteri({ hastPlugins: [externalLinks] })
  }
});
