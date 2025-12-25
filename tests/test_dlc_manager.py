import json
import os
import pytest
from update_logic import DLCManager

def test_dlc_status_installed(tmp_path):
    game_dir = tmp_path / "game"
    game_dir.mkdir()
    dlc_folder = game_dir / "EP01"
    dlc_folder.mkdir()
    
    manifest = {
        "dlcs": [
            {"name": "Get to Work", "folder": "EP01"}
        ]
    }
    
    manager = DLCManager(str(game_dir), json.dumps(manifest))
    status = manager.get_dlc_status()
    assert len(status) == 1
    assert status[0]['name'] == "Get to Work"
    assert status[0]['status'] == "Installed"

def test_dlc_status_missing(tmp_path):
    game_dir = tmp_path / "game"
    game_dir.mkdir()
    
    manifest = {
        "dlcs": [
            {"name": "Get to Work", "folder": "EP01"}
        ]
    }
    
    manager = DLCManager(str(game_dir), json.dumps(manifest))
    status = manager.get_dlc_status()
    assert status[0]['status'] == "Missing"

def test_dlc_status_multiple(tmp_path):
    game_dir = tmp_path / "game"
    game_dir.mkdir()
    (game_dir / "EP01").mkdir()
    
    manifest = {
        "dlcs": [
            {"name": "EP01", "folder": "EP01"},
            {"name": "EP02", "folder": "EP02"}
        ]
    }
    
    manager = DLCManager(str(game_dir), json.dumps(manifest))
    status = manager.get_dlc_status()
    assert len(status) == 2
    assert status[0]['status'] == "Installed"
    assert status[1]['status'] == "Missing"

def test_dlc_status_with_rich_metadata(tmp_path):
    game_dir = tmp_path / "game"
    game_dir.mkdir()
    
    manifest = {
        "dlcs": [
            {"name": "Get to Work", "folder": "EP01"}
        ]
    }
    
    manager = DLCManager(str(game_dir), json.dumps(manifest))
    status = manager.get_dlc_status()
    
    # We expect EP01 to have metadata from content_db
    ep01_status = next(s for s in status if s['folder'] == "EP01")
    assert "description" in ep01_status
    assert "release_date" in ep01_status
    assert "Rule the workplace" in ep01_status["description"]
