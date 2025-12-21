import os
import hashlib
import time
import pytest
from concurrent.futures import ThreadPoolExecutor

# We will implement this in the engine
def hash_file(file_path):
    hasher = hashlib.md5()
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hasher.update(chunk)
    return hasher.hexdigest().upper()

def test_hash_accuracy(tmp_path):
    content = b"test content for hashing"
    d = tmp_path / "sub"
    d.mkdir()
    p = d / "test.txt"
    p.write_bytes(content)
    
    expected_hash = hashlib.md5(content).hexdigest().upper()
    assert hash_file(str(p)) == expected_hash

def test_multithreaded_hashing(tmp_path):
    # Create multiple files
    num_files = 10
    file_paths = []
    for i in range(num_files):
        p = tmp_path / f"file_{i}.txt"
        p.write_bytes(f"content {i}".encode())
        file_paths.append(str(p))
        
    start_time = time.time()
    with ThreadPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(hash_file, file_paths))
    end_time = time.time()
    
    assert len(results) == num_files
    # Verify a few
    for i in range(num_files):
        expected = hashlib.md5(f"content {i}".encode()).hexdigest().upper()
        assert results[i] == expected
