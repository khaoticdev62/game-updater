import time
import subprocess
import json
import sys
import os

def benchmark():
    start_time = time.time()
    process = subprocess.Popen(
        [sys.executable, "sidecar.py"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )
    
    # Check for immediate ready signal
    first_line = process.stdout.readline()
    try:
        ready_msg = json.loads(first_line)
        if ready_msg.get("type") == "ready":
            ready_time = time.time()
            print(f"Time to 'ready' signal: {(ready_time - start_time) * 1000:.2f} ms")
        else:
            print(f"Unexpected first message: {first_line}")
    except Exception as e:
        print(f"Error parsing ready signal: {e}")

    # Send ping immediately
    process.stdin.write(json.dumps({"command": "ping", "id": "bench"}) + "\n")
    process.stdin.flush()
    
    # Wait for response
    response = process.stdout.readline()
    end_time = time.time()
    
    try:
        data = json.loads(response)
        if data.get("result") == "pong":
            print(f"Total time (Startup + Ping): {(end_time - start_time) * 1000:.2f} ms")
        else:
            print(f"Invalid response: {response}")
    except Exception as e:
        print(f"Error: {e}")
        print(f"Output: {response}")
    
    process.kill()

if __name__ == "__main__":
    benchmark()