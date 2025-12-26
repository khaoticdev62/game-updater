# Backend-Frontend Wiring Implementation Plan

**Start Date**: December 25, 2025
**Target Completion**: January 1, 2026 (1 week)
**Current Status**: 55% Complete → Target: 95% Complete
**Total Estimated Effort**: 16-20 hours

---

## 📋 Overview

This plan details the implementation of 10 critical features to complete backend-frontend wiring and move the application to production-ready status.

### Work Breakdown
- **Phase 1**: Critical Path (5 hours) - Must have for basic functionality
- **Phase 2**: Production Ready (8 hours) - Required for production deployment
- **Phase 3**: Polish (3-5 hours) - Nice to have enhancements

---

## 🚀 Phase 1: Critical Path (5 hours) - WEEK 1, DAYS 1-2

### Feature 1.1: Clear Logs Callback ⭐ PRIORITY (5 minutes)
**Status**: Ready to implement
**Dependency**: None (independent)
**Files**:
- `src/App.tsx` (1 function + 1 prop update)

**Implementation**:
```typescript
// Add near line 110 in src/App.tsx, after handleIpcError function:
const handleClearLogs = () => {
  setLogs([]);
};

// Update line ~428 from:
// <DiagnosticConsole logs={logs} />
// To:
<DiagnosticConsole logs={logs} onClearLogs={handleClearLogs} />
```

**Testing**:
- [ ] Clear button is enabled
- [ ] Clicking clears all logs
- [ ] DiagnosticConsole updates
- [ ] Works with empty logs

**Time**: 5 minutes

---

### Feature 1.2: Progress Indicator Component ⭐ PRIORITY (2 hours)
**Status**: Needs new component
**Dependency**: None (independent)
**Files**:
- `src/components/ProgressIndicator.tsx` (NEW)
- `src/App.tsx` (add usage)

**Component Specification**:
```typescript
// src/components/ProgressIndicator.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  status: string;
  current?: number;
  total?: number;
  percentage?: number;
  isVisible: boolean;
  onCancel?: () => void;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  status,
  current,
  total,
  percentage = 0,
  isVisible,
  onCancel
}) => {
  if (!isVisible) return null;

  const displayPercentage = percentage || (current && total ? Math.round((current / total) * 100) : 0);

  return (
    <motion.div
      className="fixed bottom-4 left-4 w-96 glass-heavy rounded-lg border border-white/20 p-6 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-4">
        {/* Status Text */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{status}</h3>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
            initial={{ width: 0 }}
            animate={{ width: `${displayPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Percentage Text */}
        <div className="text-sm text-white/70">
          {displayPercentage}% Complete
          {current && total && ` (${current}/${total})`}
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressIndicator;
```

**Integration in App.tsx**:
```typescript
// Add state near line 25:
const [showProgress, setShowProgress] = useState<boolean>(false);

// Import at top:
import ProgressIndicator from './components/ProgressIndicator';

// Update handleVerify and handleStartUpdate to show progress:
const handleVerify = async () => {
  const id = Math.random().toString(36).substring(7);
  setShowProgress(true); // Add this

  const removeListener = window.electron.onPythonProgress(id, (data) => {
    setProgress(data);
  });

  try {
    // ... existing code ...
  } finally {
    removeListener();
    setShowProgress(false); // Add this
  }
};

// Add before closing </Environment> tag:
<ProgressIndicator
  status={progress?.status || ''}
  current={progress?.current}
  total={progress?.total}
  isVisible={showProgress}
/>
```

**Testing**:
- [ ] Component renders when visible
- [ ] Progress bar animates
- [ ] Shows percentage correctly
- [ ] Cancel button works
- [ ] Disappears when showProgress=false

**Time**: 2 hours

---

### Feature 1.3: Error Toast Notification System (2-3 hours)
**Status**: Needs new component
**Dependency**: None (independent)
**Files**:
- `src/components/ErrorToast.tsx` (NEW)
- `src/App.tsx` (add state + usage)

**Component Specification**:
```typescript
// src/components/ErrorToast.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessage {
  id: string;
  code?: string;
  message: string;
  details?: string;
  timestamp: Date;
}

interface ErrorToastProps {
  errors: ErrorMessage[];
  onDismiss: (id: string) => void;
  maxToasts?: number;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  errors,
  onDismiss,
  maxToasts = 3
}) => {
  const displayedErrors = errors.slice(-maxToasts);

  return (
    <div className="fixed top-4 right-4 space-y-2 pointer-events-none">
      <AnimatePresence>
        {displayedErrors.map((error) => (
          <motion.div
            key={error.id}
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="pointer-events-auto"
          >
            <div className="glass-heavy border-l-4 border-red-400 rounded-lg p-4 max-w-sm shadow-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-red-300">
                        {error.code || 'Error'}
                      </h4>
                      <p className="text-sm text-white/80 mt-1">
                        {error.message}
                      </p>
                      {error.details && (
                        <p className="text-xs text-white/60 mt-2 break-words">
                          {error.details}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => onDismiss(error.id)}
                      className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ErrorToast;
```

**Integration in App.tsx**:
```typescript
// Add state near line 25:
const [errors, setErrors] = useState<Array<{
  id: string;
  code?: string;
  message: string;
  details?: string;
  timestamp: Date;
}>>([]);

// Update handleIpcError function:
const handleIpcError = (e: unknown) => {
  const msg = e instanceof Error ? e.message : String(e);
  const errorId = Math.random().toString(36).substring(7);

  // Also add to error list for toast display
  setErrors(prev => [...prev, {
    id: errorId,
    code: msg.includes('timed out') ? 'TIMEOUT' : 'IPC_ERROR',
    message: msg.includes('timed out')
      ? 'Backend request timed out'
      : 'Communication error with backend',
    details: msg,
    timestamp: new Date()
  }]);

  // Keep existing response state update for display
  if (msg.includes('timed out')) {
    setIsHealthy(false);
    setResponse(`Backend Timeout: The request took too long. Check the logs for details.`);
  } else {
    setResponse(`Communication Error: ${msg}`);
  }
};

// Auto-dismiss errors after 8 seconds
useEffect(() => {
  const timers = errors.map(error =>
    setTimeout(() => {
      setErrors(prev => prev.filter(e => e.id !== error.id));
    }, 8000)
  );

  return () => timers.forEach(timer => clearTimeout(timer));
}, [errors]);

// Add import at top:
import ErrorToast from './components/ErrorToast';

// Add after ProgressIndicator:
<ErrorToast
  errors={errors}
  onDismiss={(id) => setErrors(prev => prev.filter(e => e.id !== id))}
/>
```

**Testing**:
- [ ] Errors display as toast
- [ ] Multiple errors stack
- [ ] Dismiss button works
- [ ] Auto-dismisses after 8 seconds
- [ ] Shows error code, message, and details
- [ ] Shows at top-right of screen

**Time**: 2-3 hours

---

## 📊 Phase 1 Summary

| Task | Time | Status |
|------|------|--------|
| Clear Logs Callback | 5 min | Ready |
| Progress Indicator | 2 hrs | Ready |
| Error Toast System | 2-3 hrs | Ready |
| **Phase 1 Total** | **4.5-5 hrs** | **Go** |

---

## 🎯 Phase 2: Production Ready (8 hours) - WEEK 1, DAYS 3-5

### Feature 2.1: Verify Operations Summary (2 hours)
**Status**: Needs response processing
**Dependency**: IPC communication (✅)
**Files**:
- `src/App.tsx` (update handleVerify)

**Implementation**:
```typescript
// Add new state for operations summary:
const [operationsSummary, setOperationsSummary] = useState<{
  operations: any[];
  toDownload: number;
  toUpdate: number;
  toDelete: number;
} | null>(null);

// Update handleVerify to process response:
const handleVerify = async () => {
  const id = Math.random().toString(36).substring(7);
  setShowProgress(true);

  const removeListener = window.electron.onPythonProgress(id, (data) => {
    setProgress(data);
  });

  try {
    setResponse("Starting verification...");
    const res = await window.electron.requestPython({
      command: 'verify_all',
      game_dir: '.',
      manifest_url: manifestUrl,
      version: selectedVersion || undefined,
      selected_packs: dlcs.filter(d => d.selected).map(d => d.folder),
      language: selectedLanguage,
      id
    });

    // NEW: Process operations summary
    if (res.result && Array.isArray(res.result)) {
      const operations = res.result;
      const toDownload = operations.filter(op => op.type === 'download').length;
      const toUpdate = operations.filter(op => op.type === 'update').length;
      const toDelete = operations.filter(op => op.type === 'delete').length;

      setOperationsSummary({
        operations,
        toDownload,
        toUpdate,
        toDelete
      });

      setResponse(`Verification Complete:\n• ${toDownload} files to download\n• ${toUpdate} files to update\n• ${toDelete} files to delete`);
    } else {
      setResponse(JSON.stringify(res, null, 2));
    }
  } catch (e) {
    handleIpcError(e);
  } finally {
    removeListener();
    setShowProgress(false);
  }
};
```

**Testing**:
- [ ] Operations parsed correctly
- [ ] Summary displayed in response
- [ ] Download/update/delete counts accurate
- [ ] Shows file list

**Time**: 2 hours

---

### Feature 2.2: Update Completion Tracking (2 hours)
**Status**: Needs response processing
**Dependency**: IPC communication (✅)
**Files**:
- `src/App.tsx` (update handleStartUpdate)

**Implementation**:
```typescript
// Add state for update result:
const [updateResult, setUpdateResult] = useState<{
  success: boolean;
  message: string;
  details?: string;
} | null>(null);

// Update handleStartUpdate:
const handleStartUpdate = async () => {
  const id = Math.random().toString(36).substring(7);
  setShowProgress(true);
  setUpdateResult(null);

  const removeListener = window.electron.onPythonProgress(id, (data) => {
    setProgress(data);
  });

  try {
    setResponse("Starting full update workflow...");
    const res = await window.electron.requestPython({
      command: 'start_update',
      game_dir: '.',
      manifest_url: manifestUrl,
      version: selectedVersion || undefined,
      selected_packs: dlcs.filter(d => d.selected).map(d => d.folder),
      language: selectedLanguage,
      id
    });

    // NEW: Process completion status
    if (res.result) {
      const { success, message } = res.result;
      setUpdateResult({
        success,
        message,
        details: JSON.stringify(res.result, null, 2)
      });

      if (success) {
        setResponse(`✅ Update Complete!\n${message}`);
        // Add error with success code
        const successId = Math.random().toString(36).substring(7);
        setErrors(prev => [...prev, {
          id: successId,
          code: 'SUCCESS',
          message: 'Update completed successfully',
          details: message,
          timestamp: new Date()
        }]);
      } else {
        setResponse(`❌ Update Failed\n${message}`);
        handleIpcError(new Error(message));
      }
    }
  } catch (e) {
    handleIpcError(e);
  } finally {
    removeListener();
    setShowProgress(false);
  }
};
```

**Testing**:
- [ ] Shows success message on completion
- [ ] Shows failure message on error
- [ ] Updates response state
- [ ] Adds success notification
- [ ] Handles edge cases

**Time**: 2 hours

---

### Feature 2.3: State Persistence (localStorage) (2 hours)
**Status**: Needs implementation
**Dependency**: None (independent)
**Files**:
- `src/App.tsx` (add hooks)

**Implementation**:
```typescript
// Add effect to save manifest URL:
useEffect(() => {
  localStorage.setItem('manifest_url', manifestUrl);
}, [manifestUrl]);

// Add effect to save selected version:
useEffect(() => {
  localStorage.setItem('selected_version', selectedVersion);
}, [selectedVersion]);

// Add effect to save selected language:
useEffect(() => {
  localStorage.setItem('selected_language', selectedLanguage);
}, [selectedLanguage]);

// Add effect to save DLC selections:
useEffect(() => {
  const selections = dlcs.reduce((acc, dlc) => {
    acc[dlc.folder] = dlc.selected;
    return acc;
  }, {} as Record<string, boolean>);
  localStorage.setItem('dlc_selections', JSON.stringify(selections));
}, [dlcs]);

// Update initial state to load from localStorage:
// Around line 29 (manifestUrl state):
const [manifestUrl, setManifestUrl] = useState<string>(
  () => localStorage.getItem('manifest_url') || ''
);

// Around line 31 (selectedVersion state):
const [selectedVersion, setSelectedVersion] = useState<string>(
  () => localStorage.getItem('selected_version') || ''
);

// Around line 33 (selectedLanguage state):
const [selectedLanguage, setSelectedLanguage] = useState<string>(
  () => localStorage.getItem('selected_language') || 'en_US'
);

// Update DLCs initialization to load selections:
const [dlcs, setDlcs] = useState<DLC[]>(() => {
  const savedSelections = localStorage.getItem('dlc_selections');
  const selections = savedSelections ? JSON.parse(savedSelections) : {};

  return [
    { name: 'Get to Work', folder: 'EP01', status: 'Installed', selected: selections.EP01 !== false, category: 'Expansion Packs' },
    { name: 'Get Together', folder: 'EP02', status: 'Missing', selected: selections.EP02 === true, category: 'Expansion Packs' },
    { name: 'City Living', folder: 'EP03', status: 'Missing', selected: selections.EP03 === true, category: 'Expansion Packs' },
    { name: 'Vampires', folder: 'GP04', status: 'Missing', selected: selections.GP04 === true, category: 'Game Packs' },
    { name: 'Laundry Day', folder: 'SP13', status: 'Missing', selected: selections.SP13 === true, category: 'Stuff Packs' },
    { name: 'Desert Luxe', folder: 'SP34', status: 'Missing', selected: selections.SP34 === true, category: 'Kits' },
  ];
});
```

**Testing**:
- [ ] Manifest URL saved/loaded
- [ ] Selected version saved/loaded
- [ ] Selected language saved/loaded
- [ ] DLC selections saved/loaded
- [ ] Persists across page reloads
- [ ] localStorage values correct

**Time**: 2 hours

---

### Feature 2.4: Response Display Formatting (2 hours)
**Status**: Needs component
**Dependency**: None (independent)
**Files**:
- `src/components/ResponseDisplay.tsx` (NEW)
- `src/App.tsx` (replace raw JSON display)

**Component**:
```typescript
// src/components/ResponseDisplay.tsx
import React from 'react';
import { CheckCircle, AlertCircle, InfoIcon } from 'lucide-react';

interface ResponseDisplayProps {
  response: string;
  type?: 'success' | 'error' | 'info' | 'json';
}

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  response,
  type = 'info'
}) => {
  if (!response) return null;

  const isJSON = response.startsWith('{') || response.startsWith('[');
  const displayType = type || (response.includes('✅') ? 'success' : response.includes('❌') ? 'error' : 'info');

  const bgColor = {
    success: 'bg-green-500/10 border-green-400 text-green-300',
    error: 'bg-red-500/10 border-red-400 text-red-300',
    info: 'bg-blue-500/10 border-blue-400 text-blue-300',
    json: 'bg-gray-500/10 border-gray-400 text-white/80'
  }[displayType];

  const icon = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    info: <InfoIcon size={20} />,
    json: null
  }[displayType];

  return (
    <div className={`border rounded-lg p-4 ${bgColor}`}>
      <div className="flex gap-3 items-start">
        {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}

        <div className="flex-1 min-w-0">
          {isJSON ? (
            <pre className="text-xs overflow-auto max-h-64 font-mono">
              {JSON.stringify(JSON.parse(response), null, 2)}
            </pre>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words">
              {response}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponseDisplay;
```

**Update App.tsx** (replace raw response display):
```typescript
// Find the response display section and replace with:
{response && (
  <div className="mt-6">
    <h3 className="text-lg font-semibold text-white mb-3">Response</h3>
    <ResponseDisplay response={response} />
  </div>
)}
```

**Testing**:
- [ ] Success messages format correctly
- [ ] Error messages format correctly
- [ ] JSON responses format nicely
- [ ] Icons display appropriately
- [ ] Colors match message type

**Time**: 2 hours

---

## 📊 Phase 2 Summary

| Task | Time | Status |
|------|------|--------|
| Verify Operations Summary | 2 hrs | Ready |
| Update Completion Tracking | 2 hrs | Ready |
| State Persistence | 2 hrs | Ready |
| Response Display Formatting | 2 hrs | Ready |
| **Phase 2 Total** | **8 hrs** | **Go** |

---

## 🎨 Phase 3: Polish (3-5 hours) - WEEK 2, DAYS 1-2

### Feature 3.1: Retry Logic (2 hours)
**Dependency**: handleIpcError (✅)
**Files**: `src/App.tsx`

**Implementation**: Add retry button to error toast

### Feature 3.2: Mirror Selection UI (1.5 hours)
**Dependency**: discover_mirrors (✅)
**Files**: Create `src/components/MirrorSelector.tsx`

### Feature 3.3: Operation Queue (1.5 hours)
**Dependency**: Multiple command handlers (✅)
**Files**: Create `src/utils/operationQueue.ts`

---

## 📅 Implementation Schedule

```
WEEK 1 (Dec 25-31)
├─ Day 1: Clear Logs + Progress Indicator (2.5 hrs)
├─ Day 2: Error Toast System (3 hrs)
├─ Day 3: Verify Summary + Update Tracking (4 hrs)
├─ Day 4: State Persistence + Response Display (4 hrs)
└─ Day 5: Testing & Bug Fixes (2 hrs)

WEEK 2 (Jan 1-7)
├─ Day 1-2: Phase 3 Polish (3-5 hrs)
├─ Day 3-4: Integration Testing
└─ Day 5: Final QA
```

---

## ✅ Completion Checklist

### Phase 1 Checklist
- [ ] Clear Logs callback wired
- [ ] Progress Indicator component created
- [ ] Progress display integrated in verify/update
- [ ] Error Toast system created
- [ ] Errors display as toasts
- [ ] Multiple errors stack correctly

### Phase 2 Checklist
- [ ] Verify response processed for operations
- [ ] Operations summary displayed
- [ ] Update completion tracked
- [ ] Success/failure notifications shown
- [ ] localStorage persistence working
- [ ] All state saves/loads correctly
- [ ] Response display component created
- [ ] JSON responses formatted nicely
- [ ] Success/error/info types styled correctly

### Phase 3 Checklist
- [ ] Retry button in error toast
- [ ] Mirror selection UI
- [ ] Operation queue system

---

## 🎯 Success Criteria

**Phase 1**: App is more stable
- Progress visible during operations
- Errors shown persistently
- Logs can be cleared

**Phase 2**: App is production-ready
- All responses formatted nicely
- Settings persist across sessions
- Completion tracked for long operations
- User always knows what's happening

**Phase 3**: App is polished
- Users can retry failed operations
- Users can select mirrors manually
- Users can queue multiple operations

---

## 📊 Time Breakdown

| Phase | Effort | Status |
|-------|--------|--------|
| Phase 1 | 5 hrs | CRITICAL |
| Phase 2 | 8 hrs | CRITICAL |
| Phase 3 | 4 hrs | OPTIONAL |
| **Total** | **16-17 hrs** | **Target: Jan 1** |

---

## 🚀 Starting Phase 1

Ready to begin implementation?

1. **Clear Logs Callback** (5 min) - Quickest win
2. **Progress Indicator** (2 hrs) - High impact
3. **Error Toast** (3 hrs) - Essential for UX

Shall I proceed with Phase 1 implementation?

---

**Plan Created**: December 25, 2025
**Target Start**: Immediately
**Target Completion**: January 1, 2026
