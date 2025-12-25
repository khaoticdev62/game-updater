import os
import shutil
import json
from pathlib import Path
from typing import List, Dict, Any
from logging_system import get_logger

class ModGuardian:
    """
    Identifies and quarantines potentially broken mods based on community reports.
    Supports policies: 'always', 'selective', 'never'.
    """
    def __init__(self, game_dir: Path, policy: str = 'selective'):
        self.game_dir = game_dir
        self.mods_dir = game_dir / "Mods"
        self.quarantine_dir = game_dir / "_Quarantine"
        self.broken_mods_data: List[Dict[str, Any]] = []
        self.policy = policy

    def run_guardian(self) -> int:
        """Runs the guardian logic based on the current policy."""
        if self.policy == 'never':
            return 0
        
        if self.policy == 'always':
            # Quarantine all supported mod files
            all_mods = list(self.mods_dir.rglob("*.ts4script")) + list(self.mods_dir.rglob("*.package"))
            return self.quarantine_mods(all_mods)
        
        # Default: selective
        broken = self.scan_for_broken_mods()
        return self.quarantine_mods(broken)

    def load_community_data(self, data_path: Path):
        """Loads known broken mods from a community source (JSON)."""
        try:
            with open(data_path, 'r', encoding='utf-8') as f:
                self.broken_mods_data = json.load(f)
        except Exception as e:
            get_logger().error(f"ModGuardian: Failed to load community data: {e}")

    def scan_for_broken_mods(self) -> List[Path]:
        """Scans for .ts4script and .package files matching broken_mods_data."""
        if not self.mods_dir.exists():
            return []

        found = []
        # Target specific mod file types
        mod_files = list(self.mods_dir.rglob("*.ts4script")) + list(self.mods_dir.rglob("*.package"))

        for mod_file in mod_files:
            for broken in self.broken_mods_data:
                if broken["filename"].lower() == mod_file.name.lower():
                    found.append(mod_file)
                    break
        return found

    def quarantine_mods(self, mods: List[Path]) -> int:
        """Moves identified mods to the _Quarantine folder."""
        if not mods:
            return 0

        self.quarantine_dir.mkdir(parents=True, exist_ok=True)
        count = 0
        for mod in mods:
            try:
                dest = self.quarantine_dir / mod.name
                # Handle filename collisions in quarantine
                if dest.exists():
                    dest = self.quarantine_dir / f"{mod.stem}_{os.urandom(2).hex()}{mod.suffix}"
                
                shutil.move(str(mod), str(dest))
                get_logger().warning(f"ModGuardian: Quarantined {mod.name} -> {dest.name}")
                count += 1
            except Exception as e:
                get_logger().error(f"ModGuardian: Failed to quarantine {mod.name}: {e}")
        
        return count
