# Plan: Intelligence Hub - Content Metadata & Discovery Integration

## Phase 1: Models & Database Implementation
- [x] Task: Create `models.py` with Pydantic-style models for content types. 46bc9a1
- [ ] Task: Implement `content_db.py` containing the comprehensive list of EPs, SPs, and community content.
- [ ] Task: Write tests to verify data integrity and model validation.
- [ ] Task: Conductor - User Manual Verification 'Metadata Core' (Protocol in workflow.md)

## Phase 2: DLC Manager Integration
- [ ] Task: Update `DLCManager` in `update_logic.py` to utilize the new database.
- [ ] Task: Implement "Missing Content Discovery" logic to flag uninstalled packs from the DB.
- [ ] Task: Enhance `get_dlc_status` IPC command to include rich metadata (descriptions, release dates).
- [ ] Task: Conductor - User Manual Verification 'Discovery Integration' (Protocol in workflow.md)

## Phase 3: UI Enrichment
- [ ] Task: Update `DLC` interface in `types.d.ts` and `DLCList.tsx` to include metadata fields.
- [ ] Task: Redesign `DLCGrid` item to show a tooltip or expanded view with the pack description.
- [ ] Task: Add a "Show Historical Versions" toggle to view old patches in the UI.
- [ ] Task: Conductor - User Manual Verification 'UI Enrichment' (Protocol in workflow.md)
