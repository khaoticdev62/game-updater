import unittest
import asyncio
from unittest.mock import AsyncMock, patch
from discovery import MirrorDiscovery, set_selected_mirror, get_selected_mirror

class TestMirrorDiscovery(unittest.TestCase):
    def setUp(self):
        self.mirrors = [
            {"url": "http://mirror1.com", "weight": 10},
            {"url": "http://mirror2.com", "weight": 5},
            {"url": "http://mirror3.com", "weight": 1}
        ]
        self.discovery = MirrorDiscovery(self.mirrors)

    def test_weighted_sorting(self):
        # Higher weight should come first
        sorted_mirrors = self.discovery.get_weighted_mirrors()
        self.assertEqual(sorted_mirrors[0]["url"], "http://mirror1.com")
        self.assertEqual(sorted_mirrors[-1]["url"], "http://mirror3.com")

    @patch('httpx.AsyncClient.head')
    def test_parallel_probing(self, mock_head):
        # Mock responses
        async def side_effect(url, **kwargs):
            mock = AsyncMock()
            if "mirror1" in url:
                mock.status_code = 200
            elif "mirror2" in url:
                mock.status_code = 404
            else:
                mock.status_code = 200
            return mock
            
        mock_head.side_effect = side_effect
        
        results = asyncio.run(self.discovery.discover_best_mirrors())
        
        self.assertEqual(len(results), 3)
        # Mirror 1 should be first (Available + High Weight)
        self.assertEqual(results[0]["url"], "http://mirror1.com")
        
    def test_global_selection(self):
        set_selected_mirror("http://custom.mirror")
        self.assertEqual(get_selected_mirror(), "http://custom.mirror")
        set_selected_mirror(None)
        self.assertIsNone(get_selected_mirror())

if __name__ == '__main__':
    unittest.main()
