import unittest
import os
import json
import tempfile
import shutil
from pathlib import Path
from mod_guardian import ModGuardian

class TestModGuardian(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.TemporaryDirectory()
        self.game_dir = Path(self.test_dir.name)
        self.mods_dir = self.game_dir / "Mods"
        self.mods_dir.mkdir()
        
        self.guardian = ModGuardian(self.game_dir)
        
        # Create community data
        self.community_file = self.game_dir / "broken_mods.json"
        self.broken_data = [
            {"name": "Broken Mod 1", "filename": "BrokenMod.ts4script"},
            {"name": "Outdated UI", "filename": "OutdatedUI.package"}
        ]
        self.community_file.write_text(json.dumps(self.broken_data))

    def tearDown(self):
        self.test_dir.cleanup()

    def test_scan_and_quarantine(self):
        # 1. Create mock mod files
        mod1 = self.mods_dir / "BrokenMod.ts4script"
        mod1.write_text("dummy content")
        mod2 = self.mods_dir / "SafeMod.package"
        mod2.write_text("safe content")
        
        # 2. Load data and scan
        self.guardian.load_community_data(self.community_file)
        broken = self.guardian.scan_for_broken_mods()
        
        self.assertEqual(len(broken), 1)
        self.assertEqual(broken[0].name, "BrokenMod.ts4script")
        
        # 3. Quarantine
        count = self.guardian.quarantine_mods(broken)
        self.assertEqual(count, 1)
        
        # 4. Verify filesystem
        self.assertFalse(mod1.exists())
        self.assertTrue((self.game_dir / "_Quarantine" / "BrokenMod.ts4script").exists())
        self.assertTrue(mod2.exists())

if __name__ == '__main__':
    unittest.main()
