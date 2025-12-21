# Track Plan: Live Manifest Integration & Full Workflow Orchestration

## Phase 1: Live Manifest & URL Resolver
- [ ] Task: Implement Feature: `ManifestFetcher` class to retrieve manifest from configurable URLs.
- [ ] Task: Write Tests: `ManifestFetcher` handles network errors, timeouts, and malformed responses.
- [ ] Task: Implement Feature: Dynamic URL resolver to process download URLs from manifest (e.g., handle MediaFire redirects).
- [ ] Task: Write Tests: URL resolver correctly extracts direct download links.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Live Manifest & URL Resolver' (Protocol in workflow.md)

## Phase 2: End-to-End Workflow & Error Handling
- [ ] Task: Integrate `ManifestFetcher` and URL resolver into `UpdateManager`.
- [ ] Task: Implement Feature: `Updater` orchestrator in `sidecar.py` that ties together manifest fetching, operation generation, and execution.
- [ ] Task: Write Tests: Full update workflow (fetch manifest, generate ops, execute, report status).
- [ ] Task: Implement Feature: Enhanced error reporting from Python to Electron.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: End-to-End Workflow & Error Handling' (Protocol in workflow.md)

## Phase 3: UI - Full Integration & User Feedback
- [ ] Task: Update UI: Connect "Verify All" to live manifest fetching.
- [ ] Task: Update UI: Display real DLC status fetched from the backend.
- [ ] Task: Update UI: Create a dedicated "Update" button that triggers the orchestrated workflow.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: UI - Full Integration & User Feedback' (Protocol in workflow.md)
