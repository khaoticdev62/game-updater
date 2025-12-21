import sys
import json
from engine import VerificationEngine, ManifestParser

def main():
    engine = VerificationEngine()
    
    for line in sys.stdin:
        try:
            request = json.loads(line)
            command = request.get("command")
            req_id = request.get("id")
            
            if command == "ping":
                response = {"id": req_id, "result": "pong"}
            elif command == "hash_file":
                path = request.get("path")
                file_hash = engine.hash_file(path)
                response = {"id": req_id, "result": file_hash}
            else:
                response = {"id": req_id, "error": f"Unknown command: {command}"}
                
            print(json.dumps(response), flush=True)
        except Exception as e:
            error_response = {"error": str(e)}
            print(json.dumps(error_response), flush=True)

if __name__ == "__main__":
    main()
