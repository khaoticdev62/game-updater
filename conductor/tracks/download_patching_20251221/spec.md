# Track Spec: Download & Patching Implementation

## Overview
This track implements the core functional engine for the Sims 4 Updater: downloading content using `aria2c` and applying binary patches using `xdelta3`. It bridges the manifest parsing logic with the physical file operations required to update or repair the game.

## Goals
- Integrate and manage `aria2c` for high-speed content acquisition.
- Implement the `xdelta3` patching engine for applying binary deltas.
- Create a unified update workflow that identifies, downloads, and patches files.
- Enable real-time progress reporting through the Electron-Python IPC bridge.

## Technical Requirements
- Python `subprocess` module for managing external binaries (`aria2c.exe`, `xdelta3.exe`).
- Multi-threaded or asynchronous handling of download streams.
- Strict MD5 verification before and after patching to ensure data integrity.
- IPC messages must include `percentage`, `speed`, and `current_file` status.

## Success Criteria
- Can successfully download a file using `aria2c` triggered via IPC.
- Can successfully apply an `xdelta3` patch to a sample file.
- The React UI displays a progress bar that updates in real-time during a mock update process.
