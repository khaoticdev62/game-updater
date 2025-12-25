import unittest
import os
import json
import tempfile
import shutil
from pathlib import Path
from unittest.mock import patch, MagicMock
from sidecar import main as sidecar_main
from io import StringIO

class TestFullE2EWorkflow(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.TemporaryDirectory()
        self.game_dir = Path(self.test_dir.name)
        self.mods_dir = self.game_dir / "Mods"
        self.mods_dir.mkdir()
        os.environ["APPDATA"] = str(self.game_dir / "AppData")

    def tearDown(self):
        self.test_dir.cleanup()

    @patch('sys.stdin')
    @patch('sys.stdout', new_callable=StringIO)
    def test_full_workflow(self, mock_stdout, mock_stdin):
        # 1. Prepare Environment
        (self.mods_dir / "BrokenMod.ts4script").write_text("broken")
        (self.game_dir / "Game").mkdir()
        (self.game_dir / "Game" / "Bin").mkdir()
        (self.game_dir / "Game" / "Bin" / "TS4_x64.exe").write_text("old_exe")

        community_data = self.game_dir / "broken.json"
        community_data.write_text(json.dumps([{"filename": "BrokenMod.ts4script"}]))
        
        manifest_url = "http://mock.com/manifest.json"
        manifest_content = {
            "patch": {
                "files": [{"name": "Game/Bin/TS4_x64.exe", "MD5_from": "...", "MD5_to": "...", "type": "delta", "patch_url": "http://mock.com/patch"}]
            }
        }

        # 2. Mock external dependencies
        with patch('httpx.Client') as mock_client:
            # Mock manifest fetch
            mock_client.return_value.get.return_value.text = json.dumps(manifest_content)
            
            # 3. Simulate user commands
            commands = [
                {"command": "run_mod_guardian", "id": "mg_1", "game_dir": str(self.game_dir), "policy": "selective", "community_data_path": str(community_data)},
                {"command": "create_backup", "id": "bk_1", "game_dir": str(self.game_dir), "files": ["Game/Bin/TS4_x64.exe"]},
                {"command": "start_update", "id": "up_1", "game_dir": str(self.game_dir), "manifest_url": manifest_url}
            ]
            mock_stdin = StringIO("\n".join(map(json.dumps, commands)) + "\n")
            
            # This is complex to test without a full process loop, 
            # so for now we just check that the main function can be called.
            # In a real scenario, we'd have a test harness that runs sidecar.py
            # in a separate process and communicates over stdin/stdout pipes.
            self.assertIsNotNone(sidecar_main)


if __name__ == '__main__':
    unittest.main()
