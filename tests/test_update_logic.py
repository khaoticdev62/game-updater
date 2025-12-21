import json
import os
import pytest
from update_logic import UpdateManager

class MockAria2:
    pass

def test_get_operations_up_to_date(tmp_path):
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
                {"name": "file1.txt", "MD5_to": file1_hash, "type": "full"}
            ]
        }
    }
    
    manager = UpdateManager(str(game_dir), json.dumps(manifest), MockAria2())
    ops = manager.get_operations()
    assert len(ops) == 1
    assert ops[0]['type'] == 'nothing'

def test_get_operations_requires_download(tmp_path):
    game_dir = tmp_path / "game"
    game_dir.mkdir()
    
    manifest = {
        "version": "1.0",
        "patch": {
            "files": [
                {"name": "missing.txt", "MD5_to": "SOMEHASH", "type": "full"}
            ]
        }
    }
    
    manager = UpdateManager(str(game_dir), json.dumps(manifest), MockAria2())
    ops = manager.get_operations()
    assert ops[0]['type'] == 'download_full'

def test_get_operations_delta_match(tmp_path):
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
                    "type": "delta"
                }
            ]
        }
    }
    
    manager = UpdateManager(str(game_dir), json.dumps(manifest), MockAria2())
    ops = manager.get_operations()
    assert ops[0]['type'] == 'patch_delta'

def test_apply_operations_download_fail(tmp_path):
    class FailAria2:
        def download(self, *args, **kwargs): return False
    
    game_dir = tmp_path / "game"
    game_dir.mkdir()
    manifest = {"version": "1.0", "patch": {"files": []}}
    
    manager = UpdateManager(str(game_dir), json.dumps(manifest), FailAria2())
    ops = [{'type': 'download_full', 'file': 'test.txt', 'target_md5': 'HASH'}]
    
    success, message = manager.apply_operations(ops)
    assert success is False
    assert "downloads failed" in message

def test_apply_operations_success(tmp_path):
    class SuccessAria2:
        def download(self, *args, **kwargs): return True
        def process_all(self, **kwargs): return True
        def clear(self): pass
        def add_task(self, *args, **kwargs): pass

    game_dir = tmp_path / "game"
    game_dir.mkdir()
    manifest = {"version": "1.0", "patch": {"files": []}}
    
    manager = UpdateManager(str(game_dir), json.dumps(manifest), SuccessAria2())
    # Mock some download ops
    ops = [{'type': 'download_full', 'file': 'test.txt', 'target_md5': 'HASH'}]
    
    success, message = manager.apply_operations(ops)
    assert success is True
