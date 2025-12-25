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

    def test_update_manager_selection_filtering(self):
        from update_logic import UpdateManager
        from unittest.mock import MagicMock
        
        manifest = {
            "version": "1.0.0",
            "dependencies": {"GP01": ["Base"]},
            "patch": {
                "files": [
                    {"name": "base.dll", "pack_id": "Base", "MD5_to": "H1", "type": "full", "url": ".."},
                    {"name": "ep01.pkg", "pack_id": "EP01", "MD5_to": "H2", "type": "full", "url": ".."},
                    {"name": "gp01.pkg", "pack_id": "GP01", "MD5_to": "H3", "type": "full", "url": ".."},
                    {"name": "en.pkg", "category": "Language", "language": "en_US", "MD5_to": "H4", "type": "full", "url": ".."},
                    {"name": "fr.pkg", "category": "Language", "language": "fr_FR", "MD5_to": "H5", "type": "full", "url": ".."}
                ]
            }
        }
        
        mock_fetcher = MagicMock()
        mock_fetcher.fetch_manifest_json.return_value = manifest
        
        manager = UpdateManager(".", "http://mock", MagicMock(), fetcher=mock_fetcher)
        
        # Select only GP01 and English
        ops = manager.get_operations(selected_packs=["GP01"], target_language="en_US")
        
        # Should include GP01, Base (dependency), and en.pkg
        files = [op["file"] for op in ops]
        self.assertIn("gp01.pkg", files)
        self.assertIn("base.dll", files)
        self.assertIn("en.pkg", files)
        self.assertNotIn("ep01.pkg", files)
        self.assertNotIn("fr.pkg", files)

    def test_space_calculator(self):
        from update_logic import SpaceCalculator
        ops = [
            {'type': 'download_full', 'size': 1000},
            {'type': 'patch_delta', 'size': 2000, 'patch_size': 200},
            {'type': 'nothing'}
        ]
        
        result = SpaceCalculator.estimate(ops)
        self.assertEqual(result["download_size"], 1200) # 1000 + 200
        self.assertEqual(result["install_size"], 3000) # 1000 + 2000

if __name__ == '__main__':
    unittest.main()
