import sys
import json
import os
from engine import VerificationEngine, ManifestParser
from download import Aria2Manager
from patch import Patcher
from update_logic import UpdateManager
from manifest import ManifestFetcher, URLResolver

def main():
    aria2 = Aria2Manager()
    
    for line in sys.stdin:
        try:
            request = json.loads(line)
            command = request.get("command")
            req_id = request.get("id")
            
            # --- Command Handlers ---
            if command == "ping":
                response = {"id": req_id, "result": "pong"}
                
            elif command == "hash_file":
                path = request.get("path")
                engine = VerificationEngine()
                file_hash = engine.hash_file(path)
                response = {"id": req_id, "result": file_hash}
                
            elif command == "verify_all":
                game_dir = request.get("game_dir")
                manifest_url = request.get("manifest_url")
                
                manager = UpdateManager(game_dir, manifest_url, aria2)
                
                def on_progress(p):
                    print(json.dumps({"id": req_id, "type": "progress", "data": p}), flush=True)

                ops = manager.get_operations(progress_callback=on_progress)
                response = {"id": req_id, "result": ops}
                
            elif command == "start_update": # New command for orchestrated update
                game_dir = request.get("game_dir")
                manifest_url = request.get("manifest_url")
                
                manager = UpdateManager(game_dir, manifest_url, aria2)
                
                def on_progress(p):
                    print(json.dumps({"id": req_id, "type": "progress", "data": p}), flush=True)

                # First, get operations
                on_progress({'status': 'fetching_manifest', 'message': 'Fetching manifest...'})
                operations = manager.get_operations(progress_callback=on_progress)
                
                if not operations:
                    response = {"id": req_id, "result": {"success": False, "message": "No operations found or manifest error."}}
                    print(json.dumps(response), flush=True)
                    continue

                # Then, apply operations
                on_progress({'status': 'applying_updates', 'message': 'Applying updates...'})
                success, message = manager.apply_operations(operations, progress_callback=on_progress)
                
                response = {"id": req_id, "result": {"success": success, "message": message}}
                
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

