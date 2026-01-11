import { z, defineCollection } from 'astro:content';

const linksSchema = z.array(z.object({
  label: z.string(),
  url: z.string(),
})).optional();

/**
 * Edge Classification (Two Tiers)
 *
 * Edges are classified to prevent graph clutter as content scales:
 *
 * STRONG edges (kind: 'influence') - shown by default:
 *   created, invented, influenced, inspired, built_on, popularized, standardized
 *
 * WEAK edges (kind: 'affiliation') - hidden by default, toggled on:
 *   studied at, worked at, professor at, fellow at, founded, funded_by
 *
 * See src/lib/edgeClassification.ts for the canonical list.
 */
const edgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  kind: z.enum(['influence', 'affiliation']),
  label: z.string().optional(),
});

const edges = defineCollection({
  type: 'data',
  schema: z.array(edgeSchema),
});

const people = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    id: z.string(),
    name: z.string(),
    title: z.string().optional(),
    era: z.string(),
    domains: z.array(z.string()).optional(),
    signatureWorks: z.array(z.string()).optional(),
    whyYouCare: z.array(z.string()).optional(),
    links: linksSchema,
    image: z.object({
      file: image(),
      source: z.string(),
      license: z.string(),
      author: z.string(),
    }).optional(),
  }),
});

const works = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    id: z.string(),
    name: z.string(),
    kind: z.string(),
    year: z.number(),
    domains: z.array(z.string()).optional(),
    links: linksSchema,
    image: z.object({
      file: image(),
      source: z.string(),
      license: z.string(),
      author: z.string(),
    }).optional(),
  }),
});

const institutions = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    id: z.string(),
    name: z.string(),
    kind: z.string(),
    location: z.string().optional(),
    links: linksSchema,
    image: z.object({
      file: image(),
      source: z.string(),
      license: z.string(),
      author: z.string(),
    }).optional(),
  }),
});

const packs = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    icon: z.string().optional(), // emoji or icon identifier
    cards: z.array(z.string()), // ordered array of node IDs - serves as learning path
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
    estimatedTime: z.string().optional(), // e.g., "30 min", "1 hour"
    image: z.object({
      file: image(),
      source: z.string(),
      license: z.string(),
      author: z.string(),
    }).optional(),
  }),
});

export const collections = {
  people,
  works,
  institutions,
  edges,
  packs,
};
