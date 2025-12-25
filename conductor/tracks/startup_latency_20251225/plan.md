# Plan: Startup Latency Annihilation

## Phase 1: Python Lazy Loading & Ready Signal
- [x] Task: Benchmark current `sidecar.py` startup time.
- [x] Task: Refactor `sidecar.py` to use lazy imports for heavy dependencies.
- [x] Task: Implement immediate `{"type": "ready"}` signal in `sidecar.py` startup.
- [ ] Task: Conductor - User Manual Verification 'Python Optimization' (Protocol in workflow.md)

## Phase 2: React Adaptive Handshake
- [ ] Task: Update `HybridEventBus` in `index.ts` to handle and forward the "ready" signal.
- [ ] Task: Refactor `App.tsx` to use "Adaptive Polling" (100ms interval initially, backing off to 5s) and listen for "ready" event.
- [ ] Task: Conductor - User Manual Verification 'Frontend Handshake' (Protocol in workflow.md)
