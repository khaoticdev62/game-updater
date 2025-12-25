import unittest
import tempfile
from pathlib import Path
from build_system import BuildSystem

class TestBuildSystem(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.TemporaryDirectory()
        self.root = Path(self.test_dir.name)
        self.build = BuildSystem(self.root)

    def tearDown(self):
        self.test_dir.cleanup()

    def test_requirement_hashing(self):
        req_file = self.root / "requirements.txt"
        req_file.write_text("httpx==0.24.0")
        
        h1 = self.build.hash_requirements()
        self.assertNotEqual(h1, "")
        
        req_file.write_text("httpx==0.25.0")
        h2 = self.build.hash_requirements()
        self.assertNotEqual(h1, h2)

if __name__ == '__main__':
    unittest.main()
