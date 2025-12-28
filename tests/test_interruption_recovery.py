import unittest
import os
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch
from janitor import RecoveryOrchestrator

class TestRecoveryOrchestrator(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.TemporaryDirectory()
        self.game_dir = Path(self.test_dir.name)
        self.orchestrator = RecoveryOrchestrator(self.game_dir)

    def tearDown(self):
        self.test_dir.cleanup()

    @patch('janitor.rollback_to_restore_point')
    @patch('janitor.BackendDoctor.check_all')
    def test_recovery_flow(self, mock_doctor, mock_rollback):
        # Setup mocks
        mock_doctor.return_value = [{"name": "Disk Space", "status": "ok"}]
        mock_rollback.return_value = True
        
        # 1. Simulate an interrupted state (e.g. lock file exists)
        lock_file = self.game_dir / "update.lock"
        lock_file.touch()
        
        # 2. Run recovery
        success = self.orchestrator.run_recovery(restore_point="test_backup.zip")
        
        # 3. Assertions
        self.assertTrue(success)
        mock_rollback.assert_called_once()
        mock_doctor.assert_called_once()
        self.assertFalse(lock_file.exists())

if __name__ == '__main__':
    unittest.main()
