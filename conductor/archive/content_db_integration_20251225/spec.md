# Track Spec: Intelligence Hub - Content Metadata & Discovery Integration

## Overview
This track integrates a comprehensive database of Sims 4 content (Expansion Packs, Stuff Packs, and Community Content) into the updater. It enables the application to provide rich metadata, track historical releases, and improve discovery of community-driven content.

## Goals
- **Structured Metadata:** Store and manage a complete list of EPs, SPs, and community content.
- **Enhanced DLC Management:** Use the database to identify missing content that might not be in the current live manifest.
- **Rich UI Feedback:** Display release dates, descriptions, and sources in the UI.
- **FastAPI-Style Modeling:** Use Pydantic-style models for robust data validation and internal consistency.

## Technical Requirements
- **Data Layer:** A new `content_db.py` module to store the provided metadata.
- **Models:** Implementation of Pydantic models for `Expansion`, `StuffPack`, and `CommunityContent`.
- **Integration:** Update `DLCManager` to cross-reference local files with the comprehensive database.
- **IPC Expansion:** Pass rich metadata from the Python sidecar to the Electron frontend.

## Success Criteria
- The application has a persistent, queryable database of all Sims 4 content.
- The UI displays descriptions and release dates for all packs.
- Missing content is correctly identified and categorized even without a specific manifest entry.
