/**
 * Generate default OG image for TechShoulders
 * Creates a 1200x630 PNG image with site branding
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, '..', 'public', 'og-default.png');

// OG image dimensions (standard)
const width = 1200;
const height = 630;

// Colors matching the site's design
const primaryColor = '#0066cc';
const textColor = '#1a1a1a';
const mutedColor = '#666666';

// Create SVG content for the OG image
const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc"/>
      <stop offset="100%" style="stop-color:#e2e8f0"/>
    </linearGradient>
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#0066cc"/>
      <stop offset="100%" style="stop-color:#0052a3"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bgGradient)"/>

  <!-- Accent bar at top -->
  <rect x="0" y="0" width="100%" height="6" fill="url(#accentGradient)"/>

  <!-- Decorative circles (representing knowledge nodes) -->
  <circle cx="1050" cy="120" r="60" fill="#0066cc" opacity="0.08"/>
  <circle cx="1120" cy="200" r="40" fill="#0066cc" opacity="0.06"/>
  <circle cx="980" cy="180" r="30" fill="#0066cc" opacity="0.05"/>

  <circle cx="150" cy="520" r="50" fill="#0066cc" opacity="0.06"/>
  <circle cx="80" cy="460" r="35" fill="#0066cc" opacity="0.05"/>
  <circle cx="220" cy="560" r="25" fill="#0066cc" opacity="0.04"/>

  <!-- Connection lines (representing the graph) -->
  <line x1="1050" y1="120" x2="1120" y2="200" stroke="#0066cc" stroke-width="2" opacity="0.1"/>
  <line x1="1050" y1="120" x2="980" y2="180" stroke="#0066cc" stroke-width="2" opacity="0.1"/>
  <line x1="150" y1="520" x2="80" y2="460" stroke="#0066cc" stroke-width="2" opacity="0.1"/>
  <line x1="150" y1="520" x2="220" y2="560" stroke="#0066cc" stroke-width="2" opacity="0.1"/>

  <!-- Main content area -->
  <text x="80" y="260" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="72" font-weight="700" fill="${textColor}">TechShoulders</text>

  <text x="80" y="340" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" fill="${mutedColor}">Standing on the shoulders of tech giants</text>

  <!-- Tagline / description -->
  <text x="80" y="420" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" fill="${mutedColor}">Explore the people, works, and institutions</text>
  <text x="80" y="455" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" fill="${mutedColor}">that shaped computing history</text>

  <!-- Bottom accent -->
  <rect x="80" y="500" width="120" height="4" fill="${primaryColor}" rx="2"/>
</svg>
`;

async function generateOgImage() {
  try {
    await sharp(Buffer.from(svg)).png().toFile(outputPath);

    console.log(`✓ Generated OG image: ${outputPath}`);
  } catch (error) {
    console.error('Failed to generate OG image:', error);
    process.exit(1);
  }
}

generateOgImage();
