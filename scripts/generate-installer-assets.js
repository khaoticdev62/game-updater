#!/usr/bin/env node

/**
 * Installer Graphics Generation Script
 * Creates BMP files for NSIS installer (header and sidebar)
 *
 * Usage: node scripts/generate-installer-assets.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const EXPORT_DIR = path.join(__dirname, '../assets/branding/logo/exports');
const INSTALLER_DIR = path.join(__dirname, '../assets/branding/installer');
const ICON_512 = path.join(EXPORT_DIR, 'icon-512.png');
const ICON_256 = path.join(EXPORT_DIR, 'icon-256.png');
const ICON_128 = path.join(EXPORT_DIR, 'icon-128.png');
const ICON_64 = path.join(EXPORT_DIR, 'icon-64.png');
const ICON_48 = path.join(EXPORT_DIR, 'icon-48.png');

// Note: NSIS supports PNG and it's more reliable than BMP
// We'll generate PNG files that NSIS will use directly
const HEADER_FORMAT = 'png';  // NSIS also accepts PNG for header/sidebar
const SIDEBAR_FORMAT = 'png';

// Colors from tailwind theme
const COLORS = {
  slate950: { r: 15, g: 15, b: 15 },
  cyan400: { r: 14, g: 165, b: 233 },
  cyan500: { r: 6, g: 182, b: 212 },
  blue500: { r: 59, g: 130, b: 246 },
  blue700: { r: 29, g: 78, b: 216 },
};

/**
 * Create header banner (150x57) for NSIS installer
 */
async function createHeaderBmp() {
  try {
    console.log(`📝 Creating header banner (150x57)...`);

    const headerPath = path.join(INSTALLER_DIR, `header.${HEADER_FORMAT}`);

    // Use 48px icon for header (48 + 4px padding = 52px fits in 57px)
    const resizedIcon = await sharp(ICON_48)
      .resize(48, 48)
      .toBuffer();

    await sharp({
      create: {
        width: 150,
        height: 57,
        channels: 3,
        background: COLORS.slate950,
      }
    })
    .composite([
      {
        input: resizedIcon,
        top: 4,      // Top padding
        left: 8,     // Left padding
      }
    ])
    .toFormat(HEADER_FORMAT)
    .toFile(headerPath);

    const stats = fs.statSync(headerPath);
    console.log(`✅ header.${HEADER_FORMAT} created (${stats.size} bytes)`);
    return true;

  } catch (error) {
    console.error(`❌ Header creation failed: ${error.message}`);
    return false;
  }
}

/**
 * Create sidebar banner (164x314) for NSIS installer
 */
async function createSidebarBmp() {
  try {
    console.log(`📝 Creating sidebar banner (164x314)...`);

    const sidebarPath = path.join(INSTALLER_DIR, `sidebar.${SIDEBAR_FORMAT}`);

    // Create the sidebar with gradient background
    const svgGradient = `
      <svg width="164" height="314" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0f0f0f;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#06b6d4;stop-opacity:0.1" />
            <stop offset="100%" style="stop-color:#0f0f0f;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="164" height="314" fill="url(#grad)" />
      </svg>
    `;

    // Create base with gradient
    const sidebar = await sharp(Buffer.from(svgGradient))
      .resize(164, 314)
      .toBuffer();

    // Composite icon centered at top
    await sharp(sidebar)
      .composite([
        {
          input: ICON_128,
          top: 30,   // Top padding
          left: 18,  // Center horizontally
        }
      ])
      .toFormat(SIDEBAR_FORMAT)
      .toFile(sidebarPath);

    const stats = fs.statSync(sidebarPath);
    console.log(`✅ sidebar.${SIDEBAR_FORMAT} created (${stats.size} bytes)`);
    return true;

  } catch (error) {
    console.error(`❌ Sidebar creation failed: ${error.message}`);
    return false;
  }
}

/**
 * Main function
 */
async function generateInstallerAssets() {
  try {
    // Verify prerequisites
    if (!fs.existsSync(ICON_128)) {
      console.error(`❌ Required file not found: icon-128.png`);
      console.error(`   Run 'npm run generate-icons' first`);
      process.exit(1);
    }

    // Create installer directory
    if (!fs.existsSync(INSTALLER_DIR)) {
      fs.mkdirSync(INSTALLER_DIR, { recursive: true });
      console.log(`📁 Created installer directory\n`);
    }

    console.log(`🎨 Generating NSIS installer graphics...\n`);

    // Generate both banners
    const headerOk = await createHeaderBmp();
    const sidebarOk = await createSidebarBmp();

    console.log();

    if (headerOk && sidebarOk) {
      console.log(`🎉 Installer graphics generated successfully!\n`);
      console.log(`📋 Files created:`);
      console.log(`   ✅ header.png (150x57, NSIS header)`);
      console.log(`   ✅ sidebar.png (164x314, NSIS sidebar)\n`);
      console.log(`ℹ️  Using PNG format for better compatibility with NSIS\n`);
      process.exit(0);
    } else {
      console.error(`⚠️  Some files failed to generate`);
      process.exit(1);
    }

  } catch (error) {
    console.error(`\n❌ Installer asset generation failed:`, error.message);
    process.exit(1);
  }
}

// Run the generator
generateInstallerAssets();
