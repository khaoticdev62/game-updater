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

    def apply_patch_safe(self, source_file, patch_file, target_md5):
        """
        Applies a patch safely:
        1. Patch to a temporary file.
        2. Verify temporary file MD5.
        3. Replace original file with temporary file.
        """
        temp_file = source_file + ".tmp"
        
        # Apply patch
        success, message = self.apply_xdelta(source_file, patch_file, temp_file)
        if not success:
            if os.path.exists(temp_file):
                os.remove(temp_file)
            return False, f"Patch failed: {message}"
        
        # Verify MD5
        if not self.verify_md5(temp_file, target_md5):
            os.remove(temp_file)
            return False, "MD5 verification failed after patching"
        
        # Swap
        try:
            # On Windows, we might need to remove the source first
            if os.path.exists(source_file):
                os.remove(source_file)
            os.rename(temp_file, source_file)
            return True, "Success"
        except Exception as e:
            if os.path.exists(temp_file):
                os.remove(temp_file)
            return False, f"Failed to replace original file: {str(e)}"
