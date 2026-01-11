/**
 * Generate OG images for Packs
 * Creates 1200x630 PNG images with collectible card styling for each pack
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packsDir = join(__dirname, '..', 'src', 'content', 'packs');
const outputDir = join(__dirname, '..', 'public', 'og');

// OG image dimensions (standard)
const width = 1200;
const height = 630;

// Difficulty colors
const difficultyColors = {
  beginner: '#27ae60',
  intermediate: '#f39c12',
  advanced: '#e74c3c',
};

// Helper to escape XML special characters
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Simple YAML frontmatter parser
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const data = {};
  const lines = match[1].split('\n');
  let currentKey = null;
  let currentArray = null;

  for (const line of lines) {
    // Check if this is an array item (starts with "  - ")
    if (line.match(/^\s+-\s+/)) {
      if (currentArray !== null && currentKey) {
        const value = line.replace(/^\s+-\s+/, '').trim();
        currentArray.push(value);
      }
      continue;
    }

    // Check if this is a key: value pair
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0 && !line.startsWith(' ')) {
      // Save previous array if exists
      if (currentKey && currentArray !== null) {
        data[currentKey] = currentArray;
      }

      currentKey = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Remove quotes
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      // Check if this starts an array (empty value followed by array items)
      if (value === '') {
        currentArray = [];
      } else {
        currentArray = null;
        data[currentKey] = value;
      }
    }
  }

  // Save last array if exists
  if (currentKey && currentArray !== null) {
    data[currentKey] = currentArray;
  }

  return data;
}

// Generate SVG for a pack
function generatePackSvg(pack) {
  const {
    name = 'Pack',
    description = '',
    icon = '📦',
    difficulty = 'beginner',
    cards = [],
  } = pack;

  const cardCount = Array.isArray(cards) ? cards.length : 0;
  const difficultyColor = difficultyColors[difficulty] || difficultyColors.beginner;
  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  const escapedName = escapeXml(name);
  const escapedDescription = escapeXml(
    description.length > 80 ? description.slice(0, 77) + '...' : description
  );

  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff"/>
      <stop offset="100%" style="stop-color:#f8f9fa"/>
    </linearGradient>
    <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff"/>
      <stop offset="100%" style="stop-color:#f1f5f9"/>
    </linearGradient>
    <linearGradient id="rainbowBar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3498db"/>
      <stop offset="33%" style="stop-color:#9b59b6"/>
      <stop offset="66%" style="stop-color:#e74c3c"/>
      <stop offset="100%" style="stop-color:#f39c12"/>
    </linearGradient>
    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3498db"/>
      <stop offset="100%" style="stop-color:#2980b9"/>
    </linearGradient>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bgGradient)"/>

  <!-- Decorative elements -->
  <circle cx="1100" cy="100" r="80" fill="#3498db" opacity="0.06"/>
  <circle cx="1050" cy="180" r="50" fill="#9b59b6" opacity="0.05"/>
  <circle cx="100" cy="550" r="60" fill="#27ae60" opacity="0.05"/>
  <circle cx="180" cy="500" r="40" fill="#f39c12" opacity="0.04"/>

  <!-- Main Card Container -->
  <g filter="url(#cardShadow)">
    <rect x="80" y="80" width="700" height="470" rx="24" fill="url(#cardGradient)" stroke="#e0e0e0" stroke-width="2"/>

    <!-- Rainbow bar at top of card -->
    <rect x="80" y="80" width="700" height="6" rx="3" fill="url(#rainbowBar)"/>

    <!-- Pack Icon -->
    <text x="120" y="180" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif" font-size="64">${icon}</text>

    <!-- Difficulty Badge -->
    <rect x="620" y="110" width="120" height="32" rx="16" fill="${difficultyColor}"/>
    <text x="680" y="133" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="white" text-anchor="middle">${difficultyLabel.toUpperCase()}</text>

    <!-- Pack Name -->
    <text x="120" y="260" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="700" fill="#1a1a1a">${escapedName}</text>

    <!-- Description -->
    <text x="120" y="310" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="#666666">${escapedDescription}</text>

    <!-- Divider -->
    <rect x="120" y="360" width="620" height="1" fill="#e0e0e0"/>

    <!-- Stats Section -->
    <text x="120" y="410" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#666666" font-weight="600">LEARNING PATH</text>

    <!-- Card Count Badge -->
    <rect x="590" y="380" width="130" height="60" rx="12" fill="url(#blueGradient)"/>
    <text x="655" y="418" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700" fill="white" text-anchor="middle">${cardCount}</text>
    <text x="655" y="435" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="white" text-anchor="middle" opacity="0.9">CARDS</text>

    <!-- Card indicators -->
    ${Array.from(
      { length: Math.min(cardCount, 8) },
      (_, i) =>
        `<rect x="${120 + i * 50}" y="440" width="40" height="50" rx="6" fill="#f1f5f9" stroke="#e0e0e0" stroke-width="1"/>
       <text x="${140 + i * 50}" y="472" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#666666" text-anchor="middle">${i + 1}</text>`
    ).join('')}
    ${cardCount > 8 ? `<text x="${120 + 8 * 50 + 15}" y="472" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#666666">+${cardCount - 8}</text>` : ''}
  </g>

  <!-- TechShoulders Branding -->
  <text x="850" y="300" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="700" fill="#1a1a1a">TechShoulders</text>
  <text x="850" y="330" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#666666">Learning Packs</text>
  <rect x="850" y="350" width="60" height="3" rx="1" fill="#3498db"/>

  <!-- Collect badge -->
  <text x="850" y="420" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#27ae60" font-weight="600">COLLECT</text>
  <text x="850" y="445" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#27ae60" font-weight="600">LEARN</text>
  <text x="850" y="470" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#27ae60" font-weight="600">EXPLORE</text>
</svg>
`;
}

async function generatePackOgImages() {
  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  // Read all pack files
  const files = await readdir(packsDir);
  const mdxFiles = files.filter((f) => f.endsWith('.mdx'));

  console.log(`Found ${mdxFiles.length} pack(s) to generate OG images for...\n`);

  for (const file of mdxFiles) {
    const filePath = join(packsDir, file);
    const content = await readFile(filePath, 'utf-8');
    const frontmatter = parseFrontmatter(content);

    if (!frontmatter || !frontmatter.id) {
      console.log(`  Skipping ${file}: No valid frontmatter`);
      continue;
    }

    const packId = frontmatter.id;
    const outputPath = join(outputDir, `pack-${packId}.png`);

    try {
      const svg = generatePackSvg(frontmatter);
      await sharp(Buffer.from(svg)).png().toFile(outputPath);

      console.log(`  ✓ Generated: og/pack-${packId}.png`);
    } catch (error) {
      console.error(`  ✗ Failed to generate ${packId}:`, error.message);
    }
  }

  console.log('\nDone!');
}

generatePackOgImages();
