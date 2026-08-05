import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { getYouTubeVideoId } from './utils/youtube';

const linkSchema = z.object({
  label: z.string(),
  url: z.url()
});

const people = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/people' }),
  // photo accepts a local asset (current members, optimised through the pipeline) or a
  // bare string (alumni still on remote Squarespace URLs, kept as-is and not rendered).
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      status: z.enum(['current', 'alumni']),
      group: z.string().optional(),
      photo: image().or(z.string()).optional(),
      email: z.email().optional(),
      affiliation: z.string().or(z.array(z.string())).optional(),
      whereabouts: z.string().optional(),
      links: z.array(linkSchema).default([]),
      order: z.number().default(100)
    })
});

const papers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/papers' }),
  schema: z.object({
    title: z.string(),
    authors: z.string(),
    venue: z.string(),
    year: z.number(),
    summary: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    doi: z.string().optional(),
    url: z.url().optional(),
    pdf: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().default(100)
  })
});

const media = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/media' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      summary: z.string(),
      source: z.string().optional(),
      category: z.enum(['lecture', 'interview', 'article', 'tutorial', 'video', 'news', 'event']).default('article'),
      image: image().optional(),
      imageAlt: z.string().optional(),
      externalUrl: z.url().optional()
    })
});

const home = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/home' }),
  schema: ({ image }) =>
    z.object({
      image: image(),
      imageAlt: z.string()
    })
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    date: z.coerce.date(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    relatedUrl: z.url().optional()
  })
});

// Gallery dates encode their own precision in the format: `2026-05` means only the month
// is known, `2026-05-21` means the exact day is. YAML hands the day form over as a Date
// (unquoted) or a string (quoted), and the month form as a string, so accept all three and
// normalise to one shape. Month-only dates sort as the 1st of that month.
const galleryDate = z
  .union([
    z.date(),
    z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'Gallery date must be YYYY-MM or YYYY-MM-DD')
  ])
  .transform((raw) => {
    if (raw instanceof Date) return { value: raw, precision: 'day' as const };
    const [year, month, day] = raw.split('-').map(Number);
    return day
      ? { value: new Date(Date.UTC(year, month - 1, day)), precision: 'day' as const }
      : { value: new Date(Date.UTC(year, month - 1, 1)), precision: 'month' as const };
  });

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gallery' }),
  // An item is either a photo (image) or a YouTube video (videoUrl). At least one must be
  // present; a video item's tile and poster come from YouTube, so it needs no local image.
  // `order` marks an item as pinned: pinned items sort first (by order), everything else
  // sorts newest-first by date. `dateLabel` replaces the displayed date (e.g. the logo).
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        date: galleryDate.optional(),
        dateLabel: z.string().optional(),
        caption: z.string(),
        image: image().optional(),
        imageAlt: z.string().optional(),
        videoUrl: z.string().optional(),
        layout: z.enum(['grid', 'full']).default('grid'),
        order: z.number().optional()
      })
      .refine((data) => data.image !== undefined || getYouTubeVideoId(data.videoUrl) !== null, {
        message: 'A gallery item needs an image, or a videoUrl that is a valid YouTube link.'
      })
      .refine((data) => data.date !== undefined || data.order !== undefined, {
        message: 'An unpinned gallery item needs a date, or it cannot be sorted.'
      })
});

const researchProjects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/research-projects' }),
  // Not currently rendered (ResearchCard is unused), but kept valid and pipeline-ready
  // so it can be revived without dangling image refs.
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      area: z.string().optional(),
      subtitle: z.string().optional(),
      summary: z.string(),
      category: z.enum(['hardware', 'software', 'collaboration']).default('hardware'),
      image: image().optional(),
      imageAlt: z.string().optional(),
      order: z.number().default(100),
      tags: z.array(z.string()).default([])
    })
});

const openings = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/openings' }),
  schema: z.object({
    title: z.string(),
    status: z.enum(['open', 'closed']),
    type: z.string().optional(),
    summary: z.string(),
    applyUrl: z.url().optional(),
    order: z.number().default(100)
  })
});

export const collections = {
  people,
  papers,
  media,
  home,
  news,
  gallery,
  researchProjects,
  openings
};
