import os
import hashlib
import subprocess

class Patcher:
    def __init__(self, xdelta_exe=None):
        self.xdelta_exe = xdelta_exe or self._find_xdelta()

    def _find_xdelta(self):
        extracted_tools = os.path.join(os.getcwd(), "sims-4-updater-v1.4.7.exe_extracted", "tools", "xdelta3.exe")
        if os.path.exists(extracted_tools):
            return extracted_tools
        return "xdelta3"

    @staticmethod
    def verify_md5(file_path, expected_md5):
        if not os.path.exists(file_path):
            return False
        
        hasher = hashlib.md5()
        try:
            with open(file_path, 'rb') as f:
                for chunk in iter(lambda: f.read(8192), b""):
                    hasher.update(chunk)
            return hasher.hexdigest().upper() == expected_md5.upper()
        except Exception:
            return False

    def apply_xdelta(self, source_file, patch_file, target_file):
        """
        Applies an xdelta3 patch.
        Command: xdelta3.exe -d -s <source_file> <patch_file> <target_file>
        """
        if not os.path.exists(source_file):
            return False, f"Source file missing: {source_file}"
        if not os.path.exists(patch_file):
            return False, f"Patch file missing: {patch_file}"

        args = [self.xdelta_exe, "-d", "-s", source_file, patch_file, target_file]
        
        try:
            result = subprocess.run(
                args,
                capture_output=True,
                text=True,
                check=True
            )
            return True, "Success"
        except subprocess.CalledProcessError as e:
            return False, e.stderr
        except Exception as e:
            return False, str(e)
