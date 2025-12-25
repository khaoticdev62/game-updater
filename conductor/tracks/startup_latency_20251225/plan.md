# Plan: Startup Latency Annihilation

## Phase 1: Python Lazy Loading & Ready Signal [checkpoint: 4bb495c]
- [x] Task: Benchmark current `sidecar.py` startup time.
- [x] Task: Refactor `sidecar.py` to use lazy imports for heavy dependencies.
- [x] Task: Implement immediate `{"type": "ready"}` signal in `sidecar.py` startup.
- [x] Task: Conductor - User Manual Verification 'Python Optimization' (Protocol in workflow.md) (4bb495c)

## Phase 2: React Adaptive Handshake
- [x] Task: Update `HybridEventBus` in `index.ts` to handle and forward the "ready" signal.
- [x] Task: Refactor `App.tsx` to use "Adaptive Polling" (100ms interval initially, backing off to 5s) and listen for "ready" event.
- [ ] Task: Conductor - User Manual Verification 'Frontend Handshake' (Protocol in workflow.md)
- [ ] Task: Conductor - User Manual Verification 'Frontend Handshake' (Protocol in workflow.md)
