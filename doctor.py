import os
import sys
import subprocess
import shutil
import httpx
from pathlib import Path
from typing import Dict, Any, List, Optional
from paths import get_tools_path, get_app_data_path
from download import Aria2Manager
from patch import Patcher

class BackendDoctor:
    """Diagnoses and attempts to fix common backend issues."""

    def __init__(self, app_data_path: Optional[Path] = None) -> None:
        self.app_data_path: Path = app_data_path or get_app_data_path()
        self.results: List[Dict[str, Any]] = []

    def check_all(self) -> List[Dict[str, Any]]:
        """Run all diagnostic checks."""
        self.results = []
        self.check_tools()
        self.check_internet()
        self.check_permissions()
        self.check_disk_space()
        return self.results

    def check_tools(self) -> None:
        """Verify aria2c and xdelta3 existence and functionality."""
        aria2 = Aria2Manager()
        xdelta = Patcher()

        # Check aria2
        aria2_status: Dict[str, Any] = {"name": "aria2c", "status": "ok", "message": "Tool found.", "version": "Unknown"}
        tool_exists = os.path.exists(aria2.aria2_exe) or shutil.which(aria2.aria2_exe)
        
        if not tool_exists:
            aria2_status = {"name": "aria2c", "status": "error", "message": f"Executable not found: {aria2.aria2_exe}", "version": "Not found"}
        else:
            try:
                res = subprocess.run([aria2.aria2_exe, "--version"], capture_output=True, check=True, text=True)
                version = res.stdout.splitlines()[0] if res.stdout else "Unknown"
                aria2_status = {"name": "aria2c", "status": "ok", "message": "Tool functional.", "version": version}
            except Exception as e:
                aria2_status = {"name": "aria2c", "status": "error", "message": f"Execution failed: {e}", "version": "Error"}
        self.results.append(aria2_status)

        # Check xdelta3
        xdelta_status: Dict[str, Any] = {"name": "xdelta3", "status": "ok", "message": "Tool found.", "version": "Unknown"}
        tool_exists = os.path.exists(xdelta.xdelta_exe) or shutil.which(xdelta.xdelta_exe)
        
        if not tool_exists:
            xdelta_status = {"name": "xdelta3", "status": "error", "message": f"Executable not found: {xdelta.xdelta_exe}", "version": "Not found"}
        else:
            try:
                res = subprocess.run([xdelta.xdelta_exe, "-V"], capture_output=True, check=True, text=True)
                version = res.stdout.splitlines()[0] if res.stdout else "Unknown"
                xdelta_status = {"name": "xdelta3", "status": "ok", "message": "Tool functional.", "version": version}
            except Exception as e:
                xdelta_status = {"name": "xdelta3", "status": "error", "message": f"Execution failed: {e}", "version": "Error"}
        self.results.append(xdelta_status)

    def check_internet(self) -> None:
        """Check internet connectivity to major update hosts."""
        status: Dict[str, Any] = {"name": "Connectivity", "status": "ok", "message": "Internet connection stable."}
        try:
            with httpx.Client(timeout=5.0) as client:
                client.get("https://google.com")
        except Exception as e:
            status = {"name": "Connectivity", "status": "warning", "message": f"Failed to reach external servers: {e}"}
        self.results.append(status)

    def check_permissions(self) -> None:
        """Check write permissions in AppData."""
        status: Dict[str, Any] = {"name": "Permissions", "status": "ok", "message": "Write permissions verified."}
        try:
            test_file = self.app_data_path / ".write_test"
            test_file.write_text("test")
            test_file.unlink()
        except Exception as e:
            status = {"name": "Permissions", "status": "error", "message": f"No write access to AppData: {e}"}
        self.results.append(status)

    def check_disk_space(self) -> None:
        """Check if disk space is critically low."""
        status: Dict[str, Any] = {"name": "Disk Space", "status": "ok", "message": "Sufficient disk space available."}
        try:
            usage = shutil.disk_usage(str(self.app_data_path))
            free_gb = usage.free / (1024**3)
            if free_gb < 1.0:
                status = {"name": "Disk Space", "status": "warning", "message": f"Critically low disk space: {free_gb:.2f} GB free."}
        except Exception:
            pass
        self.results.append(status)

    def attempt_repair(self) -> List[Dict[str, Any]]:
        """Attempts to fix identified issues (e.g., clearing temp files)."""
        repair_results: List[Dict[str, Any]] = []
        try:
            temp_files = list(self.app_data_path.glob("*.tmp"))
            for f in temp_files:
                f.unlink()
            repair_results.append({"name": "Cleanup", "status": "ok", "message": f"Removed {len(temp_files)} temporary files."})
        except Exception as e:
            repair_results.append({"name": "Cleanup", "status": "error", "message": str(e)})
        
        return repair_results
