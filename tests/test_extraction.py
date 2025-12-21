import os
import pytest

def test_extraction_output_exists():
    # After extraction, we expect a directory with the extracted content
    extraction_dir = "sims-4-updater-v1.4.7.exe_extracted"
    assert os.path.exists(extraction_dir), f"Extraction directory {extraction_dir} not found."
    
    # We also expect some entry point or main script
    # For PyInstaller apps, there's usually a TOC or a main script
    # We'll refine this once we know the exact output
    files = os.listdir(extraction_dir)
    assert len(files) > 0, "Extraction directory is empty."
