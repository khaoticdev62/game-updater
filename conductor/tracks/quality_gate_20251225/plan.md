# Plan: Final Quality Gate & Refinement

## Phase 1: IPC & UI Polish [checkpoint: ee45b5e]
- [x] Task: Remove placeholder `mockManifestUrl` from `App.tsx` and prepare for dynamic configuration.
- [x] Task: Enhance `HybridEventBus` in `index.ts` to gracefully handle unexpected sidecar process exits and errors.
- [x] Task: Write integration test for the `python-request` IPC channel to simulate real-world request/response cycles and progress updates.
- [x] Task: Conductor - User Manual Verification 'IPC & UI Polish' (Protocol in workflow.md) (ee45b5e)

## Phase 2: Scraper & Discovery Engine Hardening
- [ ] Task: Add `beautifulsoup4` to `requirements.txt`.
- [ ] Task: Refactor `URLResolver` in `manifest.py` to use `BeautifulSoup` for HTML parsing instead of fragile regex.
- [ ] Task: Enhance `tests/test_url_resolver.py` with more complex and failing HTML mock data.
- [ ] Task: Conductor - User Manual Verification 'Scraper Hardening' (Protocol in workflow.md)

## Phase 3: Mod Guardian & Safety Gates Finalization
- [ ] Task: Refactor `ModGuardian` to explicitly target `.ts4script` and `.package` files and ignore others.
- [ ] Task: Enhance `tests/test_mod_guardian.py` to verify correct handling of non-mod files.
- [ ] Task: Add edge case tests to `tests/test_rollback.py` (e.g., permissions errors, empty backup lists).
- [ ] Task: Conductor - User Manual Verification 'Safety Gates Finalization' (Protocol in workflow.md)

## Phase 4: Full-System E2E Verification & Final Cleanup
- [ ] Task: Create a new E2E test (`tests/test_e2e_full_workflow.py`) that simulates a complete user session.
- [ ] Task: Run `npm run lint -- --fix` to automatically correct style issues.
- [ ] Task: Perform a final review of all code for any remaining placeholders or comments.
- [ ] Task: Conductor - User Manual Verification 'Final Verification' (Protocol in workflow.md)
