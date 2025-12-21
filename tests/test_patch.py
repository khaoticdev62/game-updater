import os
import pytest
import hashlib
from patch import Patcher

def test_verify_md5(tmp_path):
    p = tmp_path / "test.txt"
    content = b"hello world"
    p.write_bytes(content)
    expected_md5 = hashlib.md5(content).hexdigest().upper()
    
    patcher = Patcher()
    assert patcher.verify_md5(str(p), expected_md5) is True
    assert patcher.verify_md5(str(p), "WRONGHASH") is False

def test_verify_md5_missing_file():
    patcher = Patcher()
    assert patcher.verify_md5("non_existent_file", "ANYHASH") is False

# More tests will be added once xdelta3 wrapper is implemented
