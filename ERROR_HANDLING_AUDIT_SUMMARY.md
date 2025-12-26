# Error Handling Audit: feature/bugfix_plan_20251221
## Critical Silent Failure Risks Identified

### CRITICAL ISSUES (Block Merge)

**1. Sidecar.py Broad Exception Catching (Lines 180)**
- Location: `/c/Users/thecr/Desktop/sims_4_updater_v2/sidecar.py`
- Issue: Catches ALL exceptions with `except Exception as e:` then silently converts to JSON
- Hidden Errors: AttributeError, ImportError, MemoryError, programming errors
- User Impact: Cryptic error messages with no context
- Fix: Separate handlers for specific exception types with detailed logging

**2. Engine.py Silent Hash Failure (Lines 13-16)**
- Location: `/c/Users/thecr/Desktop/sims_4_updater_v2/engine.py`
- Issue: `except Exception: return None` hides all hashing errors
- Hidden Errors: PermissionError, IOError, disk corruption
- User Impact: Corrupted files treated as "missing", unnecessary re-downloads
- Fix: Log errors with context, distinguish between "file missing" and "cannot read file"

**3. Update_Logic Silent Manifest Failure (Lines 46-70)**
- Location: `/c/Users/thecr/Desktop/sims_4_updater_v2/update_logic.py`
- Issue: Returns empty list `[]` on manifest fetch error with no logging
- Hidden Errors: Network timeout, invalid URL, parsing errors
- User Impact: Update appears to succeed when actually failed
- Fix: Raise exceptions, provide specific error messages to UI, log with error IDs

**4. App.tsx IPC Error Handler Swallows Details (Lines 109-118)**
- Location: `/c/Users/thecr/Desktop/sims_4_updater_v2/src/App.tsx`
- Issue: Catches errors without logging, only shows "Check logs for details" (but logs nothing)
- Hidden Errors: IPC channel failure, backend crash, serialization errors
- User Impact: Generic errors without actionable information
- Fix: Log all errors with context, provide specific error messages

**5. No Error Handler on IPC Request Promise (Lines 22-42)**
- Location: `/c/Users/thecr/Desktop/sims_4_updater_v2/src/index.ts`
- Issue: `eventBus.request().then()` with no `.catch()` - UI hangs if backend fails
- Hidden Errors: Backend crash, JSON serialization failure
- User Impact: Application becomes unresponsive and freezes
- Fix: Add explicit error handler and timeout

**6. Health Poll Empty Catch Block (Lines 63-88)**
- Location: `/c/Users/thecr/Desktop/sims_4_updater_v2/src/App.tsx`
- Issue: `catch { setIsHealthy(false); }` with no error logging
- Hidden Errors: IPC failures, backend crashes, timeout details
- User Impact: UI shows "Disconnected" with no explanation why
- Fix: Log error types and messages, distinguish between different failure modes

**7. EventBus Sidecar Startup Not Validated (Lines 12-70)**
- Location: `/c/Users/thecr/Desktop/sims_4_updater_v2/src/eventBus.ts`
- Issue: `spawn()` throws if Python not found - not caught, stderr only to console
- Hidden Errors: Python not installed, sidecar.exe missing, permission denied
- User Impact: Backend fails silently, app becomes non-functional
- Fix: Validate file existence, handle spawn errors, emit proper backend-disconnected event

**8. Manifest.py URL Resolution Silent Fallback (Multiple Locations)**
- Location: `/c/Users/thecr/Desktop/sims_4_updater_v2/manifest.py`
- Issue: `try: ... except Exception: pass; return original_url` - no logging
- Hidden Errors: Network timeout, parsing failed, 404 responses
- User Impact: Fallback URLs may not work, users have no idea why
- Fix: Log each failure type, return error info instead of silent fallback

---

### HIGH SEVERITY ISSUES

**9. Mirror Discovery Async Error Handling**
- Location: `/c/Users/thecr/Desktop/sims_4_updater_v2/discovery.py`
- Issue: Catches all exceptions, stores `str(e)` which can be cryptic
- Fix: Specific exception handlers, meaningful error strings

**10. No Window Creation Error Handling**
- Location: `/c/Users/thecr/Desktop/sims_4_updater_v2/src/index.ts` (createWindow)
- Issue: BrowserWindow creation, loadURL have no try-catch
- Fix: Handle window creation errors explicitly

**11. Missing Request Timeout in EventBus**
- Location: `/c/Users/thecr/Desktop/sims_4_updater_v2/src/eventBus.ts`
- Issue: Requests may never resolve, causing memory leaks
- Fix: Set timeout on all pending requests, clean up properly

**12. No Response Format Validation**
- Location: `/c/Users/thecr/Desktop/sims_4_updater_v2/src/eventBus.ts` (lines 36-48)
- Issue: Assumes message fields exist without checking
- Fix: Validate response structure before using fields

---

### ROOT CAUSE ANALYSIS

The branch introduces many new async/IPC operations but:
1. **No logging system integration** - New code doesn't use logError/logForDebugging
2. **No error IDs** - Can't track errors in Sentry
3. **Missing exception mapping** - Broad catches instead of specific types
4. **No error recovery** - Silent failures instead of propagating errors
5. **No timeout mechanisms** - Requests can hang indefinitely

---

### REQUIRED FIXES BEFORE MERGE

1. Implement logging integration (logError, logForDebugging, logEvent)
2. Add error IDs to all error responses
3. Replace broad exception catching with specific types
4. Add explicit error handlers to all promises
5. Implement timeouts on all IPC requests
6. Validate response formats from backend
7. Log all errors with context before returning to UI
8. Provide actionable error messages to users

---

### FILES REQUIRING CHANGES

**TypeScript/React:**
- src/App.tsx (health poll, IPC error handling, async operations)
- src/index.ts (IPC handler, window creation, error propagation)
- src/eventBus.ts (sidecar startup, spawn error handling, response validation)
- src/preload.ts (no changes needed)

**Python:**
- sidecar.py (exception handling in main loop)
- engine.py (hash_file exception handling)
- update_logic.py (manifest fetch error handling)
- manifest.py (URL resolution, specific exception handling)
- discovery.py (mirror probe exception handling)
- download.py (add error handling)
- patch.py (add error handling)

---

### TESTING REQUIRED

Test these failure scenarios before merge:
1. Backend process fails to start
2. Backend crashes during operation
3. Network timeout on manifest fetch
4. Invalid manifest JSON
5. Permission denied on file operations
6. Concurrent requests with rapid cancellation
7. IPC serialization failures

