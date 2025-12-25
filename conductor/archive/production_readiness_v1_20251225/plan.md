# Plan: Production Readiness - Unified Packaging & IPC Resilience

## Phase 1: IPC Resilience [checkpoint: 4193b5c]
- [x] Task: Implement request timeouts in `HybridEventBus.request` in `src/index.ts`. 54cb7eb
- [x] Task: Add global error handling for timeout rejections in the frontend. cf2d403
- [x] Task: Write tests to verify IPC timeout behavior. 54cb7eb
- [x] Task: Conductor - User Manual Verification 'IPC Resilience' 54cb7eb

## Phase 2: Unified Packaging Logic [checkpoint: f127122]
- [x] Task: Implement production path resolution for the sidecar in `src/index.ts`. a91e22e
- [x] Task: Update `build_system.py` to ensure the executable is named consistently. a91e22e
- [x] Task: Verify sidecar spawning in both development and 'mock' production environments. 69fa3d0
- [x] Task: Conductor - User Manual Verification 'Packaging Logic' a91e22e

## Phase 3: Automated Build Pipeline [checkpoint: 850efab]
- [x] Task: Add a `generateAssets` hook to `forge.config.ts` to execute the Python build system. 6f74522
- [x] Task: Update `package.json` to include prerequisites for the integrated build. 6f74522
- [x] Task: Perform a full integrated build test (`npm run package`). 6f74522
- [x] Task: Conductor - User Manual Verification 'Integrated Build' 6f74522
