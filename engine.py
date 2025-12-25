import hashlib
import os
import json
from concurrent.futures import ThreadPoolExecutor

class VerificationEngine:
    def __init__(self, max_workers=None):
        self.max_workers = max_workers or os.cpu_count()

    @staticmethod
    def hash_file(file_path):
        """Calculates MD5 hash of a file using optimized file_digest."""
        try:
            with open(file_path, 'rb') as f:
                return hashlib.file_digest(f, "md5").hexdigest().upper()
        except Exception:
            return None

    def verify_files(self, file_paths):
        """Verifies multiple files using multi-threading."""
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # Map returns results in the same order as input
            results = list(executor.map(self.hash_file, file_paths))
        
        # Return a dictionary of path -> hash
        return dict(zip(file_paths, results))

class ManifestParser:
    def __init__(self, json_data):
        self.data = json.loads(json_data)

    def get_target_version(self):
        return self.data.get("version")

    def get_patches(self):
        patch_section = self.data.get("patch", {})
        return patch_section.get("files", [])

class Version:
    def __init__(self, version_str):
        self.parts = [int(x) for x in version_str.split('.')]

    def __lt__(self, other):
        return self.parts < other.parts

    def __eq__(self, other):
        return self.parts == other.parts

    def __str__(self):
        return '.'.join(map(str, self.parts))
