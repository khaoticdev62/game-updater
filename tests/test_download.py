import pytest
from download import Aria2Manager

def test_parse_progress_line():
    manager = Aria2Manager()
    # Typical aria2c output line:
    # [#123456 1.2MiB/4.5MiB(26%) CN:1 DL:1.2MiB ETA:2s]
    line = "[#123456 1.2MiB/4.5MiB(26%) CN:1 DL:1.2MiB ETA:2s]"
    progress = manager.parse_progress(line)
    assert progress['percentage'] == 26
    assert progress['speed'] == "1.2MiB"
    assert progress['eta'] == "2s"

def test_parse_progress_line_no_match():
    manager = Aria2Manager()
    line = "Some other output"
    progress = manager.parse_progress(line)
    assert progress is None

def test_manager_init_default_path():
    manager = Aria2Manager()
    # Should have a default or configurable path
    assert manager.aria2_exe is not None
