import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Long-form essays.
const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // Optional slug override; defaults to the file id (kebab-cased filename).
    slug: z.string().optional(),
  }),
});

export const collections = { writing };
