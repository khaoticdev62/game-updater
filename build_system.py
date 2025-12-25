import os
import subprocess
import hashlib
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, List
from pathlib import Path

class BuildSystem:
    """
    Automates dependency verification and packaging.
    """
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.dist_dir = project_root / "dist"
        self.requirements_file = project_root / "requirements.txt"

    def hash_requirements(self) -> str:
        """Calculates hash of requirements.txt."""
        if not self.requirements_file.exists():
            return ""
        with open(self.requirements_file, 'rb') as f:
            return hashlib.sha256(f.read()).hexdigest()

    def package_backend(self) -> bool:
        """Packages the sidecar using PyInstaller."""
        print("BuildSystem: Packaging backend sidecar...")
        args = [
            "pyinstaller",
            "--onefile",
            "--name", "sidecar",
            "--clean",
            str(self.project_root / "sidecar.py")
        ]
        try:
            subprocess.run(args, check=True, capture_output=True)
            return True
        except subprocess.CalledProcessError as e:
            print(f"BuildSystem: PyInstaller failed: {e.stderr.decode()}")
            return False

    def verify_environment(self) -> bool:
        """Verifies that all required tools are available."""
        tools = ["python", "pyinstaller"]
        for tool in tools:
            if not shutil.which(tool):
                return False
        return True

import shutil # Needed for which
