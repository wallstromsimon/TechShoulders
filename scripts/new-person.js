#!/usr/bin/env node

/**
 * Create a new person entry
 * Usage: pnpm new:person <slug>
 * Example: pnpm new:person ada-lovelace
 */

import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const CONTENT_DIR = 'src/content/people';

const slug = process.argv[2];

if (!slug) {
  console.error('Usage: pnpm new:person <slug>');
  console.error('Example: pnpm new:person ada-lovelace');
  process.exit(1);
}

// Validate slug format
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error('Error: Slug must be lowercase with hyphens (e.g., ada-lovelace)');
  process.exit(1);
}

const filePath = join(CONTENT_DIR, `${slug}.mdx`);

if (existsSync(filePath)) {
  console.error(`Error: ${filePath} already exists`);
  process.exit(1);
}

// Generate a readable name from slug
const name = slug
  .split('-')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

const template = `---
id: ${slug}
type: person
name: ${name}
title: # e.g., "Creator of X" or "Pioneer of Y"
era: # e.g., "1950s-1990s" or "1990s-present" (REQUIRED)
domains:
  - # e.g., Operating Systems, Programming Languages (at least one REQUIRED)
signatureWorks:
  - # Reference to work IDs (e.g., linux-kernel)
whyYouCare:
  - # Why this person matters (bullet points)
edges:
  - target: # target node ID (e.g., linux-kernel)
    kind: influence # influence or affiliation
    label: created # e.g., created, invented, worked at
links:
  - label: Wikipedia
    url: https://en.wikipedia.org/wiki/
image:
  file: ../../assets/images/entities/${slug}.jpg
  source: # Wikimedia Commons URL
  license: # e.g., CC BY 2.0, CC BY-SA 3.0, Public Domain
  author: # Photographer/artist name
---

Write a brief biography here. Include sections like:

## Early Life and Education

Background and formative experiences.

## Key Contributions

Major works and achievements.

## Impact

Lasting influence on the field.
`;

writeFileSync(filePath, template);
console.log(`Created ${filePath}`);
console.log(`\nNext steps:`);
console.log(`  1. Fill in required fields: era, domains (at least one)`);
console.log(`  2. Add edges to connect to other nodes`);
console.log(`  3. Add an image to src/assets/images/entities/${slug}.jpg`);
console.log(`  4. Write the biography content`);
console.log(`  5. Run 'pnpm validate' to check for errors`);
