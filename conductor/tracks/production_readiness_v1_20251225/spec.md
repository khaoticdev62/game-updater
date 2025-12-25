# Track Spec: Production Readiness - Unified Packaging & IPC Resilience

## Overview
This track addresses critical blockers for production deployment. It focuses on ensuring the Electron frontend correctly spawns the bundled Python sidecar in production, implementing IPC request timeouts for better resilience, and automating the integrated build pipeline.

## Goals
- **Unified Spawning:** The Electron main process must detect if it is packaged and spawn the appropriate executable (sidecar.exe vs sidecar.py).
- **IPC Reliability:** Implement a timeout mechanism for all IPC requests to prevent UI hangs if the backend fails to respond.
- **Automated Build Integration:** Synchronize the Python backend build (PyInstaller) with the Electron Forge build process.

## Technical Requirements
- **Path Resolution:** Use `app.isPackaged` and `process.resourcesPath` to locate the sidecar binary.
- **IPC Timeouts:** Update `HybridEventBus.request` to reject promises after a configurable timeout (e.g., 30 seconds).
- **Forge Hooks:** Implement an Electron Forge hook (e.g., `generateAssets`) to trigger `build_system.py`.

## Success Criteria
- The application runs correctly when started from a production build (`npm run package`).
- IPC requests fail gracefully with an error if the backend takes too long.
- A single command (`npm run package`) builds both the Python backend and the Electron frontend.
