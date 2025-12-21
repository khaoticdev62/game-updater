import pytest
import os
import json
from unittest.mock import MagicMock
from update_logic import UpdateManager
from manifest import ManifestFetcher, URLResolver
from download import Aria2Manager, DownloadQueue
from patch import Patcher
from engine import VerificationEngine

# Mock the external binaries
@pytest.fixture(autouse=True)
def mock_external_binaries(monkeypatch):
    monkeypatch.setattr(Aria2Manager, "_find_aria2", lambda self: "echo") # Mock aria2c
    monkeypatch.setattr(Patcher, "_find_xdelta", lambda self: "echo") # Mock xdelta3

# Mock ManifestFetcher and URLResolver
@pytest.fixture
def mock_fetcher_resolver(tmp_path):
    # Create a mock manifest on disk
    mock_manifest_content = {
        "version": "1.0",
        "dlcs": [],
        "patch": {
            "files": [
                {
                    "name": "file_to_download.txt",
                    "MD5_to": "HASH_DOWNLOAD",
                    "type": "full",
                    "url": "http://mock.com/file_to_download.txt"
                },
                {
                    "name": "file_to_patch.txt",
                    "MD5_from": "HASH_OLD",
                    "MD5_to": "HASH_NEW",
                    "type": "delta",
                    "patch_url": "http://mock.com/patch_file.delta",
                    "url": "http://mock.com/file_to_patch_full_fallback.txt" # Fallback URL
                }
            ]
        }
    }
    manifest_path = tmp_path / "manifest.json"
    manifest_path.write_text(json.dumps(mock_manifest_content))
    
    # Mock ManifestFetcher
    mock_fetcher = MagicMock(spec=ManifestFetcher)
    mock_fetcher.fetch_manifest_json.return_value = mock_manifest_content
    
    # Mock URLResolver
    mock_resolver = MagicMock(spec=URLResolver)
    mock_resolver.resolve_url.side_effect = lambda url: url # Just return original URL
    
    return mock_fetcher, mock_resolver

def test_full_update_workflow_success(tmp_path, mock_fetcher_resolver):
    mock_fetcher, mock_resolver = mock_fetcher_resolver
    
    game_dir = tmp_path / "game"
    game_dir.mkdir()
    
    # Create file for patching
    (game_dir / "file_to_patch.txt").write_text("old content")
    
    # Mock UpdateManager.engine.verify_files to return specific hashes
    mock_verification_engine = MagicMock(spec=VerificationEngine)
    mock_verification_engine.verify_files.return_value = {
        str(game_dir / "file_to_patch.txt"): "HASH_OLD"
    }
    mock_verification_engine.hash_file.side_effect = lambda p: "HASH_OLD" if p == str(game_dir / "file_to_patch.txt") else None
    
    # Setup mocks for Aria2Manager and Patcher
    mock_aria2_manager_client = MagicMock(spec=Aria2Manager)
    mock_aria2_manager_client.download.return_value = True # Simulate successful download

    # Mock the DownloadQueue behavior directly on manager.queue
    class MockDownloadQueue(DownloadQueue):
        def __init__(self, manager):
            super().__init__(manager)
            self.add_task = MagicMock()
            self.clear = MagicMock()
            def mock_process_all(callback=None):
                if callback:
                    callback({'percentage': 100, 'speed': '1M', 'eta': '0s'})
                return True
            self.process_all = MagicMock(side_effect=mock_process_all)
    
    mock_patcher = MagicMock(spec=Patcher)
    mock_patcher.apply_patch_safe.return_value = (True, "Success") # Simulate successful patch
    
    # Override UpdateManager internals with mocks
    class MockedUpdateManager(UpdateManager):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self.fetcher = mock_fetcher
            self.resolver = mock_resolver
            self.aria2_client = mock_aria2_manager_client # Use the mocked client
            self.queue = MockDownloadQueue(self.aria2_client) # Use our mocked queue
            self.patcher = mock_patcher
            self.engine = mock_verification_engine # Use mocked engine

    # Test the orchestrator (start_update command in sidecar)
    # We'll simulate the sidecar call by creating a manager and calling its methods
    # directly for testing purposes.
    # The actual sidecar receives manifest_url, not manifest_json
    manager = MockedUpdateManager(str(game_dir), "http://mock.com/manifest.json", mock_aria2_manager_client)
    
    progress_updates = []
    def on_progress(p):
        progress_updates.append(p)
        print(f"Progress: {p}")

    # Simulate get_operations
    operations = manager.get_operations(on_progress)
    
    assert len(operations) == 2
    assert operations[0]['type'] == 'download_full'
    assert operations[1]['type'] == 'patch_delta'
    
    # Simulate apply_operations
    success, message = manager.apply_operations(operations, on_progress)
    
    assert success is True
    assert "completed successfully" in message
    
    # Verify calls to mocks
    mock_fetcher.fetch_manifest_json.assert_called_once()
    assert mock_resolver.resolve_url.call_count == 2 # one for download, one for patch
    manager.queue.add_task.assert_called_once()
    manager.queue.process_all.assert_called_once()
    mock_patcher.apply_patch_safe.assert_called_once()
    
    # Check progress updates
    assert any(p['status'] == 'fetching_manifest' for p in progress_updates)
    assert any(p['status'] == 'hashing' for p in progress_updates)
    assert any(p['status'] == 'downloading' for p in progress_updates)
    assert any(p['status'] == 'patching' for p in progress_updates)