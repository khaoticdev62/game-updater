import os
import hashlib
import time
import pytest
from engine import VerificationEngine

def test_hash_accuracy(tmp_path):
    content = b"test content for hashing"
    d = tmp_path / "sub"
    d.mkdir()
    p = d / "test.txt"
    p.write_bytes(content)
    
    expected_hash = hashlib.md5(content).hexdigest().upper()
    engine = VerificationEngine()
    assert engine.hash_file(str(p)) == expected_hash

def test_multithreaded_hashing(tmp_path):
    # Create multiple files
    num_files = 10
    file_paths = []
    for i in range(num_files):
        p = tmp_path / f"file_{i}.txt"
        p.write_bytes(f"content {i}".encode())
        file_paths.append(str(p))
        
    engine = VerificationEngine(max_workers=4)
    results_dict = engine.verify_files(file_paths)
    
    assert len(results_dict) == num_files
    # Verify a few
    for i in range(num_files):
        expected = hashlib.md5(f"content {i}".encode()).hexdigest().upper()
        assert results_dict[file_paths[i]] == expected
