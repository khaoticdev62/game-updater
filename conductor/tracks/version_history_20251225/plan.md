# Plan: Version History & Legacy Patching

## Phase 1: Backend Version Discovery [checkpoint: 8926da3]
- [x] Task: Implement `VersionScanner` in `manifest.py` to identify available versions from a base index URL.
- [x] Task: Update `ManifestFetcher` to support fetching a specific version's manifest.
- [x] Task: Write unit tests for `VersionScanner` with mock HTML indexes.
- [x] Task: Conductor - User Manual Verification 'Version Discovery' (Protocol in workflow.md) (8926da3)

## Phase 2: UI Version Selection
- [x] Task: Implement `get_available_versions` command in `sidecar.py`.
- [x] Task: Add a Version Selector dropdown in `App.tsx`.
- [x] Task: Wire the Version Selector to the manifest fetching logic.
- [ ] Task: Conductor - User Manual Verification 'Version UI' (Protocol in workflow.md)
- [ ] Task: Conductor - User Manual Verification 'Version UI' (Protocol in workflow.md)

## Phase 3: Legacy Patching Support
- [x] Task: Update `UpdateManager` to handle "downgrade" or "specific version" scenarios (ensuring it doesn't just check if local is 'less than' target).
- [x] Task: Verify end-to-end flow of selecting an old version and generating operations.
- [ ] Task: Conductor - User Manual Verification 'Legacy Patching' (Protocol in workflow.md)
