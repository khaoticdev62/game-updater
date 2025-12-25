# Tech Stack: Sims 4 Updater Rebuild

## Frontend (UI)
- **Framework:** Electron with React (TypeScript).
- **Styling:** CSS Modules or Tailwind CSS for modern, high-contrast styling.
- **State Management:** React Context API or Redux Toolkit for managing download progress and DLC selections.

## Backend (Logic & Reverse Engineering)
- **Language:** Python 3.11+.
- **Networking:** 
    - **HTTPX:** For high-level API requests, manifest fetching, and URL resolution.
    - **Pydantic:** For robust data modeling and internal metadata consistency.
    - **aria2c:** For high-performance, multi-threaded downloading (orchestrated via Python).
- **Patching:** **PyXdelta (xdelta3)** for intelligent binary delta patching and file repairs.
- **Reverse Engineering Tools:** 
    - **BeautifulSoup:** For robust HTML parsing of mirror and redirector pages.
    - `pyinstxtractor` for extracting original source.
    - **Scripts:** Custom decompilation and analysis tools (relocated to `scripts/reverse_engineering/`).
- **Resilience & Safety:**
    - **JSON Stateful Logging:** For resumable background operations.
    - **Rollback Orchestration:** Time-stamped ZIP-based game state preservation.
- **Dependency Management:**
    - **DLCGraph:** Custom directed-graph engine for resolving pack-level dependencies and core requirements.

## Communication & Integration
- **Process Communication:** Electron IPC (Inter-Process Communication) to bridge the TypeScript UI and the Python backend.
- **Lifecycle Management:**
    - **Lazy Loading:** Python backend dependencies are loaded on-demand to minimize startup time.
    - **Ready Handshake:** Event-driven signal from backend to UI for near-instant connectivity.
- **Packaging:** 
    - **PyInstaller:** To package the Python backend logic.
    - **Electron Builder:** To package the final integrated application as a single Windows executable.

## Infrastructure & Tools
- **Version Control:** Git.
- **Development Environment:** VS Code with Python and Prettier/ESLint extensions.
