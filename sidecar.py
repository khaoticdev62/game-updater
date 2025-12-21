import sys
import json
import os
from engine import VerificationEngine, ManifestParser
from download import Aria2Manager
from update_logic import UpdateManager

def main():
    aria2 = Aria2Manager()
    
    for line in sys.stdin:
        try:
            request = json.loads(line)
            command = request.get("command")
            req_id = request.get("id")
            
            if command == "ping":
                response = {"id": req_id, "result": "pong"}
                print(json.dumps(response), flush=True)
            elif command == "hash_file":
                path = request.get("path")
                engine = VerificationEngine()
                file_hash = engine.hash_file(path)
                response = {"id": req_id, "result": file_hash}
                print(json.dumps(response), flush=True)
            elif command == "verify_all":
                game_dir = request.get("game_dir")
                manifest_json = request.get("manifest")
                
                manager = UpdateManager(game_dir, manifest_json, aria2)
                
                def on_progress(p):
                    print(json.dumps({"id": req_id, "type": "progress", "data": p}), flush=True)

                ops = manager.get_operations(progress_callback=on_progress)
                response = {"id": req_id, "result": ops}
                print(json.dumps(response), flush=True)
            elif command == "apply_update":
                game_dir = request.get("game_dir")
                manifest_json = request.get("manifest")
                operations = request.get("operations")
                
                manager = UpdateManager(game_dir, manifest_json, aria2)
                
                def on_progress(p):
                    print(json.dumps({"id": req_id, "type": "progress", "data": p}), flush=True)

                success, message = manager.apply_operations(operations, progress_callback=on_progress)
                response = {"id": req_id, "result": {"success": success, "message": message}}
                print(json.dumps(response), flush=True)
            else:
                response = {"id": req_id, "error": f"Unknown command: {command}"}
                print(json.dumps(response), flush=True)
                
        except Exception as e:
            error_response = {"error": str(e)}
            print(json.dumps(error_response), flush=True)

if __name__ == "__main__":
    main()
