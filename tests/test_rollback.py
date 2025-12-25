import unittest
import os
import tempfile
import zipfile
from pathlib import Path
from unittest.mock import patch
from rollback_manager import RollbackManager

class TestRollbackManager(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.TemporaryDirectory()
        self.game_dir = Path(self.test_dir.name)
        # Mock app data for paths.py
        os.environ["APPDATA"] = str(self.game_dir / "AppData")
        
        self.manager = RollbackManager(str(self.game_dir))

    def tearDown(self):
        self.test_dir.cleanup()

    def test_create_restore_point(self):
        # 1. Setup files
        f1 = self.game_dir / "Bin" / "TS4_x64.exe"
        f1.parent.mkdir(parents=True)
        f1.write_text("executable")
        
        f2 = self.game_dir / "Game" / "resource.cfg"
        f2.parent.mkdir(parents=True)
        f2.write_text("config")
        
        # 2. Create restore point
        files_to_backup = ["Bin/TS4_x64.exe", "Game/resource.cfg", "nonexistent.txt"]
        zip_name = self.manager.create_restore_point(files_to_backup)
        
        self.assertIsNotNone(zip_name)
        zip_path = self.manager.backup_dir / zip_name
        self.assertTrue(zip_path.exists())
        
        # 3. Verify ZIP content
        with zipfile.ZipFile(zip_path, 'r') as z:
            names = z.namelist()
            self.assertIn("Bin/TS4_x64.exe", names)
            self.assertIn("Game/resource.cfg", names)
            self.assertEqual(len(names), 2)

    def test_rollback_edge_cases(self):
        # 1. Test rollback with non-existent restore point
        self.assertFalse(self.manager.rollback("non_existent_backup.zip"))

        # 2. Test create with permissions error
        with unittest.mock.patch('zipfile.ZipFile') as mock_zip:
            mock_zip.side_effect = PermissionError("Mocked permissions error")
            zip_name = self.manager.create_restore_point(["some_file.txt"])
            self.assertIsNone(zip_name)

if __name__ == '__main__':
    unittest.main()
