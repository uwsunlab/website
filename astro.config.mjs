import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';

import externalLinks from './scripts/satteri-external-links.mjs';

const isGithubPagesPreview =
  process.env.GITHUB_REPOSITORY === 'uwsunlab/website' &&
  process.env.GITHUB_REF_NAME === 'pages-test';

export default defineConfig({
  site: isGithubPagesPreview ? 'https://uwsunlab.github.io' : 'https://camsunlab.com',
  base: isGithubPagesPreview ? '/website' : undefined,
  output: 'static',
  markdown: {
    processor: satteri({ hastPlugins: [externalLinks] })
  }
});
