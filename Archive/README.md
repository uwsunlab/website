# Archive

This folder stores migrated or inventoried Squarespace content that should remain in the repository but should not be visible on the public Astro site.

Keep this folder outside `src/pages` and do not import files from here into public routes unless the content is intentionally promoted into `src/content`.

## Content locations

- Current public site content: `src/content/`
- Archived live Squarespace snapshot: `Archive/live-site/`

`Archive/live-site/` contains:

- `pages/`: Markdown files with extracted text and image references
- `raw-html/`: original fetched HTML for each sitemap page
- `media/`: downloaded images from Squarespace sitemap image URLs
- `sitemap.xml`: fetched live sitemap
- `sitemap.json`: page manifest
- `media-manifest.json`: downloaded media manifest

Current public route mapping:

- `/home` -> `/`
- `/research-v3-1` -> `/research/`
- `/team` -> `/people/`
- `/papers` -> `/papers/`
- `/blog` -> `/media/`
- `/gallery` -> `/gallery/`
- `/join-us` -> `/contact/`
- `/contact` -> `/contact/`
