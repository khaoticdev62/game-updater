# Plan: Intelligence Hub - Content Metadata & Discovery Integration

## Phase 1: Models & Database Implementation [checkpoint: 47ed042]
- [x] Task: Create `models.py` with Pydantic-style models for content types. 46bc9a1
- [x] Task: Implement `content_db.py` containing the comprehensive list of EPs, SPs, and community content. d3be0f2
- [x] Task: Write tests to verify data integrity and model validation. 0b43b3b
- [x] Task: Conductor - User Manual Verification 'Metadata Core' (Protocol in workflow.md) 74d8e9a

## Phase 2: DLC Manager Integration
- [x] Task: Update `DLCManager` in `update_logic.py` to utilize the new database. 72ebf5c
- [x] Task: Implement "Missing Content Discovery" logic to flag uninstalled packs from the DB. 22a6897
- [x] Task: Enhance `get_dlc_status` IPC command to include rich metadata (descriptions, release dates). cfdbfb6
- [x] Task: Conductor - User Manual Verification 'Discovery Integration' (Protocol in workflow.md) cfdbfb6

## Phase 3: UI Enrichment
- [ ] Task: Update `DLC` interface in `types.d.ts` and `DLCList.tsx` to include metadata fields.
- [ ] Task: Redesign `DLCGrid` item to show a tooltip or expanded view with the pack description.
- [ ] Task: Add a "Show Historical Versions" toggle to view old patches in the UI.
- [ ] Task: Conductor - User Manual Verification 'UI Enrichment' (Protocol in workflow.md)
