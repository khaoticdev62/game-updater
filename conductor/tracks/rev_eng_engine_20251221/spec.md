# Track Spec: Reverse Engineering & Core Backend Engine Implementation

## Overview
This track focuses on the foundational research and the implementation of the core backend engine. It involves deconstructing the original Sims 4 Updater to understand its logic, documenting its communication protocols, and building the high-performance verification and patching engine that will power the new application.

## Goals
- Successfully extract and analyze the original Python source code.
- Document manifest structures and network endpoints.
- Implement a multi-threaded file hashing system in Python.
- Establish a basic Electron-Python IPC bridge.

## Technical Requirements
- Use `pyinstxtractor` and decompilers for source analysis.
- Implement hashing using `hashlib` with multi-threading via `concurrent.futures`.
- Use Electron's `ipcMain` and `ipcRenderer` for communication.
- Backend logic must be structured for future packaging with PyInstaller.

## Success Criteria
- Decompiled source code available for reference.
- Detailed documentation of manifest formats.
- Verification engine can hash a Sims 4 directory at high speed.
- Frontend can successfully trigger a "hello world" response from the Python backend.
