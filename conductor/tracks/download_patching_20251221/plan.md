# Track Plan: Download & Patching Implementation

## Phase 1: Downloading Engine [checkpoint: 07fae57]
- [x] Task: Write Tests: `aria2c` manager logic (spawn, progress parsing, error handling). (ed2e96b)
- [x] Task: Implement Feature: `aria2c` wrapper in Python. (f029d04)
- [x] Task: Implement Feature: Download queue and resume logic. (70c2719)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Downloading Engine' (Protocol in workflow.md) (07fae57)

## Phase 2: Patching Engine [checkpoint: 78da55c]
- [x] Task: Write Tests: `xdelta3` patch application and MD5 verification. (89655bc)
- [x] Task: Implement Feature: `xdelta3` wrapper in Python. (c6b33f2)
- [x] Task: Implement Feature: Atomic patching workflow (patch to temp, verify, then swap). (8703539)
- [x] Task: Conductor - User Manual Verification 'Phase 2: Patching Engine' (Protocol in workflow.md) (78da55c)

## Phase 3: Manifest to Operation Bridge
- [x] Task: Implement Feature: Operation generator (converts manifest + local state into a list of download/patch tasks). (bfac32b)
- [~] Task: Implement Feature: Progress reporting stream over IPC.
- [ ] Task: Update UI: Basic progress dashboard in React to display backend status.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Manifest to Operation Bridge' (Protocol in workflow.md)
