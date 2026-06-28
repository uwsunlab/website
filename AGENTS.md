# Agent Instructions

This repo is the source of truth for the Camsun Lab website.

## Working Rules

- Preserve the public route structure unless the user explicitly approves a URL change.
- Keep the visible primary navigation to Research, People, Papers, Media, Gallery, and Contact. The header brand links to Home.
- Prefer editing content files in `src/content` before changing page templates.
- Keep content schemas in `src/content.config.ts` aligned with the Markdown frontmatter used in the repo.
- Keep `src/data/scholarPapers.ts` reverse-chronological and DOI-focused; use Scholar/Crossref verification before changing bibliographic metadata.
- Keep joining/recruitment content on the Contact page unless the user asks to split it out again.
- Keep legacy and superseded Squarespace content in top-level `Archive/`; do not import it or place it under `src/pages`.
- Do not invent lab-specific claims, names, addresses, funding information, or publication metadata.
- Keep pages static and Cloudflare Pages friendly.
- Use accessible markup: one page-level `h1`, descriptive links, meaningful alt text, and responsive image sizing.
- Keep visual style restrained and readable for an academic research group, following `STYLE_README.md`: ivory academic canvas, Cambridge teal structure, rose accents.
- Keep non-home page openings centered: page title first, optional one-sentence intro, then content.
- Avoid decorative eyebrow labels, bulky cards, pill tags, and heavy buttons unless they add clear meaning.

## Verification

After code changes, run:

```sh
npm run check
npm run build
```

If Node.js or dependencies are unavailable, state that clearly in the handoff.
