# Track Plan: Download & Patching Implementation

## Phase 1: Downloading Engine [checkpoint: 07fae57]
- [x] Task: Write Tests: `aria2c` manager logic (spawn, progress parsing, error handling). (ed2e96b)
- [x] Task: Implement Feature: `aria2c` wrapper in Python. (f029d04)
- [x] Task: Implement Feature: Download queue and resume logic. (70c2719)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Downloading Engine' (Protocol in workflow.md) (07fae57)

## Phase 2: Patching Engine
- [ ] Task: Write Tests: `xdelta3` patch application and MD5 verification.
- [ ] Task: Implement Feature: `xdelta3` wrapper in Python.
- [ ] Task: Implement Feature: Atomic patching workflow (patch to temp, verify, then swap).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Patching Engine' (Protocol in workflow.md)

## Phase 3: Manifest to Operation Bridge
- [ ] Task: Implement Feature: Operation generator (converts manifest + local state into a list of download/patch tasks).
- [ ] Task: Implement Feature: Progress reporting stream over IPC.
- [ ] Task: Update UI: Basic progress dashboard in React to display backend status.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Manifest to Operation Bridge' (Protocol in workflow.md)
