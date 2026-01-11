#!/usr/bin/env node

/**
 * Generate precomputed graph data for TechShoulders
 * Outputs:
 *   - public/graph.json (nodes and edges for visualization)
 *   - public/search-index.json (searchable node data)
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = join(__dirname, '..', 'src', 'content');
const OUTPUT_DIR = join(__dirname, '..', 'public');

/**
 * Parse YAML frontmatter from MDX content
 */
function parseYamlFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yaml = match[1];
  const result = {};
  const lines = yaml.split('\n');

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    const topMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
    if (topMatch) {
      const key = topMatch[1];
      const value = topMatch[2].trim();

      if (value === '') {
        i++;
        if (i < lines.length) {
          const nextLine = lines[i];
          if (nextLine.match(/^\s+-/)) {
            result[key] = [];
            while (i < lines.length && lines[i].match(/^\s+-/)) {
              const itemMatch = lines[i].match(/^\s+-\s*(.*)$/);
              if (itemMatch) {
                const itemValue = itemMatch[1].trim();
                if (itemValue.includes(':')) {
                  const obj = {};
                  const colonIdx = itemValue.indexOf(':');
                  const k = itemValue.slice(0, colonIdx).trim();
                  const v = itemValue.slice(colonIdx + 1).trim();
                  obj[k] = v;
                  i++;
                  while (i < lines.length && lines[i].match(/^\s{4}[a-zA-Z]/)) {
                    const propMatch = lines[i].match(/^\s+([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
                    if (propMatch) {
                      obj[propMatch[1]] = parseValue(propMatch[2].trim());
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

function parseValue(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
  return value;
}

/**
 * Load all nodes from content collections
 */
function loadNodes() {
  const nodes = [];

  // Load people
  const peopleDir = join(CONTENT_DIR, 'people');
  if (existsSync(peopleDir)) {
    const files = readdirSync(peopleDir).filter(f => f.endsWith('.mdx'));
    for (const file of files) {
      const content = readFileSync(join(peopleDir, file), 'utf-8');
      const data = parseYamlFrontmatter(content);
      if (data) {
        nodes.push({
          id: data.id,
          name: data.name,
          kind: 'people',
          subtitle: data.title,
          domains: data.domains || [],
          era: data.era,
        });
      }
    }
  }

  // Load works
  const worksDir = join(CONTENT_DIR, 'works');
  if (existsSync(worksDir)) {
    const files = readdirSync(worksDir).filter(f => f.endsWith('.mdx'));
    for (const file of files) {
      const content = readFileSync(join(worksDir, file), 'utf-8');
      const data = parseYamlFrontmatter(content);
      if (data) {
        nodes.push({
          id: data.id,
          name: data.name,
          kind: 'works',
          subtitle: data.kind,
          domains: data.domains || [],
          year: data.year,
        });
      }
    }
  }

  // Load institutions
  const institutionsDir = join(CONTENT_DIR, 'institutions');
  if (existsSync(institutionsDir)) {
    const files = readdirSync(institutionsDir).filter(f => f.endsWith('.mdx'));
    for (const file of files) {
      const content = readFileSync(join(institutionsDir, file), 'utf-8');
      const data = parseYamlFrontmatter(content);
      if (data) {
        nodes.push({
          id: data.id,
          name: data.name,
          kind: 'institutions',
          subtitle: data.kind,
          domains: [],
          location: data.location,
        });
      }
    }
  }

  return nodes;
}

/**
 * Load all edges from JSON files
 */
function loadEdges() {
  const edges = [];
  const edgesDir = join(CONTENT_DIR, 'edges');

  if (existsSync(edgesDir)) {
    const files = readdirSync(edgesDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const content = readFileSync(join(edgesDir, file), 'utf-8');
      try {
        const data = JSON.parse(content);
        edges.push(...data);
      } catch (e) {
        console.error(`Failed to parse ${file}:`, e.message);
      }
    }
  }

  return edges;
}

/**
 * Main generation function
 */
function generate() {
  console.log('Generating graph data...\n');

  const nodes = loadNodes();
  const edges = loadEdges();

  console.log(`  Loaded ${nodes.length} nodes`);
  console.log(`  Loaded ${edges.length} edges`);

  // Build graph.json (minimal data for visualization)
  const graphData = {
    nodes: nodes.map(n => ({
      id: n.id,
      name: n.name,
      kind: n.kind,
      domains: n.domains || [],
    })),
    edges: edges.map(e => ({
      source: e.source,
      target: e.target,
      kind: e.kind,
      label: e.label,
      year: e.year,
    })),
  };

  // Build search-index.json (full searchable data)
  const searchIndex = nodes;

  // Write outputs
  const graphPath = join(OUTPUT_DIR, 'graph.json');
  const searchPath = join(OUTPUT_DIR, 'search-index.json');

  writeFileSync(graphPath, JSON.stringify(graphData, null, 2));
  writeFileSync(searchPath, JSON.stringify(searchIndex, null, 2));

  console.log(`\n✓ Generated ${graphPath}`);
  console.log(`✓ Generated ${searchPath}`);
}

generate();
