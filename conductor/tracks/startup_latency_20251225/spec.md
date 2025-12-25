# Track Spec: Startup Latency Annihilation

## Overview
The user has requested "even faster backend connection at startup". Currently, the UI relies on a 5-second polling interval to detect the backend, and the Python backend loads all modules synchronously at startup. This track aims to eliminate this perceived latency.

## Goals
- **Instant Feedback:** The UI should reflect "Backend Healthy" status almost immediately (< 500ms) after the window appears.
- **Optimized Boot:** The Python sidecar should start up and listen for commands before loading heavy dependencies (Lazy Loading).
- **Event-Driven Handshake:** Replace the slow polling mechanism with an event-driven "Ready" signal from the backend.

## Technical Requirements
- **Lazy Imports:** Refactor `sidecar.py` to import modules like `engine`, `download`, and `patch` only when needed or after the initial "ready" signal is sent.
- **Ready Signal:** The sidecar must emit a `{"type": "ready"}` JSON message to stdout as its very first action after basic setup.
- **Adaptive Polling/Handshake:** The frontend (`App.tsx`) should implement a "fast-poll" (e.g., 100ms) during the first few seconds or listen for the forwarded "ready" event from Electron.

## Success Criteria
- The "Backend Status" indicator turns green visibly faster than the current implementation.
- `sidecar.py` startup time (measured to first output) is reduced.
