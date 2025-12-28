# Critical Error Handling Findings
## feature/bugfix_plan_20251221 Branch Audit

---

## CRITICAL FINDING #1: Sidecar Process Main Loop Exception Handling

**File:** `/c/Users/thecr/Desktop/sims_4_updater_v2/sidecar.py`
**Lines:** 180 (outer exception handler)
**Severity:** CRITICAL

### The Problem
```python
except Exception as e:
    error_response = {
        "id": request.get("id", "unknown"),
        "error": True,
        "message": str(e),
        "type": e.__class__.__name__
    }
    print(json.dumps(error_response), flush=True)
```

This single catch block catches EVERYTHING - legitimate exceptions, programming errors, system errors. Users receive cryptic error strings like:
- `"'NoneType' object has no attribute 'fetch_manifest_json'"`
- `"No module named 'download'"`
- `"list index out of range"`

### What Gets Hidden
When manifest fetch fails with network timeout, user sees: `"HTTPError: 504 Bad Gateway"`
When module import fails, user sees: `"No module named 'update_logic'"`

### The Fix Required
**Before merging, implement specific exception handlers:**

1. Import errors should fail fast (don't recover, restart sidecar)
2. Network errors should provide actionable messages
3. File errors should distinguish between "missing" and "cannot access"
4. JSON errors should indicate invalid format
5. All errors must be logged with context

---

## CRITICAL FINDING #2: Hash File Silent Failure

**File:** `/c/Users/thecr/Desktop/sims_4_updater_v2/engine.py`
**Lines:** 13-16
**Severity:** CRITICAL

### The Problem
```python
@staticmethod
def hash_file(file_path):
    try:
        with open(file_path, 'rb') as f:
            return hashlib.file_digest(f, "md5").hexdigest().upper()
    except Exception:
        return None
```

When ANY error occurs, it returns None. This is called from verify_files() which treats None as "hash doesn't match, must re-download".

### Real-World Failure Scenario
1. Game file is corrupted (bad sectors on disk)
2. `hashlib.file_digest()` raises IOError
3. Returns None
4. Game thinks file is missing
5. Re-downloads entire game file
6. User loses 50GB+ and 2+ hours

The actual problem (file corruption) is never reported.

### The Fix Required
```python
@staticmethod
def hash_file(file_path):
    try:
        with open(file_path, 'rb') as f:
            return hashlib.file_digest(f, "md5").hexdigest().upper()
    except FileNotFoundError:
        return None  # OK - file doesn't exist
    except PermissionError as e:
        raise ValueError(f"Cannot read {file_path}: Permission denied")
    except IOError as e:
        raise ValueError(f"I/O error reading {file_path}: {str(e)}")
```

---

## CRITICAL FINDING #3: Update Operations Silent Empty Return

**File:** `/c/Users/thecr/Desktop/sims_4_updater_v2/update_logic.py`
**Lines:** 46-70
**Severity:** CRITICAL

### The Problem
```python
def get_operations(self, progress_callback=None, target_version: Optional[str] = None, ...):
    try:
        if progress_callback:
            progress_callback({'status': 'fetching_manifest'})
        manifest_json = self.fetcher.fetch_manifest_json(version=target_version)
        self.parser = ManifestParser(json.dumps(manifest_json))
    except Exception as e:
        if progress_callback:
            progress_callback({'status': 'error', 'message': f"Failed to fetch or parse manifest: {e}"})
        return []
```

When manifest fails:
1. Returns empty list `[]`
2. Caller cannot tell if "no updates" or "error occurred"
3. UI shows success message
4. No error logged anywhere
5. Error message only sent if callback exists (not always)

### The Failure Chain
1. User clicks "Update"
2. Manifest fetch times out
3. Empty operations list returned
4. `apply_operations([])` completes successfully
5. UI says "Update complete"
6. Game was never actually updated

### The Fix Required
Don't catch exceptions. Let them propagate. The caller must know an error occurred.

```python
def get_operations(self, ...):
    if progress_callback:
        progress_callback({'status': 'fetching_manifest'})

    # Let exceptions propagate - don't catch them here
    manifest_json = self.fetcher.fetch_manifest_json(version=target_version)
    self.parser = ManifestParser(json.dumps(manifest_json))

    # ... rest of logic ...
    # Only catch specific exceptions at the TOP level (sidecar.py)
```

---

## CRITICAL FINDING #4: IPC Handler Missing Error Path

**File:** `/c/Users/thecr/Desktop/sims_4_updater_v2/src/index.ts`
**Lines:** 22-42
**Severity:** CRITICAL

### The Problem
```typescript
ipcMain.handle('python-request', async (event, request) => {
  const id = Math.random().toString(36).substring(7);
  const fullRequest = { ...request, id };

  return new Promise((resolve) => {
    const progressListener = (data) => {
      event.sender.send(`python-progress-${id}`, data);
    };

    eventBus.on(`progress-${id}`, progressListener);

    eventBus.request(fullRequest).then((response) => {
      eventBus.removeListener(`progress-${id}`, progressListener);
      resolve(response);
    });
    // NO CATCH - IF REQUEST FAILS, PROMISE NEVER RESOLVES OR REJECTS
  });
});
```

### The Failure Mode
1. Backend crashes
2. `eventBus.request()` promise never settles
3. IPC handler never resolves
4. Renderer waits forever
5. UI freezes
6. User must force-quit

### The Fix Required
```typescript
ipcMain.handle('python-request', async (event, request) => {
  const id = Math.random().toString(36).substring(7);
  const fullRequest = { ...request, id };

  return new Promise((resolve, reject) => {
    // Set timeout to prevent forever hang
    const timeout = setTimeout(() => {
      eventBus.removeListener(`progress-${id}`, progressListener);
      reject(new Error(`Request timeout for command: ${request.command}`));
    }, 30000);

    const progressListener = (data) => {
      try {
        event.sender.send(`python-progress-${id}`, data);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    };

    eventBus.on(`progress-${id}`, progressListener);

    eventBus.request(fullRequest)
      .then((response) => {
        clearTimeout(timeout);
        eventBus.removeListener(`progress-${id}`, progressListener);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timeout);
        eventBus.removeListener(`progress-${id}`, progressListener);
        reject(error);  // IMPORTANT: MUST REJECT
      });
  });
});
```

---

## CRITICAL FINDING #5: Health Check Poll Empty Catch

**File:** `/c/Users/thecr/Desktop/sims_4_updater_v2/src/App.tsx`
**Lines:** 63-88
**Severity:** CRITICAL

### The Problem
```javascript
const poll = async () => {
  try {
    const start = Date.now();
    await window.electron.requestPython({ command: 'ping' });
    const latency = Date.now() - start;
    setIsHealthy(latency < 1000);
    // ... interval logic ...
  } catch {
    setIsHealthy(false);
    // ... interval backoff ...
  }
};
```

The catch block catches the error but does nothing with it. No logging, no investigation of what failed.

### Scenarios That Are Indistinguishable
1. Backend process crashed
2. Network timeout
3. IPC channel broken
4. Renderer process lost connection
5. Backend taking 10+ seconds

All show the same "Disconnected" message.

### The Fix Required
```javascript
const poll = async () => {
  try {
    const start = Date.now();
    const response = await window.electron.requestPython({ command: 'ping' });
    const latency = Date.now() - start;

    if (latency > 1000) {
      logForDebugging(`High latency: ${latency}ms`);
    }

    setIsHealthy(latency < 1000);
    clearInterval(pollId);
    pollInterval = 5000;
    pollId = setInterval(poll, pollInterval);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);

    if (msg.includes('timeout')) {
      logForDebugging(`Health check timeout: ${msg}`);
    } else if (msg.includes('IPC')) {
      logError(`IPC error: ${msg}`, { errorId: 'HEALTH_IPC_ERROR' });
    } else {
      logError(`Health check failed: ${msg}`, { errorId: 'HEALTH_CHECK_ERROR' });
    }

    setIsHealthy(false);

    // ... backoff logic ...
  }
};
```

---

## CRITICAL FINDING #6: EventBus Sidecar Spawn Not Validated

**File:** `/c/Users/thecr/Desktop/sims_4_updater_v2/src/eventBus.ts`
**Lines:** 12-70
**Severity:** CRITICAL

### The Problem
```typescript
start() {
  let pythonPath = 'python';
  let scriptPath = path.join(__dirname, '..', 'sidecar.py');

  // ... path resolution ...

  const args = scriptPath ? [scriptPath] : [];
  this.sidecar = spawn(pythonPath, args, { stdio: ['pipe', 'pipe', 'pipe'] });
  // spawn() CAN THROW HERE if pythonPath doesn't exist

  this.sidecar.stdout?.on('data', (data) => { ... });
  this.sidecar.stderr?.on('data', (data) => {
    console.error(`[Python Stderr]: ${data.toString()}`);
  });

  this.sidecar.on('exit', (code) => {
    console.error(`Sidecar process exited with code ${code}`);
    this.emit('backend-disconnected');
    setTimeout(() => this.start(), 3000);  // Blindly retry
  });
}
```

### Failure Scenarios
1. **Python not installed:** `spawn()` throws immediately, error not caught
2. **sidecar.exe missing in production:** Same as above
3. **Permission denied:** `spawn()` throws on Windows
4. **Auto-restart loop:** Retries every 3 seconds infinitely
5. **Stderr only logged:** If sidecar has Python errors, they go to console only

### The Fix Required
```typescript
start() {
  let pythonPath = 'python';
  let scriptPath = path.join(__dirname, '..', 'sidecar.py');

  // Validate files exist
  if (!fs.existsSync(scriptPath)) {
    scriptPath = path.join(__dirname, '..', '..', 'sidecar.py');
  }

  if (!fs.existsSync(scriptPath)) {
    logError(
      `Sidecar script not found: ${scriptPath}`,
      { errorId: 'SIDECAR_SCRIPT_NOT_FOUND' }
    );
    this.emit('backend-disconnected');
    return;
  }

  if (!fs.existsSync(pythonPath) && !process.platform === 'win32') {
    logError(
      'Python not found. Install Python 3.8+',
      { errorId: 'PYTHON_NOT_INSTALLED' }
    );
    this.emit('backend-disconnected');
    return;
  }

  const args = scriptPath ? [scriptPath] : [];

  try {
    this.sidecar = spawn(pythonPath, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 5000
    });

    this.sidecar.on('error', (error) => {
      logError(`Spawn failed: ${error.message}`, {
        errorId: 'SIDECAR_SPAWN_FAILED',
        pythonPath,
        scriptPath
      });
      this.emit('backend-disconnected');
      this.attemptRetry();  // Implement retry with counter
    });

    // ... stdout/stderr handlers ...
  } catch (error) {
    logError(`Unexpected spawn error: ${error}`, {
      errorId: 'SIDECAR_SPAWN_ERROR'
    });
    this.emit('backend-disconnected');
  }
}
```

---

## CRITICAL FINDING #7: URL Resolution Silent Fallback

**File:** `/c/Users/thecr/Desktop/sims_4_updater_v2/manifest.py`
**Multiple methods**
**Severity:** CRITICAL

### The Problem Pattern
```python
def _resolve_mediafire_link(self, url: str) -> str:
    try:
        response = self.client.get(url)
        soup = BeautifulSoup(response.text, "html.parser")
        link = soup.find('a', {'id': 'downloadButton'})
        if link and 'href' in link.attrs:
            return link['href']
    except Exception:
        pass
    return url  # SILENT FALLBACK - user never knows it failed
```

### What Can Fail Silently
1. Network timeout
2. 404 / Server down
3. HTML structure changed
4. Authentication required
5. Malformed HTML
6. Character encoding error

All return original URL with zero indication something went wrong.

### Real Impact
1. User gets download URL
2. Download fails because URL is a web page, not file
3. User complains it's broken
4. Developers have no logs of what went wrong

### The Fix Required
```python
def _resolve_mediafire_link(self, url: str) -> str:
    try:
        response = self.client.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        link = soup.find('a', {'id': 'downloadButton'})
        if link and 'href' in link.attrs:
            return link['href']
        else:
            logForDebugging(f"Download button not found on MediaFire: {url}")
            return url
    except requests.Timeout:
        logError(f"Timeout resolving MediaFire: {url}",
                errorId="MEDIAFIRE_TIMEOUT")
        return url
    except requests.HTTPError as e:
        logError(f"HTTP {e.response.status_code} resolving MediaFire: {url}",
                errorId="MEDIAFIRE_HTTP_ERROR")
        return url
    except Exception as e:
        logError(f"Failed to resolve MediaFire link: {str(e)}",
                errorId="MEDIAFIRE_RESOLVE_ERROR")
        return url
```

---

## Summary of Required Changes

**Blocking Issues (Must fix before merge):**
1. Sidecar exception handling - use specific exception types
2. Hash file exceptions - distinguish error types
3. Update operations - don't return silent empty list
4. IPC handler - add .catch() to promise
5. Health poll - log error details
6. EventBus spawn - validate files and handle errors
7. URL resolution - log before silently falling back

**Testing Required:**
- Backend fails to start
- Backend crashes mid-operation
- Network timeout on downloads
- Manifest invalid or unreachable
- Permission denied on file access
- Disk full error
- IPC serialization failure

