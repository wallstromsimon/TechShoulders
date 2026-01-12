#!/usr/bin/env node

/**
 * Create a new work entry
 * Usage: pnpm new:work <slug>
 * Example: pnpm new:work git
 */

import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const CONTENT_DIR = 'src/content/works';

const slug = process.argv[2];

if (!slug) {
  console.error('Usage: pnpm new:work <slug>');
  console.error('Example: pnpm new:work git');
  process.exit(1);
}

// Validate slug format
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error('Error: Slug must be lowercase with hyphens (e.g., linux-kernel)');
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

const currentYear = new Date().getFullYear();

const template = `---
id: ${slug}
type: work
name: ${name}
kind: project # Options: project, paper, tool, standard, language, library, book
year: ${currentYear} # Year created/published
era: # e.g., "1990s-present" (REQUIRED)
domains:
  - # e.g., Operating Systems, Version Control (at least one REQUIRED)
edges: []
links:
  - label: Wikipedia
    url: https://en.wikipedia.org/wiki/
  - label: Official Website
    url: #
image:
  file: ../../assets/images/entities/${slug}.jpg
  source: # Wikimedia Commons URL
  license: # e.g., CC BY 2.0, CC BY-SA 3.0, Public Domain
  author: # Creator/photographer name
---

Brief description of the work.

## Origins

How and why it was created.

## Key Innovations

What made it significant or different.

## Impact

How it changed the field or industry.
`;

writeFileSync(filePath, template);
console.log(`Created ${filePath}`);
console.log(`\nNext steps:`);
console.log(`  1. Fill in required fields: era, domains, kind, year`);
console.log(`  2. Add an image to src/assets/images/entities/${slug}.jpg (optional)`);
console.log(`  3. Write the description content`);
console.log(`  4. Add edges from the creator's person file pointing to this work`);
console.log(`  5. Run 'pnpm validate' to check for errors`);
