import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

import { execSync } from 'child_process';

const config: ForgeConfig = {
  packagerConfig: {
    asar: {
      unpackDir: ['dist'],
    },
    name: 'Sims 4 Updater',
    executableName: 'Sims4Updater',
    icon: './assets/branding/logo/exports/icon',
    appBundleId: 'com.khaotickobedev.sims4updater',
    win32metadata: {
      CompanyName: 'KhaoticKodeDev62',
      FileDescription: 'Sims 4 Updater - Game Content Manager',
      ProductName: 'Sims 4 Updater',
      OriginalFilename: 'Sims4Updater.exe',
    },
    extraResource: [
      './dist/sidecar.exe',
      './assets/branding/logo/exports/icon.ico',
    ],
    ignore: (file: string) => {
      if (!file) return false;
      const normalized = file.replace(/\\/g, '/').toLowerCase();
      // Aggressively ignore problematic directories
      if (normalized.includes('.pytest_cache')) return true;
      if (normalized.includes('__pycache__')) return true;
      if (normalized.includes('/.git/')) return true;
      if (normalized.includes('\\.git\\')) return true;
      if (normalized.endsWith('.git')) return true;
      if (normalized.includes('.pytest')) return true;
      if (normalized.includes('node_modules/.bin')) return true;
      return false;
    },
  },
  rebuildConfig: {},
  hooks: {
    generateAssets: async () => {
      const fs = require('fs');
      const childProcess = require('child_process');

      // Pre-build step: Handle .pytest_cache permissions
      console.log('Hooks: Handling .pytest_cache permissions...');
      try {
        if (fs.existsSync('.pytest_cache')) {
          // Try to change attributes to make it hidden/system
          try {
            childProcess.execSync('attrib +h +s .pytest_cache', { stdio: 'ignore' });
            console.log('Applied hidden attributes to .pytest_cache');
          } catch (e) {
            // Ignore if attrib fails
          }
        }
      } catch (e) {
        // Ignore errors
      }

      console.log('Hooks: Generating branding assets...');
      // Generate PNG icons from SVG
      execSync('node scripts/generate-icons.js', { stdio: 'inherit' });
      // Generate .ico file
      execSync('node scripts/generate-ico.js', { stdio: 'inherit' });
      // Generate NSIS installer assets
      execSync('node scripts/generate-installer-assets.js', { stdio: 'inherit' });

      console.log('Hooks: Building Python sidecar...');
      // Using escaped double quotes for the inner strings to work reliably on Windows
      const cmd = 'python -c "from build_system import BuildSystem; from pathlib import Path; bs = BuildSystem(Path(\'.\'));bs.package_backend(Path(\'dist\'))"';
      execSync(cmd, { stdio: 'inherit' });

      // Clean up problematic directories that can cause permission errors
      console.log('Hooks: Cleaning up problematic directories...');
      const dirs = ['__pycache__'];
      for (const dir of dirs) {
        if (fs.existsSync(dir)) {
          try {
            // Try PowerShell rmdir for better handling on Windows
            if (process.platform === 'win32') {
              childProcess.execSync(`powershell -Command "Remove-Item '${dir}' -Recurse -Force -ErrorAction SilentlyContinue"`, { stdio: 'ignore' });
            } else {
              fs.rmSync(dir, { recursive: true, force: true });
            }
            console.log(`Cleaned up ${dir}`);
          } catch (err) {
            console.warn(`Could not remove ${dir}: ${err.message}`);
          }
        }
      }
    },
  },
  makers: [
    new MakerSquirrel({
      certificateFile: null,
      certificatePassword: null,
    }),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/renderer.tsx',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          },
          {
            html: './src/splash.html',
            js: './src/splash-renderer.tsx',
            name: 'splash_window',
            preload: {
              js: './src/preload.ts',
            },
          },
        ],
      },
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
