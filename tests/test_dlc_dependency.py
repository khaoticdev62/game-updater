import unittest
from engine import DLCGraph, ManifestParser
import json

class TestDLCDependency(unittest.TestCase):
    def test_dependency_resolution(self):
        graph = DLCGraph()
        # EP01 requires Base
        graph.add_dependency("EP01", "Base")
        # GP01 requires EP01
        graph.add_dependency("GP01", "EP01")
        # SP01 requires Base
        graph.add_dependency("SP01", "Base")

        # Select only GP01
        resolved = graph.resolve_dependencies(["GP01"])
        
        # Should include GP01, EP01, and Base
        self.assertIn("GP01", resolved)
        self.assertIn("EP01", resolved)
        self.assertIn("Base", resolved)
        self.assertEqual(len(resolved), 3)

    def test_manifest_categorization(self):
        manifest_data = {
            "version": "1.0.0",
            "patch": {
                "files": [
                    {"name": "core.dll", "category": "Base"},
                    {"name": "ep01.pkg", "category": "EP", "pack_id": "EP01"},
                    {"name": "gp01.pkg", "category": "GP", "pack_id": "GP01"},
                    {"name": "extra.pkg"} # Default to Base
                ]
            }
        }
        parser = ManifestParser(json.dumps(manifest_data))
        categorized = parser.get_categorized_patches()
        
        self.assertEqual(len(categorized["Base"]), 2)
        self.assertEqual(len(categorized["EP"]), 1)
        self.assertEqual(len(categorized["GP"]), 1)
        self.assertEqual(categorized["EP"][0]["pack_id"], "EP01")

if __name__ == '__main__':
    unittest.main()
