import json
import os
import pytest
from unittest.mock import MagicMock
from update_logic import UpdateManager
from manifest import ManifestFetcher, URLResolver
from download import DownloadQueue

class MockAria2:
    pass

@pytest.fixture
def mock_fetcher():
    return MagicMock(spec=ManifestFetcher)

@pytest.fixture
def mock_resolver():
    resolver = MagicMock(spec=URLResolver)
    resolver.resolve_url.side_effect = lambda url: f"resolved_{url}"
    return resolver

def test_get_operations_up_to_date(tmp_path, mock_fetcher, mock_resolver):
    game_dir = tmp_path / "game"
    game_dir.mkdir()
    file1 = game_dir / "file1.txt"
    file1.write_bytes(b"content")
    import hashlib
    file1_hash = hashlib.md5(b"content").hexdigest().upper()
    
    manifest = {
        "version": "1.0",
        "patch": {
            "files": [
                {"name": "file1.txt", "MD5_to": file1_hash, "type": "full", "url": "http://example.com/file1.txt"}
            ]
        }
    }
    mock_fetcher.fetch_manifest_json.return_value = manifest
    
    manager = UpdateManager(str(game_dir), "http://manifest", MockAria2(), fetcher=mock_fetcher, resolver=mock_resolver)
    ops = manager.get_operations()
    assert len(ops) == 1
    assert ops[0]['type'] == 'nothing'

def test_get_operations_requires_download(tmp_path, mock_fetcher, mock_resolver):
    game_dir = tmp_path / "game"
    game_dir.mkdir()
    
    manifest = {
        "version": "1.0",
        "patch": {
            "files": [
                {"name": "missing.txt", "MD5_to": "SOMEHASH", "type": "full", "url": "http://example.com/missing.txt"}
            ]
        }
    }
    mock_fetcher.fetch_manifest_json.return_value = manifest
    
    manager = UpdateManager(str(game_dir), "http://manifest", MockAria2(), fetcher=mock_fetcher, resolver=mock_resolver)
    ops = manager.get_operations()
    assert ops[0]['type'] == 'download_full'
    assert ops[0]['url'] == 'resolved_http://example.com/missing.txt'

def test_get_operations_delta_match(tmp_path, mock_fetcher, mock_resolver):
    game_dir = tmp_path / "game"
    game_dir.mkdir()
    file1 = game_dir / "patchable.txt"
    file1.write_bytes(b"old content")
    import hashlib
    old_hash = hashlib.md5(b"old content").hexdigest().upper()
    
    manifest = {
        "version": "1.1",
        "patch": {
            "files": [
                {
                    "name": "patchable.txt", 
                    "MD5_from": old_hash, 
                    "MD5_to": "NEWHASH", 
                    "type": "delta",
                    "url": "http://example.com/full",
                    "patch_url": "http://example.com/patch"
                }
            ]
        }
    }
    mock_fetcher.fetch_manifest_json.return_value = manifest
    
    manager = UpdateManager(str(game_dir), "http://manifest", MockAria2(), fetcher=mock_fetcher, resolver=mock_resolver)
    ops = manager.get_operations()
    assert ops[0]['type'] == 'patch_delta'
    assert ops[0]['patch_url'] == 'resolved_http://example.com/patch'

def test_apply_operations_download_fail(tmp_path, mock_fetcher, mock_resolver):
    # Mock DownloadQueue instead of Aria2 directly, as UpdateManager uses queue.process_all
    mock_queue = MagicMock(spec=DownloadQueue)
    mock_queue.process_all.return_value = False

    game_dir = tmp_path / "game"
    game_dir.mkdir()
    
    manager = UpdateManager(str(game_dir), "http://manifest", MockAria2(), fetcher=mock_fetcher, resolver=mock_resolver)
    manager.queue = mock_queue # Inject mock queue

    ops = [{'type': 'download_full', 'file': 'test.txt', 'target_md5': 'HASH', 'url': 'http://dl.com'}]
    
    success, message = manager.apply_operations(ops)
    assert success is False
    assert "downloads failed" in message

def test_apply_operations_success(tmp_path, mock_fetcher, mock_resolver):
    mock_queue = MagicMock(spec=DownloadQueue)
    mock_queue.process_all.return_value = True

    game_dir = tmp_path / "game"
    game_dir.mkdir()
    
    manager = UpdateManager(str(game_dir), "http://manifest", MockAria2(), fetcher=mock_fetcher, resolver=mock_resolver)
    manager.queue = mock_queue # Inject mock queue

    # Mock some download ops
    ops = [{'type': 'download_full', 'file': 'test.txt', 'target_md5': 'HASH', 'url': 'http://dl.com'}]
    
    success, message = manager.apply_operations(ops)
    assert success is True