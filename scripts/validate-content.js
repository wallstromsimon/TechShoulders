#!/usr/bin/env node

/**
 * Content Validation Script for TechShoulders
 *
 * Validates:
 * 1. Schema compliance for all content types
 * 2. Edge endpoints exist (source and target)
 * 3. Image attribution completeness
 * 4. ID matches filename
 * 5. signatureWorks references exist
 * 6. Pack cards references exist
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { z } from 'zod';

const CONTENT_DIR = 'src/content';

// Schema definitions (matching src/content/config.ts)
const imageSchema = z.object({
  file: z.string(),   // Local path to image in src/assets/
  source: z.string(), // Wikimedia Commons page URL for attribution
  license: z.string(),
  author: z.string(),
});

const linksSchema = z.array(z.object({
  label: z.string(),
  url: z.string(),
}));

const personSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string().optional(),
  era: z.string(),
  domains: z.array(z.string()).optional(),
  signatureWorks: z.array(z.string()).optional(),
  whyYouCare: z.array(z.string()).optional(),
  links: linksSchema.optional(),
  image: imageSchema.optional(),
});

const workSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.string(),
  year: z.number(),
  domains: z.array(z.string()).optional(),
  links: linksSchema.optional(),
  image: imageSchema.optional(),
});

const institutionSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.string(),
  location: z.string().optional(),
  links: linksSchema.optional(),
  image: imageSchema.optional(),
});

const packSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  cards: z.array(z.string()),
  image: imageSchema.optional(),
});

const edgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  kind: z.enum(['influence', 'affiliation']),
  label: z.string().optional(),
});

const edgesArraySchema = z.array(edgeSchema);

// Helper to parse YAML frontmatter from MDX
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yamlContent = match[1];
  const data = {};
  let currentKey = null;
  let currentArray = null;
  let inArray = false;
  let arrayIndent = 0;

  const lines = yamlContent.split('\n');

  for (const line of lines) {
    // Skip empty lines
    if (line.trim() === '') continue;

    // Check for array item
    const arrayMatch = line.match(/^(\s*)- (.*)$/);
    if (arrayMatch && inArray) {
      const indent = arrayMatch[1].length;
      const value = arrayMatch[2].trim();

      if (indent >= arrayIndent) {
        // Handle object in array
        if (value.includes(':')) {
          const [k, v] = value.split(':').map(s => s.trim());
          if (currentArray.length === 0 || typeof currentArray[currentArray.length - 1] !== 'object') {
            currentArray.push({});
          }
          const lastObj = currentArray[currentArray.length - 1];
          if (typeof lastObj === 'object' && !Array.isArray(lastObj)) {
            lastObj[k] = v;
          }
        } else {
          currentArray.push(value);
        }
        continue;
      }
    }

    // Check for new array start
    const newArrayMatch = line.match(/^(\s*)- (.*)$/);
    if (newArrayMatch && !inArray) {
      const value = newArrayMatch[2].trim();
      if (value.includes(':')) {
        const [k, v] = value.split(':').map(s => s.trim());
        currentArray.push({ [k]: v });
      } else {
        currentArray.push(value);
      }
      continue;
    }

    // Check for key-value pair
    const kvMatch = line.match(/^(\s*)([^:]+):\s*(.*)$/);
    if (kvMatch) {
      const indent = kvMatch[1].length;
      const key = kvMatch[2].trim();
      const value = kvMatch[3].trim();

      if (indent === 0) {
        // Top-level key
        if (value === '' || value === '|' || value === '>') {
          // Start of array or nested object
          data[key] = [];
          currentKey = key;
          currentArray = data[key];
          inArray = true;
          arrayIndent = 2;
        } else {
          data[key] = parseValue(value);
          inArray = false;
        }
      } else if (indent === 2 && currentKey && typeof data[currentKey] === 'object' && !Array.isArray(data[currentKey])) {
        // Nested object property
        data[currentKey][key] = parseValue(value);
      } else if (inArray && indent === 4) {
        // Object property inside array
        if (currentArray.length === 0 || typeof currentArray[currentArray.length - 1] !== 'object') {
          currentArray.push({});
        }
        currentArray[currentArray.length - 1][key] = parseValue(value);
      }
    }
  }

  return data;
}

function parseValue(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
  return value;
}

// Better YAML parser for our specific format
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

      if (value === '') {
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
                  // Object in array (like links)
                  const obj = {};
                  const [k, v] = itemValue.split(':').map(s => s.trim());
                  obj[k] = v;
                  i++;
                  // Check for more properties in this object
                  while (i < lines.length && lines[i].match(/^\s{4}[a-zA-Z]/)) {
                    const propMatch = lines[i].match(/^\s+([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
                    if (propMatch) {
                      obj[propMatch[1]] = propMatch[2].trim();
                    }
                    i++;
                  }
                  result[key].push(obj);
                } else {
                  result[key].push(itemValue);
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

// Collect all node IDs
function collectNodeIds() {
  const nodeIds = new Set();

  const collections = ['people', 'works', 'institutions'];

  for (const collection of collections) {
    const dir = join(CONTENT_DIR, collection);
    if (!existsSync(dir)) continue;

    const files = readdirSync(dir).filter(f => f.endsWith('.mdx'));
    for (const file of files) {
      const content = readFileSync(join(dir, file), 'utf-8');
      const data = parseYamlFrontmatter(content);
      if (data?.id) {
        nodeIds.add(data.id);
      }
    }
  }

  return nodeIds;
}

// Validate a single MDX file
function validateMdxFile(filePath, schema, collection) {
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

// Validate edges file
function validateEdgesFile(filePath, nodeIds) {
  const content = readFileSync(filePath, 'utf-8');
  let data;

  try {
    data = JSON.parse(content);
  } catch (e) {
    error(filePath, `Invalid JSON: ${e.message}`);
    return;
  }

  const result = edgesArraySchema.safeParse(data);
  if (!result.success) {
    for (const issue of result.error.issues) {
      error(filePath, `Schema validation failed at index ${issue.path[0]}: ${issue.message}`);
    }
    return;
  }

  // Validate edge endpoints exist
  for (let i = 0; i < data.length; i++) {
    const edge = data[i];

    if (!nodeIds.has(edge.source)) {
      error(filePath, `Edge ${i}: source "${edge.source}" does not exist`);
    }

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

  // First pass: collect all node IDs
  const nodeIds = collectNodeIds();
  console.log(`Found ${nodeIds.size} nodes\n`);

  // Validate people
  const peopleDir = join(CONTENT_DIR, 'people');
  if (existsSync(peopleDir)) {
    console.log('Validating people...');
    const files = readdirSync(peopleDir).filter(f => f.endsWith('.mdx'));
    for (const file of files) {
      const filePath = join(peopleDir, file);
      const data = validateMdxFile(filePath, personSchema, 'people');
      if (data) {
        validateSignatureWorks(data, nodeIds, filePath);
      }
    }
    console.log(`  Checked ${files.length} files`);
  }

  // Validate works
  const worksDir = join(CONTENT_DIR, 'works');
  if (existsSync(worksDir)) {
    console.log('Validating works...');
    const files = readdirSync(worksDir).filter(f => f.endsWith('.mdx'));
    for (const file of files) {
      validateMdxFile(join(worksDir, file), workSchema, 'works');
    }
    console.log(`  Checked ${files.length} files`);
  }

  // Validate institutions
  const institutionsDir = join(CONTENT_DIR, 'institutions');
  if (existsSync(institutionsDir)) {
    console.log('Validating institutions...');
    const files = readdirSync(institutionsDir).filter(f => f.endsWith('.mdx'));
    for (const file of files) {
      validateMdxFile(join(institutionsDir, file), institutionSchema, 'institutions');
    }
    console.log(`  Checked ${files.length} files`);
  }

  // Validate packs
  const packsDir = join(CONTENT_DIR, 'packs');
  if (existsSync(packsDir)) {
    console.log('Validating packs...');
    const files = readdirSync(packsDir).filter(f => f.endsWith('.mdx'));
    for (const file of files) {
      const filePath = join(packsDir, file);
      const data = validateMdxFile(filePath, packSchema, 'packs');
      if (data) {
        validatePackCards(data, nodeIds, filePath);
      }
    }
    console.log(`  Checked ${files.length} files`);
  }

  // Validate edges
  const edgesDir = join(CONTENT_DIR, 'edges');
  if (existsSync(edgesDir)) {
    console.log('Validating edges...');
    const files = readdirSync(edgesDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      validateEdgesFile(join(edgesDir, file), nodeIds);
    }
    console.log(`  Checked ${files.length} files`);
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
    console.log(`\nValidation FAILED with ${errors.length} error(s)`);
    process.exit(1);
  }

  console.log('\nValidation PASSED');
  process.exit(0);
}

validate();
