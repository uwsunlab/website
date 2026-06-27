# Camsun Lab Visual Style

This file is the source of truth for the website's visual identity. All page
templates, components, and future visual edits should preserve this system.

## Identity

The site should feel like an ivory academic canvas, structured by Cambridge
teal, warmed by rose accents.

Use color approximately as:

- 70% ivory and cream for page canvas, breathing room, and content areas
- 20% Cambridge teal for structure, section titles, links, rules, and primary controls
- 10% rose for highlights, hover states, and small graphics

The visual tone is quiet, scholarly, image-led, and carefully aligned. Avoid
decorative clutter.

## Color Palette

| Role | Colour | Hex | Use |
|---|---|---:|---|
| Primary | Deep Cambridge teal | `#006B68` | Header accents, buttons, section titles, links |
| Text | Dark ink | `#1F2A2A` | Main body text |
| Background | Ivory | `#F7F1E6` | Page background, large content areas |
| Card/background | Warm cream | `#F5EBDD` | Secondary backgrounds, research cards, people cards, content panels |
| Accent | Muted rose | `#C96F6F` | Highlights, icons, hover states, small graphics |
| Secondary | Slate teal/grey | `#5F7F7B` | Captions, metadata, secondary text |

CSS variables:

```css
:root {
  --teal: #006B68;
  --teal-dark: #004F4D;
  --ivory: #F7F1E6;
  --cream: #F5EBDD;
  --rose: #C96F6F;
  --ink: #1F2A2A;
  --muted: #5F7F7B;

  --paper: var(--ivory);
  --paper-soft: var(--cream);
  --line: rgb(0 107 104 / 0.18);
  --link: var(--teal);
  --accent: var(--rose);
}
```

Rules:

- Background hierarchy: first `--ivory`, second `--cream`, third `--rose`.
- Text hierarchy: first `--ink`, second `--teal-dark`, third `--muted`.
- Default text is `--ink`.
- Default page background is `--ivory`.
- Content panels and alternate sections use `--cream`.
- Section titles, links, active navigation, and structural rules use teal or teal-dark.
- Rose is used sparingly for hover states, highlights, icons, and warm details.
- Use cream for soft background blocks, mats, and subtle panels.
- Do not introduce arbitrary colors. Add a token here first if a new color is truly needed.
- Do not use pure white backgrounds.

## Typography

Use `"Helvetica Neue", Arial, sans-serif` everywhere.

- Page title (`h1`): centered near the top of the page, dark ink, `font-weight: 400`, max width about `900px`.
- Section and subsection titles (`h2`): Cambridge teal, `font-weight: 500`.
- Small headings (`h3`): dark ink, `font-weight: 500`.
- Body text: dark ink or slate teal/grey for quieter support copy.
- Metadata, captions, dates, roles: slate teal/grey.
- Links: Cambridge teal with a subtle underline.

Do not scale text directly with viewport width outside the established `clamp()`
rules in `src/styles/global.css`.

## Blocks And Coordinates

The site uses a shared coordinate system.

- Page container: `width: min(1200px, calc(100% - 8vw))`, centered.
- Title block: centered at the top of the page, max width about `900px`.
- Intro line: centered under the title, max width about `680px`.
- Prose block: left aligned, max width about `760px`.
- Image or video block: full container width, or paired with text in a two-column layout.
- Desktop media/text block: roughly `55/45` or `60/40`.
- Mobile below `820px`: all multi-column blocks stack vertically.
- Section spacing: generous vertical padding, with thin teal-tinted separators.

### Title Block

Use one page-level `h1`. The title sits centered near the top with an optional
one-sentence intro below it. Do not add decorative eyebrow labels.

### Text Block

Use a narrow measure for prose. Avoid long full-width paragraphs. Keep body copy
left aligned unless it belongs in the top title block.

### Photo Or Video Block

Images and videos should have stable aspect ratios. Large research and gallery
media should span the full container or sit in the media side of a two-column
block. Use warm cream mats only when a frame is needed.

### Card Or Panel Block

Cards should be flat and quiet. Use warm cream backgrounds, thin teal-tinted
borders, and no shadows. Do not nest cards inside cards.

### Button

Primary buttons use Cambridge teal. Rose appears on hover/focus or as a rare
highlight. Secondary actions should usually be text links.

## Page Recipes

### Home

1. Centered title and mission.
2. Large hero photo below the title in a warm mat.
3. Short left-aligned research statement.
4. News list on a cream band.

### Research

1. Centered title and one-sentence intro.
2. Closed-loop concept prose block with a four-step teal structure.
3. Platform rows/cards with large image and short text.

### People

1. Centered title and one-sentence intro.
2. Three-column people grid on desktop.
3. Warm cream or ivory portrait areas, names in ink, roles in muted slate teal.

### Papers

1. Centered `Publications` title and short intro.
2. Optional publication-cover strip.
3. Compact preprints/year sections with teal year headings and thin separators.

### Media

1. Centered title and short intro.
2. Image/text rows, with image left and text right on desktop.
3. Mobile stacks image then text.

### Gallery

1. Centered title and short intro.
2. Large dated photo/event blocks.
3. Short captions aligned under the image.

### Contact

1. Centered title and short intro.
2. Email/address two-column block.
3. Joining information and openings on a cream band.

## Do And Do Not

Do:

- Use ivory, cream, teal, and rose consistently.
- Keep graphics aligned to the shared container.
- Keep images large, direct, and properly cropped.
- Use thin teal-tinted rules to structure long pages.
- Preserve one page-level `h1`.

Do not:

- Use pure white backgrounds.
- Use gradients, heavy shadows, or glossy effects.
- Add decorative cards, pills, or labels without content value.
- Introduce arbitrary colors.
- Let images, buttons, or text overlap or shift layout.
