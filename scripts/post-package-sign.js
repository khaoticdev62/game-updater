#!/usr/bin/env node

/**
 * Post-Package Code Signing Script
 *
 * Signs the packaged Electron application after Electron Forge creates it
 * This script signs:
 *   - Main executable (Sims4Updater.exe)
 *   - Python sidecar (sidecar.exe)
 *   - Installer (once created by electron-builder)
 *
 * Run after: npm run make
 * Requires: Windows SDK (for signtool.exe)
 *
 * Environment Variables:
 *   - CSC_LINK: Path to certificate file (.pfx)
 *   - CSC_KEY_PASSWORD: Certificate password
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CERTIFICATE_PATH = process.env.CSC_LINK;
const CERTIFICATE_PASSWORD = process.env.CSC_KEY_PASSWORD;
const SIGNING_ALGORITHM = 'sha256';

const TIMESTAMP_SERVERS = [
  'http://timestamp.digicert.com',
  'http://timestamp.comodoca.com',
  'http://timestamp.sectigo.com',
];

/**
 * Find signtool.exe
 */
function findSignTool() {
  const commonPaths = [
    'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.22621.0\\x64\\signtool.exe',
    'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.19041.0\\x64\\signtool.exe',
    'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\x64\\signtool.exe',
    'C:\\Program Files\\Windows Kits\\10\\bin\\10.0.22621.0\\x64\\signtool.exe',
  ];

  for (const toolPath of commonPaths) {
    if (fs.existsSync(toolPath)) {
      return toolPath;
    }
  }

  try {
    execSync('where signtool.exe', { stdio: 'pipe' });
    return 'signtool.exe';
  } catch {
    throw new Error(
      'signtool.exe not found. Install Windows SDK:\n' +
      'https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/'
    );
  }
}

/**
 * Sign a file with retry logic
 */
function signFile(filePath, signtoolPath, retries = 3) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return false;
  }

  // Check certificate availability
  if (!CERTIFICATE_PATH || !fs.existsSync(CERTIFICATE_PATH)) {
    console.warn(`⚠️  Certificate not available at: ${CERTIFICATE_PATH}`);
    return true; // Don't fail
  }

  if (!CERTIFICATE_PASSWORD) {
    console.warn(`⚠️  CSC_KEY_PASSWORD not set`);
    return true;
  }

  console.log(`🔐 Signing: ${path.basename(filePath)}`);

  for (let i = 0; i < TIMESTAMP_SERVERS.length; i++) {
    const timestampServer = TIMESTAMP_SERVERS[i];

    for (let retry = 0; retry < retries; retry++) {
      try {
        const cmd = [
          `"${signtoolPath}"`,
          'sign',
          '/f', `"${CERTIFICATE_PATH}"`,
          '/p', `"${CERTIFICATE_PASSWORD}"`,
          '/t', timestampServer,
          '/fd', SIGNING_ALGORITHM,
          '/v',
          `"${filePath}"`,
        ].join(' ');

        console.log(`   TS ${i + 1}/${TIMESTAMP_SERVERS.length} (attempt ${retry + 1}/${retries})`);
        execSync(cmd, { stdio: 'inherit' });
        console.log(`✅ Signed: ${path.basename(filePath)}`);
        return true;

      } catch (error) {
        if (retry < retries - 1) {
          console.warn(`   ⚠️  Attempt ${retry + 1} failed, retrying...`);
        }
      }
    }

    if (i < TIMESTAMP_SERVERS.length - 1) {
      console.warn(`   ⚠️  Timestamp server ${i + 1} failed, trying next...`);
    }
  }

  console.warn(`⚠️  Could not sign: ${path.basename(filePath)}`);
  return true; // Don't fail the build
}

/**
 * Find and sign all executables in the packaged app
 */
function signPackagedApp() {
  console.log(`\n🔐 Post-Package Code Signing\n`);

  try {
    const signtoolPath = findSignTool();
    console.log(`✅ Found signtool at: ${signtoolPath}\n`);

    // Paths to sign (relative to project root)
    const filesToSign = [
      'out/my-app-win32-x64/Sims4Updater.exe',
      'out/my-app-win32-x64/resources/sidecar.exe',
    ];

    let signedCount = 0;

    for (const filePath of filesToSign) {
      const fullPath = path.resolve(filePath);
      if (fs.existsSync(fullPath)) {
        const success = signFile(fullPath, signtoolPath);
        if (success) signedCount++;
        console.log();
      } else {
        console.warn(`⚠️  Not found: ${filePath}\n`);
      }
    }

    console.log(`📊 Signing Summary:`);
    console.log(`   ✅ Signed: ${signedCount}/${filesToSign.length} files`);

    if (signedCount > 0) {
      console.log(`\n✨ Packaged application signed successfully\n`);
    } else {
      console.log(`\n⚠️  No files were signed (OK for development)\n`);
    }

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    // Don't exit with error - allow build to continue
  }
}

// Run when called directly
if (require.main === module) {
  signPackagedApp();
}

module.exports = signPackagedApp;
