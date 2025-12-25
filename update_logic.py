import os
import json
from pathlib import Path
from typing import Optional, List, Set
from engine import ManifestParser, VerificationEngine, Version, DLCGraph
from download import DownloadQueue
from patch import Patcher
from manifest import ManifestFetcher, URLResolver
from janitor import OperationLogger, RecoveryOrchestrator
from paths import get_app_data_path

class UpdateManager:
    def __init__(self, game_dir, manifest_url, aria2_manager, fetcher=None, resolver=None):
        self.game_dir = Path(game_dir)
        self.fetcher = fetcher or ManifestFetcher(manifest_url)
        self.resolver = resolver or URLResolver()
        self.parser = None # Will be initialized after fetching manifest
        self.engine = VerificationEngine()
        self.queue = DownloadQueue(aria2_manager)
        self.patcher = Patcher()
        self.graph = DLCGraph()
        
        # Professional Alignment: Resilience Components
        app_data = get_app_data_path()
        self.op_logger = OperationLogger(app_data / "operations.json")
        self.recovery = RecoveryOrchestrator(self.game_dir)
        self.lock_file = self.game_dir / "update.lock"

    def check_interrupted(self) -> bool:
        """Checks if a previous update session was interrupted."""
        return self.lock_file.exists()

    def get_operations(self, progress_callback=None, target_version: Optional[str] = None, selected_packs: Optional[List[str]] = None, target_language: str = "en_US"):
        """
        Analyzes local files against manifest and returns list of operations.
        Filtering logic included for selective DLC installation.
        """
        # Fetch manifest first
        try:
            if progress_callback:
                progress_callback({'status': 'fetching_manifest'})
            manifest_json = self.fetcher.fetch_manifest_json(version=target_version)
            self.parser = ManifestParser(json.dumps(manifest_json))
        except Exception as e:
            if progress_callback:
                progress_callback({'status': 'error', 'message': f"Failed to fetch or parse manifest: {e}"})
            return []
        
        # 1. Resolve Dependencies
        # If no selection, assume 'Base' only for safety, or 'All' if logic dictates.
        # For this professional alignment, we'll default to All if selected_packs is None.
        all_available_packs = set()
        for p in self.parser.get_patches():
            if 'pack_id' in p: all_available_packs.add(p['pack_id'])
        
        effective_selection: Set[str] = set()
        if selected_packs is None:
            effective_selection = all_available_packs | {"Base"}
        else:
            # Always include Base
            effective_selection = set(selected_packs) | {"Base"}

        # Build graph from manifest
        deps = self.parser.get_dependencies()
        for pack, reqs in deps.items():
            for req in reqs:
                self.graph.add_dependency(pack, req)
        
        # Resolve transitive dependencies
        final_selection = self.graph.resolve_dependencies(list(effective_selection))
        
        target_patches = self.parser.get_patches()
        filtered_patches = []
        
        # 2. Filter patches based on selection and language
        for p in target_patches:
            category = p.get("category", "Base")
            pack_id = p.get("pack_id", "Base")
            
            # Skip if not in selection
            if pack_id not in final_selection:
                continue
                
            # Language handling: only include target language package
            if category == "Language":
                lang_code = p.get("language")
                if lang_code and lang_code != target_language:
                    continue
            
            filtered_patches.append(p)

        operations = []
        
        # 3. Identify files to check
        file_paths = [os.path.join(self.game_dir, p['name']) for p in filtered_patches]
        
        # 4. Hash existing files
        existing_files = [p for p in file_paths if os.path.exists(p)]
        
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
        
        for patch_info in filtered_patches:
            rel_path = patch_info['name']
            full_path = os.path.join(self.game_dir, rel_path)
            target_md5 = patch_info['MD5_to']
            patch_type = patch_info['type']
            
            current_hash = local_hashes.get(full_path)
            
            if current_hash == target_md5:
                operations.append({'type': 'nothing', 'file': rel_path, 'reason': 'Up to date'})
                continue
                
            if patch_type == 'full':
                download_url = self.resolver.resolve_url(patch_info['url'])
                operations.append({'type': 'download_full', 'file': rel_path, 'target_md5': target_md5, 'url': download_url})
            elif patch_type == 'delta':
                source_md5 = patch_info.get('MD5_from')
                if current_hash == source_md5:
                    patch_url = self.resolver.resolve_url(patch_info['patch_url'])
                    operations.append({'type': 'patch_delta', 'file': rel_path, 'source_md5': source_md5, 'target_md5': target_md5, 'patch_url': patch_url})
                else:
                    download_url = self.resolver.resolve_url(patch_info['url'])
                    operations.append({'type': 'download_full', 'file': rel_path, 'reason': 'Source hash mismatch for delta', 'url': download_url})
                    
        return operations

    def apply_operations(self, operations, progress_callback=None):
        """
        Executes the provided operations with resilience (lock file + logging).
        """
        # Create session lock
        self.lock_file.touch()
        self.op_logger.clear_log()

        # 1. Handle full downloads
        download_tasks = [op for op in operations if op['type'] == 'download_full']
        if download_tasks:
            self.queue.clear()
            for i, task in enumerate(download_tasks):
                url = task['url']
                self.queue.add_task(url, self.game_dir, filename=task['file'])
                self.op_logger.log_operation(f"dl_{i}", task)
            
            def dl_callback(p):
                if progress_callback:
                    progress_callback({'status': 'downloading', **p})

            success = self.queue.process_all(callback=dl_callback)
            if not success:
                return False, "Some downloads failed"
            
            # Mark all downloads as completed in log
            for i in range(len(download_tasks)):
                self.op_logger.update_status(f"dl_{i}", "completed")

        # 2. Handle patches
        patch_tasks = [op for op in operations if op['type'] == 'patch_delta']
        for i, task in enumerate(patch_tasks):
            rel_path = task['file']
            full_path = os.path.join(self.game_dir, rel_path)
            self.op_logger.log_operation(f"patch_{i}", task)
            
            # In a real scenario, patch_file would be downloaded to a temp dir
            patch_file = os.path.join(self.game_dir, rel_path + ".delta") 
            
            if progress_callback:
                progress_callback({
                    'status': 'patching',
                    'current': i + 1,
                    'total': len(patch_tasks),
                    'file': rel_path
                })

            success, message = self.patcher.apply_patch_safe(full_path, patch_file, task['target_md5'])
            if not success:
                return False, f"Patching failed for {rel_path}: {message}"
            
            self.op_logger.update_status(f"patch_{i}", "completed")

        # Successful completion: cleanup
        if self.lock_file.exists():
            self.lock_file.unlink()
        self.op_logger.clear_log()

        return True, "All operations completed successfully"

class SpaceCalculator:
    """
    Estimates disk space requirements for an update session.
    """
    @staticmethod
    def estimate(operations: List[dict]) -> dict:
        """
        Returns {download_size: int, install_size: int} in bytes.
        """
        dl_size = 0
        install_size = 0
        
        for op in operations:
            if op['type'] == 'nothing':
                continue
            
            # These sizes should ideally be in the operation data from manifest
            # For now, we'll assume some placeholder sizes or look for 'size' key
            size = op.get('size', 0)
            if op['type'] == 'download_full':
                dl_size += size
                install_size += size
            elif op['type'] == 'patch_delta':
                dl_size += op.get('patch_size', size // 10) # Delta is usually smaller
                install_size += size # After patch, it takes full size
                
        return {
            "download_size": dl_size,
            "install_size": install_size
        }

    @staticmethod
    def has_enough_space(path: Path, required_bytes: int) -> bool:
        import shutil
        usage = shutil.disk_usage(str(path))
        return usage.free > required_bytes

class DLCManager:
    def __init__(self, game_dir, manifest_json):
        self.game_dir = game_dir
        self.data = json.loads(manifest_json)

    def get_dlc_status(self):
        """
        Returns a list of DLCs and their status.
        Status: 'Installed', 'Missing', 'Update Available'
        """
        # Original manifest has a 'links' section or similar for DLCs
        # Let's assume a 'dlcs' key for clarity in our new implementation
        available_dlcs = self.data.get("dlcs", [])
        status_list = []

        for dlc in available_dlcs:
            folder_name = dlc.get("folder")
            dlc_name = dlc.get("name")
            full_path = os.path.join(self.game_dir, folder_name) if folder_name else None
            
            if not full_path or not os.path.exists(full_path):
                status = "Missing"
            else:
                # Basic check for now, can be improved with version checking
                status = "Installed"
            
            status_list.append({
                "name": dlc_name,
                "folder": folder_name,
                "status": status
            })
            
        return status_list
