# Camsun Lab Website

Static Astro site for `camsunlab.com`, designed to be maintained through GitHub and deployed on Cloudflare Pages.

## Local Setup

Install Node.js 22.12 or newer, then run:

```sh
npm install
npm run dev
```

Useful commands:

```sh
npm run check
npm run build
npm run preview
```

## Editing Content

Most public content is stored in `src/content`:

- `people`: current members and alumni
- `papers`: publication metadata and featured papers
- `media`: blog, interview, tutorial, lecture, and press links
- `gallery`: gallery captions and image metadata
- `research-projects`: research-area and project summaries
- `openings`: opportunities and application notes

The full Papers page also uses `src/data/scholarPapers.ts`, generated from Shijing Sun's Google Scholar profile and enriched with DOI links where verified. Keep DOI fields editable so incomplete records can be polished by hand.

Each entry is a Markdown file with YAML frontmatter. For example:

```md
---
title: Example paper
authors:
  - First Author
venue: Journal name
year: 2026
featured: true
---

Optional notes can go here.
```

## Routes

The public site follows the live Squarespace intent with updated labels:

- `/`
- `/research/`
- `/people/`
- `/papers/`
- `/media/`
- `/gallery/`
- `/contact/`

The primary navigation is Home, Research, People, Papers, Media, Gallery, and Contact. Joining/recruitment information lives on Contact.

Legacy or past content belongs in the top-level `Archive/` folder. That folder is outside `src/pages` and is not publicly routed by Astro.

## Visual Direction

The style source of truth is `STYLE_README.md`. The visual identity is an ivory academic canvas, structured by Cambridge teal, warmed by rose accents. Keep page openings centered, Goodwin-like, and quiet: title first, optional one-sentence intro, then generous image/text sections and compact year-based publication lists.

## Cloudflare Pages

When the GitHub repository is ready, connect it in Cloudflare Pages using the Git integration.

- Framework preset: Astro
- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`

Cloudflare Pages creates preview deployments for pull requests and non-production branches. DNS and custom-domain setup are intentionally deferred until the site content is ready.

Set the Cloudflare Pages environment variable `NODE_VERSION` to `22` if the build image does not pick up the repo runtime automatically.

References:

- https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/
- https://developers.cloudflare.com/pages/get-started/git-integration/

## Migration Notes

Before switching traffic away from Squarespace:

1. Crawl the current site and export available Squarespace content.
2. Move real copy, photos, people profiles, publication records, and opportunity notes into `src/content` and `public/images`.
3. Compare old public URLs against the Astro routes.
4. Add redirects for any changed slugs.
5. Run `npm run check`, `npm run build`, and a manual preview review.
