#!/usr/bin/env node

/**
 * Content Validation Script for TechShoulders
 *
 * Validates:
 * 1. Schema compliance for all content types
 * 2. Inline edge endpoints exist (target references)
 * 3. Image attribution completeness
 * 4. ID matches filename
 * 5. signatureWorks references exist
 * 6. Pack cards references exist
 * 7. Orphaned nodes (nodes with no edges)
 *
 * IMPORTANT: Schema Sync Requirement
 * ----------------------------------
 * The Zod schemas defined below MUST be kept in sync with src/content/config.ts.
 * The schemas here are a simplified version (no Astro image() helper) for
 * standalone Node.js validation.
 *
 * When updating content schemas:
 * 1. Update src/content/config.ts (canonical source)
 * 2. Mirror the changes here (without Astro-specific types)
 * 3. Run `pnpm validate` to verify
 *
 * Key differences from config.ts:
 * - imageSchema.file uses z.string() instead of Astro's image()
 * - linksSchema.url uses z.string() instead of z.string().url()
 *   (simpler validation for standalone script)
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { z } from 'zod';

const CONTENT_DIR = 'src/content';

// Slug validation: lowercase letters, numbers, hyphens only
const slugSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must be lowercase with hyphens (e.g., "linus-torvalds")'
  );

// Edge types for relationships between nodes
const edgeKindSchema = z.enum(['influence', 'affiliation']);

// Inline edge schema - each node declares its outgoing edges
const inlineEdgeSchema = z.object({
  target: slugSchema,
  kind: edgeKindSchema,
  label: z.string().optional(),
  year: z.number().optional(),
});

// Schema definitions (matching src/content/config.ts)
const imageSchema = z.object({
  file: z.string(), // Local path to image in src/assets/
  source: z.string(), // URL for attribution
  license: z.string(),
  author: z.string(),
});

const linksSchema = z.array(
  z.object({
    label: z.string(),
    url: z.string(),
  })
);

const personSchema = z.object({
  id: slugSchema,
  type: z.literal('person'),
  name: z.string().min(1),
  domains: z.array(z.string()).min(1),
  era: z.string().min(1),
  edges: z.array(inlineEdgeSchema).default([]),
  title: z.string().optional(),
  signatureWorks: z.array(slugSchema).optional(),
  whyYouCare: z.array(z.string()).optional(),
  links: linksSchema.optional(),
  image: imageSchema.optional(),
});

const workSchema = z.object({
  id: slugSchema,
  type: z.literal('work'),
  name: z.string().min(1),
  kind: z.string().min(1),
  domains: z.array(z.string()).min(1),
  era: z.string().min(1),
  edges: z.array(inlineEdgeSchema).default([]),
  year: z.number().optional(),
  links: linksSchema.optional(),
  image: imageSchema.optional(),
});

const institutionSchema = z.object({
  id: slugSchema,
  type: z.literal('institution'),
  name: z.string().min(1),
  kind: z.string().min(1),
  domains: z.array(z.string()).min(1),
  era: z.string().min(1),
  edges: z.array(inlineEdgeSchema).default([]),
  location: z.string().optional(),
  links: linksSchema.optional(),
  image: imageSchema.optional(),
});

const packSchema = z.object({
  id: slugSchema,
  type: z.literal('pack'),
  name: z.string().min(1),
  description: z.string().min(1),
  domains: z.array(z.string()).min(1),
  era: z.string().min(1),
  cards: z.array(slugSchema).min(1),
  edges: z.array(inlineEdgeSchema).default([]),
  icon: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  estimatedTime: z.string().optional(),
  links: linksSchema.optional(),
  image: imageSchema.optional(),
});

function parseValue(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
  // Remove quotes if present
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

// YAML parser for our specific format
function parseYamlFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yaml = match[1];
  const result = {};
  const lines = yaml.split('\n');

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Match top-level key
    const topMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
    if (topMatch) {
      const key = topMatch[1];
      const value = topMatch[2].trim();

      if (value === '[]') {
        // Empty array on same line
        result[key] = [];
        i++;
      } else if (value === '') {
        // Could be array or object - check next line
        i++;
        if (i < lines.length) {
          const nextLine = lines[i];
          if (nextLine.match(/^\s+-/)) {
            // It's an array
            result[key] = [];
            while (i < lines.length && lines[i].match(/^\s+-/)) {
              const itemMatch = lines[i].match(/^\s+-\s*(.*)$/);
              if (itemMatch) {
                const itemValue = itemMatch[1].trim();
                if (itemValue.includes(':')) {
                  // Object in array (like links or edges)
                  const obj = {};
                  const colonIndex = itemValue.indexOf(':');
                  const k = itemValue.slice(0, colonIndex).trim();
                  const v = itemValue.slice(colonIndex + 1).trim();
                  obj[k] = parseValue(v);
                  i++;
                  // Check for more properties in this object
                  while (i < lines.length && lines[i].match(/^\s{4,}[a-zA-Z]/)) {
                    const propMatch = lines[i].match(/^\s+([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
                    if (propMatch) {
                      obj[propMatch[1]] = parseValue(propMatch[2].trim());
                    }
                    i++;
                  }
                  result[key].push(obj);
                } else {
                  result[key].push(parseValue(itemValue));
                  i++;
                }
              } else {
                i++;
              }
            }
          } else if (nextLine.match(/^\s+[a-zA-Z]/)) {
            // It's an object
            result[key] = {};
            while (i < lines.length && lines[i].match(/^\s+[a-zA-Z]/)) {
              const propMatch = lines[i].match(/^\s+([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
              if (propMatch) {
                result[key][propMatch[1]] = parseValue(propMatch[2].trim());
              }
              i++;
            }
          }
        }
      } else {
        result[key] = parseValue(value);
        i++;
      }
    } else {
      i++;
    }
  }

  return result;
}

// Validation results
const errors = [];
const warnings = [];

function error(file, message) {
  errors.push(`ERROR [${file}]: ${message}`);
}

function warn(file, message) {
  warnings.push(`WARNING [${file}]: ${message}`);
}

// Collect all node IDs and their edges
function collectNodesAndEdges() {
  const nodeIds = new Set();
  const allEdges = []; // { source, target, kind }

  const collections = ['people', 'works', 'institutions'];

  for (const collection of collections) {
    const dir = join(CONTENT_DIR, collection);
    if (!existsSync(dir)) continue;

    const files = readdirSync(dir).filter((f) => f.endsWith('.mdx'));
    for (const file of files) {
      const content = readFileSync(join(dir, file), 'utf-8');
      const data = parseYamlFrontmatter(content);
      if (data?.id) {
        nodeIds.add(data.id);
        // Collect inline edges
        if (data.edges && Array.isArray(data.edges)) {
          for (const edge of data.edges) {
            allEdges.push({
              source: data.id,
              target: edge.target,
              kind: edge.kind,
            });
          }
        }
      }
    }
  }

  return { nodeIds, allEdges };
}

// Check for orphaned nodes (nodes with no edges)
function checkOrphanedNodes(nodeIds, edges) {
  const connectedNodes = new Set();

  for (const edge of edges) {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  }

  const orphaned = [];
  for (const nodeId of nodeIds) {
    if (!connectedNodes.has(nodeId)) {
      orphaned.push(nodeId);
    }
  }

  return orphaned;
}

// Validate a single MDX file
function validateMdxFile(filePath, schema, _collection) {
  const content = readFileSync(filePath, 'utf-8');
  const data = parseYamlFrontmatter(content);
  const filename = basename(filePath, '.mdx');

  if (!data) {
    error(filePath, 'Could not parse frontmatter');
    return null;
  }

  // Validate schema
  const result = schema.safeParse(data);
  if (!result.success) {
    for (const issue of result.error.issues) {
      error(filePath, `Schema validation failed: ${issue.path.join('.')} - ${issue.message}`);
    }
    return null;
  }

  // Validate ID matches filename
  if (data.id !== filename) {
    error(filePath, `ID "${data.id}" does not match filename "${filename}"`);
  }

  // Validate image attribution completeness
  if (data.image) {
    const imageFields = ['file', 'source', 'license', 'author'];
    for (const field of imageFields) {
      if (!data.image[field]) {
        error(filePath, `Image is present but missing required field: image.${field}`);
      }
    }
  }

  return data;
}

// Validate inline edges
function validateInlineEdges(data, nodeIds, filePath) {
  if (!data?.edges) return;

  for (let i = 0; i < data.edges.length; i++) {
    const edge = data.edges[i];

    if (!nodeIds.has(edge.target)) {
      error(filePath, `Edge ${i}: target "${edge.target}" does not exist`);
    }
  }
}

// Validate signatureWorks references
function validateSignatureWorks(people, nodeIds, filePath) {
  if (!people?.signatureWorks) return;

  for (const workId of people.signatureWorks) {
    if (!nodeIds.has(workId)) {
      error(filePath, `signatureWorks reference "${workId}" does not exist`);
    }
  }
}

// Validate pack cards references
function validatePackCards(pack, nodeIds, filePath) {
  if (!pack?.cards) return;

  for (const cardId of pack.cards) {
    if (!nodeIds.has(cardId)) {
      error(filePath, `Pack card reference "${cardId}" does not exist`);
    }
  }
}

// Main validation function
function validate() {
  console.log('Validating TechShoulders content...\n');

  // First pass: collect all node IDs and edges
  const { nodeIds, allEdges } = collectNodesAndEdges();
  console.log(`Found ${nodeIds.size} nodes\n`);

  // Validate people
  const peopleDir = join(CONTENT_DIR, 'people');
  if (existsSync(peopleDir)) {
    console.log('Validating people...');
    const files = readdirSync(peopleDir).filter((f) => f.endsWith('.mdx'));
    for (const file of files) {
      const filePath = join(peopleDir, file);
      const data = validateMdxFile(filePath, personSchema, 'people');
      if (data) {
        validateSignatureWorks(data, nodeIds, filePath);
        validateInlineEdges(data, nodeIds, filePath);
      }
    }
    console.log(`  Checked ${files.length} files`);
  }

  // Validate works
  const worksDir = join(CONTENT_DIR, 'works');
  if (existsSync(worksDir)) {
    console.log('Validating works...');
    const files = readdirSync(worksDir).filter((f) => f.endsWith('.mdx'));
    for (const file of files) {
      const filePath = join(worksDir, file);
      const data = validateMdxFile(filePath, workSchema, 'works');
      if (data) {
        validateInlineEdges(data, nodeIds, filePath);
      }
    }
    console.log(`  Checked ${files.length} files`);
  }

  // Validate institutions
  const institutionsDir = join(CONTENT_DIR, 'institutions');
  if (existsSync(institutionsDir)) {
    console.log('Validating institutions...');
    const files = readdirSync(institutionsDir).filter((f) => f.endsWith('.mdx'));
    for (const file of files) {
      const filePath = join(institutionsDir, file);
      const data = validateMdxFile(filePath, institutionSchema, 'institutions');
      if (data) {
        validateInlineEdges(data, nodeIds, filePath);
      }
    }
    console.log(`  Checked ${files.length} files`);
  }

  // Validate packs
  const packsDir = join(CONTENT_DIR, 'packs');
  if (existsSync(packsDir)) {
    console.log('Validating packs...');
    const files = readdirSync(packsDir).filter((f) => f.endsWith('.mdx'));
    for (const file of files) {
      const filePath = join(packsDir, file);
      const data = validateMdxFile(filePath, packSchema, 'packs');
      if (data) {
        validatePackCards(data, nodeIds, filePath);
        validateInlineEdges(data, nodeIds, filePath);
      }
    }
    console.log(`  Checked ${files.length} files`);
  }

  // Check for orphaned nodes
  console.log('Checking for orphaned nodes...');
  const orphaned = checkOrphanedNodes(nodeIds, allEdges);
  if (orphaned.length > 0) {
    for (const nodeId of orphaned) {
      warn('orphan-check', `Node "${nodeId}" has no edges (orphaned)`);
    }
  }
  console.log(`  Found ${orphaned.length} orphaned node(s)`);

  // Print results
  console.log('\n' + '='.repeat(50));

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    for (const w of warnings) {
      console.log(`  ${w}`);
    }
  }

  if (errors.length > 0) {
    console.log('\nErrors:');
    for (const e of errors) {
      console.log(`  ${e}`);
    }
    console.log(`\nValidation FAILED with ${errors.length} error(s)`);
    process.exit(1);
  }

  console.log('\nValidation PASSED');
  process.exit(0);
}

validate();
