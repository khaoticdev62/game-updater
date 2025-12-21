import hashlib
import os
from concurrent.futures import ThreadPoolExecutor

class VerificationEngine:
    def __init__(self, max_workers=None):
        self.max_workers = max_workers or os.cpu_count()

    @staticmethod
    def hash_file(file_path):
        """Calculates MD5 hash of a file."""
        hasher = hashlib.md5()
        try:
            with open(file_path, 'rb') as f:
                for chunk in iter(lambda: f.read(8192), b""):
                    hasher.update(chunk)
            return hasher.hexdigest().upper()
        except Exception:
            return None

    def verify_files(self, file_paths):
        """Verifies multiple files using multi-threading."""
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # Map returns results in the same order as input
            results = list(executor.map(self.hash_file, file_paths))
        
        # Return a dictionary of path -> hash
        return dict(zip(file_paths, results))
