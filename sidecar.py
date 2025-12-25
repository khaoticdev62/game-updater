import sys
import json
import os

def main():
    # Signal readiness immediately to the UI
    print(json.dumps({"type": "ready"}), flush=True)
    
    aria2 = None
    
    for line in sys.stdin:
        try:
            request = json.loads(line)
            command = request.get("command")
            req_id = request.get("id")
            
            # --- Command Handlers ---
            if command == "ping":
                response = {"id": req_id, "result": "pong"}
                
            elif command == "hash_file":
                from engine import VerificationEngine
                path = request.get("path")
                engine = VerificationEngine()
                file_hash = engine.hash_file(path)
                response = {"id": req_id, "result": file_hash}
                
            elif command == "verify_all":
                from update_logic import UpdateManager
                from download import Aria2Manager
                if aria2 is None: aria2 = Aria2Manager()
                
                game_dir = request.get("game_dir")
                manifest_url = request.get("manifest_url")
                version = request.get("version")
                selected_packs = request.get("selected_packs")
                language = request.get("language", "en_US")
                
                manager = UpdateManager(game_dir, manifest_url, aria2)
                
                def on_progress(p):
                    print(json.dumps({"id": req_id, "type": "progress", "data": p}), flush=True)

                ops = manager.get_operations(
                    progress_callback=on_progress, 
                    target_version=version,
                    selected_packs=selected_packs,
                    target_language=language
                )
                response = {"id": req_id, "result": ops}
                
            elif command == "start_update": # New command for orchestrated update
                from update_logic import UpdateManager
                from download import Aria2Manager
                if aria2 is None: aria2 = Aria2Manager()

                game_dir = request.get("game_dir")
                manifest_url = request.get("manifest_url")
                version = request.get("version")
                selected_packs = request.get("selected_packs")
                language = request.get("language", "en_US")
                
                manager = UpdateManager(game_dir, manifest_url, aria2)
                
                def on_progress(p):
                    print(json.dumps({"id": req_id, "type": "progress", "data": p}), flush=True)

                # First, get operations
                on_progress({'status': 'fetching_manifest', 'message': 'Fetching manifest...'})
                operations = manager.get_operations(
                    progress_callback=on_progress, 
                    target_version=version,
                    selected_packs=selected_packs,
                    target_language=language
                )
                
                if not operations:
                    response = {"id": req_id, "result": {"success": False, "message": "No operations found or manifest error."}}
                    print(json.dumps(response), flush=True)
                    continue

                # Then, apply operations
                on_progress({'status': 'applying_updates', 'message': 'Applying updates...'})
                success, message = manager.apply_operations(operations, progress_callback=on_progress)
                
                response = {"id": req_id, "result": {"success": success, "message": message}}
                
            elif command == "check_interrupted":
                from update_logic import UpdateManager
                from download import Aria2Manager
                if aria2 is None: aria2 = Aria2Manager()

                game_dir = request.get("game_dir")
                # Using a dummy manifest URL for initialization
                manager = UpdateManager(game_dir, "", aria2)
                response = {"id": req_id, "result": {"interrupted": manager.check_interrupted()}}

            elif command == "run_recovery":
                from update_logic import UpdateManager
                from download import Aria2Manager
                if aria2 is None: aria2 = Aria2Manager()

                game_dir = request.get("game_dir")
                restore_point = request.get("restore_point")
                manager = UpdateManager(game_dir, "", aria2)
                
                success = manager.recovery.run_recovery(restore_point=restore_point)
                
                from doctor import BackendDoctor
                doctor = BackendDoctor()
                diagnostics = doctor.check_all()
                
                response = {"id": req_id, "result": {"success": success, "diagnostics": diagnostics}}

            elif command == "discover_mirrors":
                mirrors = request.get("mirrors", [])
                from discovery import MirrorDiscovery
                discovery = MirrorDiscovery(mirrors)
                import asyncio
                results = asyncio.run(discovery.discover_best_mirrors())
                response = {"id": req_id, "result": results}

            elif command == "select_mirror":
                url = request.get("url")
                from discovery import set_selected_mirror
                set_selected_mirror(url)
                response = {"id": req_id, "result": "success"}

            elif command == "run_mod_guardian":
                game_dir = request.get("game_dir")
                policy = request.get("policy", "selective")
                community_data = request.get("community_data_path")
                
                from mod_guardian import ModGuardian
                from pathlib import Path
                guardian = ModGuardian(Path(game_dir), policy=policy)
                if community_data:
                    guardian.load_community_data(Path(community_data))
                
                count = guardian.run_guardian()
                response = {"id": req_id, "result": {"quarantined": count}}

            elif command == "create_backup":
                game_dir = request.get("game_dir")
                files = request.get("files", [])
                
                from rollback_manager import RollbackManager
                manager = RollbackManager(game_dir)
                zip_name = manager.create_restore_point(files)
                response = {"id": req_id, "result": {"zip_name": zip_name}}

            elif command == "discover_versions":
                url = request.get("url")
                from manifest import VersionScanner
                scanner = VersionScanner()
                versions = scanner.scan_versions(url)
                response = {"id": req_id, "result": versions}

            elif command == "resolve_dlc_dependencies":
                selected = request.get("selected", [])
                dependencies = request.get("dependencies", {})
                from engine import DLCGraph
                graph = DLCGraph()
                for pack, reqs in dependencies.items():
                    for req in reqs:
                        graph.add_dependency(pack, req)
                
                resolved = list(graph.resolve_dependencies(selected))
                response = {"id": req_id, "result": resolved}

            elif command == "get_dlc_status":
                from update_logic import DLCManager
                game_dir = request.get("game_dir")
                manifest_url = request.get("manifest_url")
                
                # We need to fetch the manifest first to pass it to DLCManager
                from manifest import ManifestFetcher
                fetcher = ManifestFetcher(manifest_url)
                manifest_json = fetcher.fetch_manifest_json()
                
                manager = DLCManager(game_dir, json.dumps(manifest_json))
                status = manager.get_dlc_status()
                response = {"id": req_id, "result": status}

            else:
                response = {"id": req_id, "error": f"Unknown command: {command}"}
                
            print(json.dumps(response), flush=True)
                
        except Exception as e:
            error_response = {
                "id": request.get("id", "unknown"), # Use request ID if available
                "error": True,
                "message": str(e),
                "type": e.__class__.__name__
            }
            print(json.dumps(error_response), flush=True)

if __name__ == "__main__":
    main()