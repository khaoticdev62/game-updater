# Plan: Intelligent Dependency-Aware DLC Management

## Phase 1: Dependency & Mapping Engine [checkpoint: 60bea56]
- [x] Task: Implement `DLCGraph` in `engine.py` to map pack relationships and core dependencies.
- [x] Task: Enhance `ManifestParser` to tag files by category (Base, EP, GP, SP, Kit, Language).
- [x] Task: Write unit tests for dependency resolution (ensuring child packs flag their parents).
- [x] Task: Conductor - User Manual Verification 'Dependency Engine' (Protocol in workflow.md) (60bea56)

## Phase 2: Targeted Operation Filtering [checkpoint: 25cd323]
- [x] Task: Update `UpdateManager.get_operations` to accept a `selection` list.
- [x] Task: Implement logic to prune operations for unselected content while keeping dependencies.
- [x] Task: Create `SpaceCalculator` utility to estimate download and install sizes.
- [x] Task: Conductor - User Manual Verification 'Filtering & Estimation' (Protocol in workflow.md) (25cd323)

## Phase 3: High-Fidelity UI Dashboard
- [ ] Task: Upgrade the DLC list in `App.tsx` to use categorized grids with selection persistence.
- [ ] Task: Add a Language Selector dropdown to the Configuration section.
- [ ] Task: Implement a "Summary Bar" showing Total Size and Selected Count.
- [ ] Task: Conductor - User Manual Verification 'UI Dashboard' (Protocol in workflow.md)
