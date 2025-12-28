# Track Spec: Version History & Legacy Patching

## Overview
This track implements the capability to discover, fetch, and apply patches for specific previous versions of the game (e.g., v1.119.0). It transitions the updater from a "latest-only" tool to a flexible version management system.

## Goals
- **Version Discovery:** Scrape manifest sources or indexes to find available game versions.
- **Targeted Fetching:** Fetch version-specific manifests to generate appropriate patching operations.
- **UI Integration:** Allow users to select a target version from a list of discovered versions.

## Technical Requirements
- **Version Scraper:** A new module or enhancement to `ManifestFetcher` to parse version indexes.
- **Versioned Manifests:** Ability to construct URLs for specific version manifests based on discovered patterns.
- **Downgrade/Specific Patching:** `UpdateManager` must correctly interpret manifests even when they target a version older than the current 'latest'.

## Success Criteria
- The UI displays a list of available game versions fetched from the backend.
- Selecting an older version correctly fetches its manifest and identifies the necessary patches/downloads.
- The system can successfully "update" (or downgrade/repair) to a specific chosen version.
