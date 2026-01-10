import { z, defineCollection } from 'astro:content';

const imageSchema = z.object({
  url: z.string(),
  source: z.string(),
  license: z.string(),
  author: z.string(),
}).optional();

const linksSchema = z.array(z.object({
  label: z.string(),
  url: z.string(),
})).optional();

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
  schema: z.object({
    id: z.string(),
    name: z.string(),
    title: z.string().optional(),
    era: z.string(),
    domains: z.array(z.string()).optional(),
    signatureWorks: z.array(z.string()).optional(),
    whyYouCare: z.array(z.string()).optional(),
    links: linksSchema,
    image: imageSchema,
  }),
});

const works = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    name: z.string(),
    kind: z.string(),
    year: z.number(),
    domains: z.array(z.string()).optional(),
    links: linksSchema,
    image: imageSchema,
  }),
});

const institutions = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    name: z.string(),
    kind: z.string(),
    location: z.string().optional(),
    links: linksSchema,
    image: imageSchema,
  }),
});

const packs = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    icon: z.string().optional(), // emoji or icon identifier
    cards: z.array(z.string()), // ordered array of node IDs - serves as learning path
    image: imageSchema,
  }),
});

export const collections = {
  people,
  works,
  institutions,
  edges,
  packs,
};
