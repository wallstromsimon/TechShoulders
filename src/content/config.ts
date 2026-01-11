import { z, defineCollection, type SchemaContext } from 'astro:content';

// Slug validation: lowercase letters, numbers, hyphens only
const slugSchema = z.string().regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  'Slug must be lowercase with hyphens (e.g., "linus-torvalds")'
);

// Edge types for relationships between nodes
const edgeKindSchema = z.enum([
  'influence',   // intellectual influence, inspiration, creation
  'affiliation', // worked at, studied at, member of
]);

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

// Inline edge schema - each node declares its outgoing edges
const inlineEdgeSchema = z.object({
  target: slugSchema,
  kind: edgeKindSchema,
  label: z.string().optional(), // e.g., "created", "studied at"
  year: z.number().optional(),  // year the relationship began
});

// External links schema
const linksSchema = z.array(z.object({
  label: z.string(),
  url: z.string().url(),
})).optional();

// Image schema with required attribution fields
// When image is provided, all metadata is required for proper attribution
const createImageSchema = (image: SchemaContext['image']) =>
  z.object({
    file: image(),
    source: z.string().url(),
    author: z.string(),
    license: z.string(),
  }).optional();

// =============================================================================
// COLLECTION SCHEMAS
// Each collection enforces strict typing for content integrity
// =============================================================================

const people = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    // Identity (required, stable)
    id: slugSchema,
    type: z.literal('person'),
    name: z.string().min(1),

    // Classification (required)
    domains: z.array(z.string()).min(1),
    era: z.string().min(1), // e.g., "1990s–present", "18th century"

    // Relationships (required, can be empty)
    edges: z.array(inlineEdgeSchema).default([]),

    // Optional metadata
    title: z.string().optional(),
    signatureWorks: z.array(slugSchema).optional(),
    whyYouCare: z.array(z.string()).optional(),
    links: linksSchema,
    image: createImageSchema(image),
  }),
});

const works = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    // Identity (required, stable)
    id: slugSchema,
    type: z.literal('work'),
    name: z.string().min(1),

    // Classification (required)
    kind: z.string().min(1), // e.g., "project", "book", "paper"
    domains: z.array(z.string()).min(1),
    era: z.string().min(1), // e.g., "1991", "1990s"

    // Relationships (required, can be empty)
    edges: z.array(inlineEdgeSchema).default([]),

    // Optional metadata
    year: z.number().optional(), // Specific year if known
    links: linksSchema,
    image: createImageSchema(image),
  }),
});

const institutions = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    // Identity (required, stable)
    id: slugSchema,
    type: z.literal('institution'),
    name: z.string().min(1),

    // Classification (required)
    kind: z.string().min(1), // e.g., "university", "lab", "company"
    domains: z.array(z.string()).min(1),
    era: z.string().min(1), // e.g., "1640–present", "2000–2007"

    // Relationships (required, can be empty)
    edges: z.array(inlineEdgeSchema).default([]),

    // Optional metadata
    location: z.string().optional(),
    links: linksSchema,
    image: createImageSchema(image),
  }),
});

const packs = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    // Identity (required, stable)
    id: slugSchema,
    type: z.literal('pack'),
    name: z.string().min(1),

    // Classification (required)
    description: z.string().min(1),
    domains: z.array(z.string()).min(1),
    era: z.string().min(1), // e.g., "1990s–2000s", "Modern"

    // Content (required)
    cards: z.array(slugSchema).min(1), // Ordered node IDs for learning path

    // Relationships (required, can be empty)
    edges: z.array(inlineEdgeSchema).default([]),

    // Optional metadata
    icon: z.string().optional(), // emoji or icon identifier
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
    estimatedTime: z.string().optional(), // e.g., "30 min", "1 hour"
    links: linksSchema,
    image: createImageSchema(image),
  }),
});

export const collections = {
  people,
  works,
  institutions,
  packs,
};
