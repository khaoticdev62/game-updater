import unittest
import os
import tempfile
import time
from pathlib import Path
from engine import VerificationEngine

class TestHashingOptimization(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.TemporaryDirectory()
        self.engine = VerificationEngine(max_workers=4)

    def tearDown(self):
        self.test_dir.cleanup()

    def test_hashing_correctness(self):
        # Create a test file
        file_path = Path(self.test_dir.name) / "test.dat"
        content = b"Elite Performance Overhaul Content" * 1000
        file_path.write_bytes(content)
        
        # Hash it
        h = self.engine.hash_file(str(file_path))
        
        # Verify MD5 manually (VerificationEngine default is MD5)
        import hashlib
        expected = hashlib.md5(content).hexdigest().upper()
        self.assertEqual(h, expected)

    def test_parallel_hashing(self):
        # Create multiple files
        files = []
        for i in range(5):
            p = Path(self.test_dir.name) / f"file_{i}.dat"
            p.write_bytes(f"Content {i}".encode())
            files.append(str(p))
            
        results = self.engine.verify_files(files)
        self.assertEqual(len(results), 5)
        for f in files:
            self.assertIn(f, results)
            self.assertIsNotNone(results[f])

if __name__ == '__main__':
    unittest.main()
