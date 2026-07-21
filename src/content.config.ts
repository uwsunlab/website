import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const linkSchema = z.object({
  label: z.string(),
  url: z.url()
});

const people = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/people' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    status: z.enum(['current', 'alumni']),
    group: z.string().optional(),
    photo: z.string().optional(),
    email: z.email().optional(),
    affiliation: z.string().optional(),
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
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    source: z.string().optional(),
    category: z.enum(['lecture', 'interview', 'article', 'tutorial', 'video', 'news', 'event']).default('article'),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    externalUrl: z.url().optional()
  })
});

const home = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/home' }),
  schema: z.object({
    image: z.string(),
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

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gallery' }),
  schema: z.object({
    title: z.string(),
    date: z.string().optional(),
    caption: z.string(),
    image: z.string(),
    imageAlt: z.string().optional(),
    layout: z.enum(['grid', 'full']).default('grid'),
    order: z.number().default(100)
  })
});

const researchProjects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/research-projects' }),
  schema: z.object({
    title: z.string(),
    area: z.string().optional(),
    subtitle: z.string().optional(),
    summary: z.string(),
    category: z.enum(['hardware', 'software', 'collaboration']).default('hardware'),
    image: z.string().optional(),
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
