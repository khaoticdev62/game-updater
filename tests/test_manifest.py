import json
import pytest
from engine import ManifestParser

def test_parse_valid_manifest():
    manifest_data = {
        "version": "1.103.315.1020",
        "patch": {
            "files": [
                {
                    "name": "Game/Bin/TS4_x64.exe",
                    "version": "1.103.315.1020",
                    "MD5_to": "HASH1",
                    "type": "full"
                },
                {
                    "name": "Game/Bin/other.dll",
                    "version": "1.103.315.1020",
                    "version_from": "1.102.190.1020",
                    "MD5_to": "HASH2",
                    "MD5_from": "HASH3",
                    "type": "delta"
                }
            ]
        }
    }
    parser = ManifestParser(json.dumps(manifest_data))
    assert parser.get_target_version() == "1.103.315.1020"
    patches = parser.get_patches()
    assert len(patches) == 2
    assert patches[0]['name'] == "Game/Bin/TS4_x64.exe"
    assert patches[0]['type'] == "full"
    assert patches[1]['type'] == "delta"

def test_parse_malformed_json():
    with pytest.raises(ValueError):
        ManifestParser("not json")

def test_parse_missing_keys():
    manifest_data = {"something": "else"}
    parser = ManifestParser(json.dumps(manifest_data))
    assert parser.get_target_version() is None
    assert parser.get_patches() == []