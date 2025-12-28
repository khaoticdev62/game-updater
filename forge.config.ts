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
    asar: true,
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
  },
  rebuildConfig: {},
  hooks: {
    generateAssets: async () => {
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
    },
  },
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
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
