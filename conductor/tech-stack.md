# Tech Stack: Sims 4 Updater Rebuild

## Frontend (UI)
- **Framework:** Electron with React (TypeScript).
- **Styling:** CSS Modules or Tailwind CSS for modern, high-contrast styling.
- **State Management:** React Context API or Redux Toolkit for managing download progress and DLC selections.

## Backend (Logic & Reverse Engineering)
- **Language:** Python 3.11+.
- **Networking:** 
    - **HTTPX:** For high-level API requests and manifest fetching.
    - **Aiohttp:** For high-performance, asynchronous file downloading and multi-threading.
- **Patching:** **PyXdelta (xdelta3)** for intelligent binary delta patching and file repairs.
- **Reverse Engineering Tools:** 
    - `pyinstxtractor` for extracting original source.
    - `uncompyle6` or `decompyle3` for Python bytecode analysis.

## Communication & Integration
- **Process Communication:** Electron IPC (Inter-Process Communication) to bridge the TypeScript UI and the Python backend.
- **Packaging:** 
    - **PyInstaller:** To package the Python backend logic.
    - **Electron Builder:** To package the final integrated application as a single Windows executable.

## Infrastructure & Tools
- **Version Control:** Git.
- **Development Environment:** VS Code with Python and Prettier/ESLint extensions.
