#!/usr/bin/env node
/**
 * Optimize entity images to web-friendly size
 * Usage: pnpm optimize:images
 *
 * Resizes all images in src/assets/images/entities/ to 440px width
 * with 85% JPEG quality to match consistent format.
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const IMAGES_DIR = './src/assets/images/entities';
const TARGET_WIDTH = 440;
const JPEG_QUALITY = 85;
const SIZE_THRESHOLD = 100000; // 100KB - skip if already under this

async function optimizeImages() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.log(`Directory ${IMAGES_DIR} does not exist`);
    return;
  }

  const files = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));

  if (files.length === 0) {
    console.log('No images found to optimize');
    return;
  }

  console.log(`Optimizing images in ${IMAGES_DIR} to ${TARGET_WIDTH}px width...\n`);

  let optimized = 0;
  let skipped = 0;

  for (const file of files) {
    const filepath = path.join(IMAGES_DIR, file);
    const stats = fs.statSync(filepath);

    // Skip if already small
    if (stats.size < SIZE_THRESHOLD) {
      console.log(`✓ ${file}: already optimized (${Math.round(stats.size / 1024)}KB)`);
      skipped++;
      continue;
    }

    try {
      const metadata = await sharp(filepath).metadata();
      const sizeBefore = Math.round(stats.size / 1024);

      console.log(`→ ${file}: ${metadata.width}x${metadata.height} (${sizeBefore}KB)`);

      // Determine output format
      const outputPath = filepath.replace(/\.(png|jpeg)$/i, '.jpg');

      await sharp(filepath)
        .resize(TARGET_WIDTH)
        .jpeg({ quality: JPEG_QUALITY })
        .toFile(filepath + '.tmp');

      // Replace original
      fs.unlinkSync(filepath);
      fs.renameSync(filepath + '.tmp', outputPath);

      const newStats = fs.statSync(outputPath);
      const sizeAfter = Math.round(newStats.size / 1024);
      console.log(`  ✓ Optimized: ${sizeAfter}KB (saved ${sizeBefore - sizeAfter}KB)`);
      optimized++;
    } catch (err) {
      console.error(`  ✗ Error processing ${file}:`, err.message);
    }
  }

  console.log(`\nDone: ${optimized} optimized, ${skipped} already optimal`);
}

optimizeImages().catch(console.error);
