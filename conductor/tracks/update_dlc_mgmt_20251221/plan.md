# Track Plan: Update Execution & DLC Management

## Phase 1: Execution Loop [checkpoint: 15d73dd]
- [x] Task: Implement Feature: `ApplyOperations` logic in `update_logic.py` (loop through ops, handle downloads then patches). (1fe3f09)
- [x] Task: Write Tests: Sequential operation execution and failure recovery. (8e83d4d)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Execution Loop' (Protocol in workflow.md) (15d73dd)

## Phase 2: DLC Management Logic
- [ ] Task: Implement Feature: DLC detection logic based on manifest and directory structure.
- [ ] Task: Write Tests: Verify correct identification of missing vs. installed DLCs.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: DLC Management Logic' (Protocol in workflow.md)

## Phase 3: UI - DLC Dashboard & Controls
- [ ] Task: Update UI: Create a clean DLC selection list component in React.
- [ ] Task: Update UI: Connect the "Update/Repair" button to the execution engine via IPC.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: UI - DLC Dashboard & Controls' (Protocol in workflow.md)
