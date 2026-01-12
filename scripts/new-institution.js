#!/usr/bin/env node

/**
 * Create a new institution entry
 * Usage: pnpm new:institution <slug>
 * Example: pnpm new:institution bell-labs
 */

import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const CONTENT_DIR = 'src/content/institutions';

const slug = process.argv[2];

if (!slug) {
  console.error('Usage: pnpm new:institution <slug>');
  console.error('Example: pnpm new:institution bell-labs');
  process.exit(1);
}

// Validate slug format
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error('Error: Slug must be lowercase with hyphens (e.g., bell-labs)');
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
type: institution
name: ${name}
kind: company # Options: university, lab, company, org, foundation
location: # e.g., "Mountain View, California, USA"
era: # e.g., "1925-present" (REQUIRED)
domains:
  - # e.g., Research, Operating Systems (at least one REQUIRED)
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
  author: # Photographer name
---

Brief description of the institution.

## History

When founded and key milestones.

## Notable People

Key figures associated with this institution.

## Impact

Contributions to technology and computing.
`;

writeFileSync(filePath, template);
console.log(`Created ${filePath}`);
console.log(`\nNext steps:`);
console.log(`  1. Fill in required fields: era, domains, kind`);
console.log(`  2. Add an image to src/assets/images/entities/${slug}.jpg (optional)`);
console.log(`  3. Write the description content`);
console.log(`  4. Add affiliation edges from people who worked here`);
console.log(`  5. Run 'pnpm validate' to check for errors`);
