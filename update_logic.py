import os
from engine import ManifestParser, VerificationEngine, Version
from download import DownloadQueue
from patch import Patcher

class UpdateManager:
    def __init__(self, game_dir, manifest_json, aria2_manager):
        self.game_dir = game_dir
        self.parser = ManifestParser(manifest_json)
        self.engine = VerificationEngine()
        self.queue = DownloadQueue(aria2_manager)
        self.patcher = Patcher()

    def get_operations(self, progress_callback=None):
        """
        Analyzes local files against manifest and returns list of operations.
        Operations: {'type': 'download'|'patch'|'nothing', 'file': ..., 'reason': ...}
        """
        target_patches = self.parser.get_patches()
        operations = []
        
        # 1. Identify files to check
        file_paths = [os.path.join(self.game_dir, p['name']) for p in target_patches]
        
        # 2. Hash existing files
        existing_files = [p for p in file_paths if os.path.exists(p)]
        
        # Update VerificationEngine to support callbacks if needed, 
        # but for now we'll do a simple loop if callback is provided
        if progress_callback:
            local_hashes = {}
            for i, p in enumerate(existing_files):
                local_hashes[p] = self.engine.hash_file(p)
                progress_callback({
                    'status': 'hashing',
                    'current': i + 1,
                    'total': len(existing_files),
                    'file': os.path.basename(p)
                })
        else:
            local_hashes = self.engine.verify_files(existing_files)
        
        for patch_info in target_patches:
            rel_path = patch_info['name']
            full_path = os.path.join(self.game_dir, rel_path)
            target_md5 = patch_info['MD5_to']
            patch_type = patch_info['type']
            
            current_hash = local_hashes.get(full_path)
            
            if current_hash == target_md5:
                operations.append({'type': 'nothing', 'file': rel_path, 'reason': 'Up to date'})
                continue
                
            if patch_type == 'full':
                operations.append({'type': 'download_full', 'file': rel_path, 'target_md5': target_md5})
            elif patch_type == 'delta':
                # Check if we can apply delta
                source_md5 = patch_info.get('MD5_from')
                if current_hash == source_md5:
                    operations.append({'type': 'patch_delta', 'file': rel_path, 'source_md5': source_md5, 'target_md5': target_md5})
                else:
                    # Fallback to full download if source MD5 doesn't match
                    operations.append({'type': 'download_full', 'file': rel_path, 'reason': 'Source hash mismatch for delta'})
                    
        return operations
