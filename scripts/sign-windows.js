#!/usr/bin/env node

/**
 * Windows Code Signing Script
 *
 * Signs executables and installer with digital certificate using signtool.exe
 * Requires Windows SDK to be installed for signtool.exe availability
 *
 * Usage: node scripts/sign-windows.js <path-to-exe>
 *
 * Environment Variables:
 *   - CSC_LINK: Path to certificate file (.pfx)
 *   - CSC_KEY_PASSWORD: Password for the certificate
 *
 * Configuration:
 *   - Uses SHA256 hashing algorithm
 *   - Implements timestamp server fallback for reliability
 *   - Supports multiple timestamp servers for redundancy
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Certificate configuration
const CERTIFICATE_PATH = process.env.CSC_LINK;
const CERTIFICATE_PASSWORD = process.env.CSC_KEY_PASSWORD;
const SIGNING_ALGORITHM = 'sha256';

// Timestamp servers (in priority order)
const TIMESTAMP_SERVERS = [
  'http://timestamp.digicert.com',
  'http://timestamp.comodoca.com',
  'http://timestamp.sectigo.com',
];

/**
 * Find signtool.exe in Windows SDK installation
 * @returns {string} Path to signtool.exe
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
      console.log(`✅ Found signtool.exe at: ${toolPath}`);
      return toolPath;
    }
  }

  // Try to find in PATH
  try {
    execSync('where signtool.exe', { stdio: 'pipe' });
    return 'signtool.exe';
  } catch {
    throw new Error(
      'signtool.exe not found. Please install Windows SDK:\n' +
      'https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/'
    );
  }
}

/**
 * Sign a file with the certificate
 * @param {string} filePath - Path to file to sign
 * @param {string} signtoolPath - Path to signtool.exe
 * @returns {boolean} True if signing successful
 */
function signFile(filePath, signtoolPath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return false;
  }

  if (!CERTIFICATE_PATH || !fs.existsSync(CERTIFICATE_PATH)) {
    console.warn(`⚠️  Certificate not found at: ${CERTIFICATE_PATH}`);
    console.warn(`   Code signing will be skipped. This is OK for development.`);
    return true; // Don't fail, but warn user
  }

  if (!CERTIFICATE_PASSWORD) {
    console.warn(`⚠️  CSC_KEY_PASSWORD environment variable not set`);
    console.warn(`   Code signing will be skipped. This is OK for development.`);
    return true;
  }

  console.log(`🔐 Signing: ${path.basename(filePath)}`);

  // Try each timestamp server
  for (let i = 0; i < TIMESTAMP_SERVERS.length; i++) {
    const timestampServer = TIMESTAMP_SERVERS[i];

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

      console.log(`   Attempting timestamp server ${i + 1}/${TIMESTAMP_SERVERS.length}: ${timestampServer}`);
      execSync(cmd, { stdio: 'inherit' });
      console.log(`✅ Successfully signed: ${path.basename(filePath)}`);
      return true;

    } catch (error) {
      if (i < TIMESTAMP_SERVERS.length - 1) {
        console.warn(`   ⚠️  Timestamp server ${i + 1} failed, trying next...`);
      } else {
        console.error(`❌ Signing failed with all timestamp servers`);
        return false;
      }
    }
  }

  return false;
}

/**
 * Main signing function called by electron-builder
 * @param {object} configuration - electron-builder configuration
 */
async function signWindowsExecutable(configuration) {
  const { path: filePath } = configuration;

  if (!filePath) {
    console.error('❌ No file path provided for signing');
    process.exit(1);
  }

  console.log(`\n🔐 Windows Code Signing\n`);
  console.log(`📋 File: ${path.basename(filePath)}`);
  console.log(`📂 Path: ${filePath}\n`);

  try {
    const signtoolPath = findSignTool();
    const success = signFile(filePath, signtoolPath);

    if (!success) {
      console.error(`\n❌ Code signing failed`);
      // Don't exit with error - allow build to continue without signing
      // (useful for development)
      console.log(`⚠️  Continuing without code signing (OK for development)\n`);
    } else {
      console.log(`\n✨ Code signing complete\n`);
    }

  } catch (error) {
    console.error(`\n❌ Signing error: ${error.message}\n`);
    // Don't fail the build - signing is optional for dev
  }
}

// Export for electron-builder
if (require.main === module) {
  // When called directly, expect file path as argument
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node sign-windows.js <file-path>');
    process.exit(1);
  }
  signWindowsExecutable({ path: filePath }).catch(error => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = signWindowsExecutable;
