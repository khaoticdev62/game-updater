import os
import pytest
import hashlib
import subprocess
from patch import Patcher

def test_actual_xdelta_patch(tmp_path):
    xdelta_exe = os.path.join(os.getcwd(), "sims-4-updater-v1.4.7.exe_extracted", "tools", "xdelta3.exe")
    if not os.path.exists(xdelta_exe):
        pytest.skip("xdelta3.exe not found.")

    patcher = Patcher(xdelta_exe=xdelta_exe)
    
    # Create source file
    source_content = b"This is the original content."
    source_file = tmp_path / "original.bin"
    source_file.write_bytes(source_content)
    
    # Create target content
    target_content = b"This is the original content. PLUS NEW STUFF!"
    target_file = tmp_path / "target.bin"
    target_file.write_bytes(target_content)
    target_md5 = hashlib.md5(target_content).hexdigest().upper()
    
    # Create a real patch using the binary
    patch_file = tmp_path / "patch.delta"
    subprocess.run([xdelta_exe, "-e", "-s", str(source_file), str(target_file), str(patch_file)], check=True)
    
    # Now use our patcher to apply it safely
    # First, delete target_file to simulate patching to a new file
    os.remove(target_file)
    
    # We want to patch source_file to its updated state (atomic swap)
    # So we'll pass source_file as the one to be updated.
    # Actually, apply_patch_safe modifies source_file in place (via rename)
    
    success, message = patcher.apply_patch_safe(str(source_file), str(patch_file), target_md5)
    
    assert success is True
    assert source_file.read_bytes() == target_content
