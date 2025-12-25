import os
import shutil
import zipfile
import logging
from pathlib import Path
from typing import List, Optional
from app_config import get_config
from paths import get_app_data_path

class RollbackManager:
    """
    Handles game file backups and restoration.
    """
    def __init__(self, game_dir: str):
        self.game_dir = Path(game_dir)
        self.backup_dir = get_app_data_path() / "backups"
        self.backup_dir.mkdir(parents=True, exist_ok=True)

    def create_restore_point(self, file_paths: List[str]) -> Optional[str]:
        """Creates a backup zip of specified files before patching."""
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        zip_name = f"AutoPatch_Pre_{timestamp}.zip"
        zip_path = self.backup_dir / zip_name

        try:
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_ref:
                for rel_path in file_paths:
                    full_path = self.game_dir / rel_path
                    if full_path.exists():
                        zip_ref.write(full_path, rel_path)
            return zip_name
        except PermissionError:
            return None
        except Exception:
            if zip_path.exists():
                zip_path.unlink()
            return None

    def list_restore_points(self) -> List[str]:
        """Returns a list of available backup zip files."""
        return [f.name for f in self.backup_dir.glob("*.zip")]

    def rollback(self, restore_point_name: str) -> bool:
        """Restores game files from a specific backup zip."""
        zip_path = self.backup_dir / restore_point_name
        if not zip_path.exists():
            return False

        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(self.game_dir)
            return True
        except Exception:
            return False

def rollback_to_restore_point(restore_point_path: str, game_dir: str) -> bool:
    """
    Utility function to perform a rollback.
    """
    manager = RollbackManager(game_dir)
    # If restore_point_path is an absolute path to a zip, use it directly
    if os.path.isabs(restore_point_path) and os.path.exists(restore_point_path):
        try:
            with zipfile.ZipFile(restore_point_path, 'r') as zip_ref:
                zip_ref.extractall(game_dir)
            return True
        except Exception:
            return False
    
    # Otherwise assume it's a name in the backup directory
    return manager.rollback(restore_point_path)
