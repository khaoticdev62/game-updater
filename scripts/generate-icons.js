#!/usr/bin/env node

/**
 * Icon Generation Script
 * Converts SVG source to PNG exports at multiple sizes
 *
 * Usage: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const SIZES = [16, 32, 48, 64, 128, 256, 512, 1024];
const SOURCE_SVG = path.join(__dirname, '../assets/branding/logo/source/icon.svg');
const OUTPUT_DIR = path.join(__dirname, '../assets/branding/logo/exports');

/**
 * Generate icons at all specified sizes
 */
async function generateIcons() {
  try {
    // Verify source file exists
    if (!fs.existsSync(SOURCE_SVG)) {
      console.error(`❌ Source SVG not found: ${SOURCE_SVG}`);
      process.exit(1);
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      console.log(`📁 Created output directory: ${OUTPUT_DIR}`);
    }

    console.log(`\n🎨 Generating PNG icons from SVG source...\n`);
    console.log(`📄 Source: ${SOURCE_SVG}`);
    console.log(`📁 Output: ${OUTPUT_DIR}\n`);

    // Generate each size
    let successCount = 0;
    for (const size of SIZES) {
      try {
        const outputPath = path.join(OUTPUT_DIR, `icon-${size}.png`);

        await sharp(SOURCE_SVG, { density: 300 })
          .resize(size, size, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
          })
          .png({
            quality: 100,
            compressionLevel: 9,
          })
          .toFile(outputPath);

        console.log(`✅ icon-${size}.png (${size}x${size})`);
        successCount++;

      } catch (err) {
        console.error(`❌ Failed to generate icon-${size}.png: ${err.message}`);
      }
    }

    console.log(`\n✨ Icon generation complete!`);
    console.log(`📊 Generated ${successCount}/${SIZES.length} sizes successfully\n`);

    if (successCount === SIZES.length) {
      console.log(`🎉 All icons generated successfully!`);
      process.exit(0);
    } else {
      console.warn(`⚠️  Some sizes failed to generate. Check errors above.`);
      process.exit(1);
    }

  } catch (error) {
    console.error(`\n❌ Icon generation failed:`, error.message);
    process.exit(1);
  }
}

// Run the generator
generateIcons();
