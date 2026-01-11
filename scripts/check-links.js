#!/usr/bin/env node

/**
 * Link Checker for TechShoulders
 *
 * Validates:
 * 1. Internal links to nodes (/node/*, /people/*, /works/*, etc.) reference existing content
 * 2. Source anchor references (#source-N) have matching anchor definitions (id="source-N")
 * 3. Frontmatter link URLs are well-formed
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';

const CONTENT_DIR = 'src/content';

const errors = [];
const warnings = [];

function error(file, message) {
  errors.push(`ERROR [${file}]: ${message}`);
}

function warn(file, message) {
  warnings.push(`WARNING [${file}]: ${message}`);
}

// Collect all node IDs from content
function collectNodeIds() {
  const nodeIds = new Set();
  const collections = ['people', 'works', 'institutions', 'packs'];

  for (const collection of collections) {
    const dir = join(CONTENT_DIR, collection);
    if (!existsSync(dir)) continue;

    const files = readdirSync(dir).filter((f) => f.endsWith('.mdx'));
    for (const file of files) {
      // ID is the filename without extension
      const id = basename(file, '.mdx');
      nodeIds.add(id);
    }
  }

  return nodeIds;
}

// Parse YAML frontmatter to extract links
function parseFrontmatterLinks(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return [];

  const yaml = match[1];
  const links = [];

  // Simple regex to find URLs in links section
  const urlMatches = yaml.matchAll(/url:\s*(.+)$/gm);
  for (const m of urlMatches) {
    links.push(m[1].trim());
  }

  return links;
}

// Extract internal link references from MDX body
function extractInternalLinks(content) {
  const links = [];

  // Match markdown links like [text](/node/linus-torvalds) or [text](/people/linus-torvalds)
  const linkRegex = /\[([^\]]*)\]\(\/(?:node|people|works|institutions|packs)\/([^)#]+)/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    links.push({
      type: 'internal',
      id: match[2],
      fullMatch: match[0],
    });
  }

  return links;
}

// Extract source anchor references and definitions from MDX
function extractSourceAnchors(content) {
  const references = [];
  const definitions = [];

  // Match anchor references like (#source-1) or (#source-N)
  const refRegex = /\(#(source-\d+)\)/g;
  let match;
  while ((match = refRegex.exec(content)) !== null) {
    references.push(match[1]);
  }

  // Match anchor definitions like id="source-1"
  const defRegex = /id="(source-\d+)"/g;
  while ((match = defRegex.exec(content)) !== null) {
    definitions.push(match[1]);
  }

  return { references, definitions };
}

// Validate URL format
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Check links in a single MDX file
function checkMdxFile(filePath, nodeIds) {
  const content = readFileSync(filePath, 'utf-8');

  // 1. Check frontmatter links are valid URLs
  const frontmatterLinks = parseFrontmatterLinks(content);
  for (const url of frontmatterLinks) {
    if (!isValidUrl(url)) {
      error(filePath, `Invalid URL in frontmatter: ${url}`);
    }
  }

  // 2. Check internal links reference existing nodes
  const internalLinks = extractInternalLinks(content);
  for (const link of internalLinks) {
    if (!nodeIds.has(link.id)) {
      error(filePath, `Internal link references non-existent node: ${link.id}`);
    }
  }

  // 3. Check source anchor references have matching definitions
  const { references, definitions } = extractSourceAnchors(content);
  const defSet = new Set(definitions);

  for (const ref of references) {
    if (!defSet.has(ref)) {
      error(filePath, `Source anchor reference "#${ref}" has no matching definition (id="${ref}")`);
    }
  }

  // Also warn about unused definitions (definitions with no references)
  const refSet = new Set(references);
  for (const def of definitions) {
    if (!refSet.has(def)) {
      warn(filePath, `Source anchor definition "${def}" is never referenced`);
    }
  }
}

// Main function
function checkLinks() {
  console.log('Checking links in TechShoulders content...\n');

  // Collect all node IDs
  const nodeIds = collectNodeIds();
  console.log(`Found ${nodeIds.size} nodes\n`);

  // Check all MDX files
  const collections = ['people', 'works', 'institutions', 'packs'];
  let totalFiles = 0;

  for (const collection of collections) {
    const dir = join(CONTENT_DIR, collection);
    if (!existsSync(dir)) continue;

    console.log(`Checking ${collection}...`);
    const files = readdirSync(dir).filter((f) => f.endsWith('.mdx'));

    for (const file of files) {
      checkMdxFile(join(dir, file), nodeIds);
    }

    console.log(`  Checked ${files.length} files`);
    totalFiles += files.length;
  }

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
    console.log(`\nLink check FAILED with ${errors.length} error(s)`);
    process.exit(1);
  }

  console.log(`\nLink check PASSED (${totalFiles} files checked)`);
  process.exit(0);
}

checkLinks();
