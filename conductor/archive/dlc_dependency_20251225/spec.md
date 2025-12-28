# Track Spec: Intelligent Dependency-Aware DLC Management

## Overview
This track transitions the updater from a "latest-only" or "global" patching model to a granular, selective installation system. It introduces a backend dependency engine to ensure that selected DLCs (Expansions, Game Packs, Kits) are installed alongside their required core files and version-specific dependencies.

## Goals
- **Granular Selection:** Users can choose exactly which content to install or update.
- **Dependency Enforcement:** Automatically identify and include mandatory files for selected content.
- **Resource Intelligence:** Provide real-time feedback on download sizes and disk space requirements.
- **Localization Support:** Support targeting specific language packs (string tables).

## Technical Requirements
- **Dependency Graph:** A new `DLCGraph` class to map relationships between packs and base-game versions.
- **Selective Manifest Parsing:** Enhance `ManifestParser` to filter file lists based on a provided "Selection Set".
- **Dynamic Space Calculation:** Calculate `delta` vs `full` sizes before the user commits to an update.
- **IPC Payload Expansion:** Update IPC messages to handle arrays of selected pack IDs and language codes.

## Success Criteria
- The UI allows selecting individual DLCs.
- Clicking "Update" only downloads/patches files related to the selections and their dependencies.
- The system prevents "broken" states where a selected DLC is missing a required base-game patch.
- Disk space warnings are issued before the update begins.
