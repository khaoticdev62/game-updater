import re
import os
import subprocess

class Aria2Manager:
    def __init__(self, aria2_exe=None):
        self.aria2_exe = aria2_exe or self._find_aria2()

    def _find_aria2(self):
        # Default path from extraction
        extracted_tools = os.path.join(os.getcwd(), "sims-4-updater-v1.4.7.exe_extracted", "tools", "aria2c.exe")
        if os.path.exists(extracted_tools):
            return extracted_tools
        return "aria2c" # Fallback to path

    def parse_progress(self, line):
        """
        Parses a line of aria2c output.
        Example: [#123456 1.2MiB/4.5MiB(26%) CN:1 DL:1.2MiB ETA:2s]
        """
        # Regex to capture percentage, download speed, and ETA
        # Pattern: (PERCENT%) ... DL:SPEED ... ETA:TIME
        pattern = r"\((?P<percent>\d+)%\).*?DL:(?P<speed>[^\]\s]+).*?ETA:(?P<eta>[^\]\s]+)"
        match = re.search(pattern, line)
        if match:
            return {
                'percentage': int(match.group('percent')),
                'speed': match.group('speed'),
                'eta': match.group('eta')
            }
        return None

    def download(self, url, output_dir, filename=None, callback=None):
        """
        Spawns aria2c to download a file.
        """
        args = [self.aria2_exe, url, "--dir", output_dir]
        if filename:
            args.extend(["--out", filename])
        
        # Additional recommended flags
        args.extend(["--console-log-level=info", "--summary-interval=1"])

        process = subprocess.Popen(
            args,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )

        for line in process.stdout:
            progress = self.parse_progress(line)
            if progress and callback:
                callback(progress)
        
        process.wait()
        return process.returncode == 0

class DownloadQueue:
    def __init__(self, manager):
        self.manager = manager
        self.tasks = []

    def add_task(self, url, output_dir, filename=None):
        self.tasks.append({
            'url': url,
            'output_dir': output_dir,
            'filename': filename
        })

    def clear(self):
        self.tasks = []

    def process_all(self, callback=None):
        """Processes all tasks in the queue."""
        results = []
        for task in self.tasks:
            success = self.manager.download(
                task['url'],
                task['output_dir'],
                filename=task['filename'],
                callback=callback
            )
            results.append(success)
        return all(results)
