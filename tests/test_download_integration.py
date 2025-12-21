import os
import pytest
from download import Aria2Manager

def test_actual_download(tmp_path):
    # Ensure aria2c exists
    aria2_path = os.path.join(os.getcwd(), "sims-4-updater-v1.4.7.exe_extracted", "tools", "aria2c.exe")
    if not os.path.exists(aria2_path):
        pytest.skip("aria2c.exe not found in extracted tools.")

    manager = Aria2Manager(aria2_exe=aria2_path)
    test_url = "https://raw.githubusercontent.com/extremecoders-re/pyinstxtractor/master/pyinstxtractor.py"
    output_dir = str(tmp_path)
    filename = "downloaded_test.py"
    
    progress_updates = []
    def callback(p):
        progress_updates.append(p)
        print(f"Callback received: {p}")

    success = manager.download(test_url, output_dir, filename=filename, callback=callback)
    
    assert success is True
    assert os.path.exists(os.path.join(output_dir, filename))
    # Note: for very small files, aria2c might not output progress lines
    # but we should at least check if it works if they ARE present.
    if len(progress_updates) > 0:
        assert 'percentage' in progress_updates[0]
        assert 'speed' in progress_updates[0]
