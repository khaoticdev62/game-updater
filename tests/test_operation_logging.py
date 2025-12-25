import unittest
import os
import json
import tempfile
from pathlib import Path
from janitor import OperationLogger

class TestOperationLogger(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.TemporaryDirectory()
        self.log_path = Path(self.test_dir.name) / "ops.log"
        self.logger = OperationLogger(self.log_path)

    def tearDown(self):
        self.test_dir.cleanup()

    def test_log_and_resume(self):
        # 1. Log some operations
        op1 = {"type": "download", "file": "Data/Client/Resource.cfg", "status": "pending"}
        op2 = {"type": "patch", "file": "Bin/TS4_x64.exe", "status": "pending"}
        
        self.logger.log_operation("op1", op1)
        self.logger.log_operation("op2", op2)
        
        # 2. Update status
        self.logger.update_status("op1", "completed")
        
        # 3. Resume (create new logger instance pointing to same file)
        resumer = OperationLogger(self.log_path)
        pending = resumer.get_pending_operations()
        
        self.assertEqual(len(pending), 1)
        self.assertEqual(pending[0]["id"], "op2")
        self.assertEqual(pending[0]["data"]["file"], "Bin/TS4_x64.exe")

    def test_clear_log(self):
        self.logger.log_operation("test", {"some": "data"})
        self.logger.clear_log()
        self.assertEqual(len(self.logger.get_pending_operations()), 0)
        self.assertFalse(self.log_path.exists())

if __name__ == '__main__':
    unittest.main()
