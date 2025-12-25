# Plan: Production Readiness - Unified Packaging & IPC Resilience

## Phase 1: IPC Resilience
- [x] Task: Implement request timeouts in `HybridEventBus.request` in `src/index.ts`. 54cb7eb
- [ ] Task: Add global error handling for timeout rejections in the frontend.
- [ ] Task: Write tests to verify IPC timeout behavior.
- [ ] Task: Conductor - User Manual Verification 'IPC Resilience'

## Phase 2: Unified Packaging Logic
- [ ] Task: Implement production path resolution for the sidecar in `src/index.ts`.
- [ ] Task: Update `build_system.py` to ensure the executable is named consistently.
- [ ] Task: Verify sidecar spawning in both development and 'mock' production environments.
- [ ] Task: Conductor - User Manual Verification 'Packaging Logic'

## Phase 3: Automated Build Pipeline
- [ ] Task: Add a `generateAssets` hook to `forge.config.ts` to execute the Python build system.
- [ ] Task: Update `package.json` to include prerequisites for the integrated build.
- [ ] Task: Perform a full integrated build test (`npm run package`).
- [ ] Task: Conductor - User Manual Verification 'Integrated Build'
