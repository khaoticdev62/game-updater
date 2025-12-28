import os
import sys
from pathlib import Path

def get_app_data_path() -> Path:
    """Returns the path to the application data directory."""
    if sys.platform == "win32":
        path = Path(os.environ.get("APPDATA", os.path.expanduser(r"~\AppData\Roaming"))) / "Sims4Updater"
    else:
        path = Path.home() / ".sims4updater"
    
    path.mkdir(parents=True, exist_ok=True)
    return path

def get_tools_path() -> Path:
    """Returns the path to the tools directory."""
    return Path(os.getcwd()) / "sims-4-updater-v1.4.7.exe_extracted" / "tools"
