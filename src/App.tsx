import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DLCGrid from './components/DLCGrid';
import { DLC } from './types';
import ScraperViewfinder, { MirrorResult } from './components/ScraperViewfinder';
import DiagnosticConsole, { LogEntry } from './components/DiagnosticConsole';
import { ProgressIndicator } from './components/ProgressIndicator';
import { ErrorToast, ErrorMessage } from './components/ErrorToast';
import { OperationsSummary, Operation } from './components/OperationsSummary';
import { UpdateCompletionStatus, UpdateResult } from './components/UpdateCompletionStatus';
import { ResponseDisplay } from './components/ResponseDisplay';
import { RetryNotification } from './components/RetryNotification';
import { MirrorSelector } from './components/MirrorSelector';
import { OperationQueue } from './components/OperationQueue';
import { useRetry } from './hooks/useRetry';
import { useOperationQueue } from './hooks/useOperationQueue';
import CustomCursor from './components/CustomCursor';
import { Environment } from './components/Environment';
import { TopShelf } from './components/TopShelf';
import { VisionCard } from './components/VisionCard';
import { Button } from './components/Button';
import { useLocalStorage, saveAppState, loadAppState, clearAppState } from './hooks/useLocalStorage';

interface ProgressData {
  status: string;
  current?: number;
  total?: number;
  file?: string;
  message?: string;
}

const App = () => {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [response, setResponse] = useState<string>('');
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [discoveredMirrors, setDiscoveredMirrors] = useState<MirrorResult[]>([]);
  const [selectedMirror, setSelectedMirror] = useState<MirrorResult | null>(null);
  const [showMirrorSelector, setShowMirrorSelector] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [errors, setErrors] = useState<ErrorMessage[]>([]);
  const [pendingOperations, setPendingOperations] = useState<Operation[]>([]);
  const [showOperationsSummary, setShowOperationsSummary] = useState(false);
  const [confirmedOperationsCallback, setConfirmedOperationsCallback] = useState<(() => void) | null>(null);
  const [updateResult, setUpdateResult] = useState<UpdateResult | null>(null);
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);

  // Retry logic
  const [retryState, setRetryState] = useState({
    isVisible: false,
    attempt: 0,
    maxAttempts: 5,
    nextRetryIn: 0,
    lastError: null as Error | null
  });
  const [execute, state] = useRetry({
    maxAttempts: 5,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    onRetry: (attempt, delay) => {
      setRetryState({
        isVisible: true,
        attempt,
        maxAttempts: 5,
        nextRetryIn: delay,
        lastError: null
      });
    },
    onFinal: (error) => {
      setRetryState(prev => ({
        ...prev,
        lastError: error
      }));
    }
  });

  const cancelRetry = useCallback(() => {
    setRetryState(prev => ({ ...prev, isVisible: false }));
  }, []);

  // Operation queue
  const {
    add: addOperation,
    remove: removeOperation,
    updateProgress: updateOperationProgress,
    start: startQueue,
    pause: pauseQueue,
    resume: resumeQueue,
    cancel: cancelQueue,
    clearCompleted: clearCompletedOperations,
    state: queueState
  } = useOperationQueue({ parallel: false });

  const [showOperationQueue, setShowOperationQueue] = useState(false);

  /**
   * Determine if an error is retryable
   * Retries on timeout, network, and temporary errors
   * Does NOT retry on validation/input errors
   */
  const isRetryableError = useCallback((error: unknown): boolean => {
    const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    
    // Retryable errors
    if (msg.includes('timeout') || 
        msg.includes('network') ||
        msg.includes('econnrefused') ||
        msg.includes('enotfound') ||
        msg.includes('temporary failure')) {
      return true;
    }

    // Non-retryable errors
    if (msg.includes('validation') ||
        msg.includes('missing') ||
        msg.includes('not found') ||
        msg.includes('invalid') ||
        msg.includes('permission')) {
      return false;
    }

    return false;
  }, []);

  /**
   * Wrapper for IPC requests with automatic retry
   */
  const requestWithRetry = useCallback(
    async <T,>(requestFn: () => Promise<T>, shouldRetry: boolean = false): Promise<T> => {
      if (shouldRetry && isRetryableError) {
        return execute(requestFn);
      }
      return requestFn();
    },
    [execute, isRetryableError]
  );

  // State persisted to localStorage
  const [manifestUrl, setManifestUrl] = useLocalStorage<string>('appState:manifestUrl', '');
  const [selectedVersion, setSelectedVersion] = useLocalStorage<string>('appState:selectedVersion', '');
  const [selectedLanguage, setSelectedLanguage] = useLocalStorage<string>('appState:selectedLanguage', 'en_US');

  // Non-persisted state
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [showHistorical, setShowHistorical] = useState<boolean>(false);
  // Initialize DLC state with localStorage restoration
  const initializeDlcs = (): DLC[] => {
    const defaultDlcs: DLC[] = [
      { name: 'Get to Work', folder: 'EP01', status: 'Installed', selected: true, category: 'Expansion Packs' },
      { name: 'Get Together', folder: 'EP02', status: 'Missing', selected: false, category: 'Expansion Packs' },
      { name: 'City Living', folder: 'EP03', status: 'Missing', selected: false, category: 'Expansion Packs' },
      { name: 'Vampires', folder: 'GP04', status: 'Missing', selected: false, category: 'Game Packs' },
      { name: 'Laundry Day', folder: 'SP13', status: 'Missing', selected: false, category: 'Stuff Packs' },
      { name: 'Desert Luxe', folder: 'SP34', status: 'Missing', selected: false, category: 'Kits' },
    ];

    // Try to restore DLC selections from localStorage
    try {
      const savedState = loadAppState();
      if (savedState.dlcSelections) {
        return defaultDlcs.map(dlc => ({
          ...dlc,
          selected: savedState.dlcSelections?.[dlc.folder] ?? dlc.selected
        }));
      }
    } catch (error) {
      console.warn('Failed to restore DLC selections from storage');
    }

    return defaultDlcs;
  };

  const [dlcs, setDlcs] = useState<DLC[]>(initializeDlcs);

  const languages = [
    { code: 'en_US', name: 'English' },
    { code: 'fr_FR', name: 'French' },
    { code: 'de_DE', name: 'German' },
    { code: 'es_ES', name: 'Spanish' },
    { code: 'it_IT', name: 'Italian' },
  ];

  // Calculate estimated storage space (UI-side mock estimate)
  const selectionSummary = useMemo(() => {
    const selectedCount = dlcs.filter(d => d.selected).length;
    // Mock estimate: ~2.1GB per DLC (including overlays and translations)
    const estimatedGB = (selectedCount * 2.1).toFixed(1);
    return { count: selectedCount, size: estimatedGB };
  }, [dlcs]);

  // Health Polling Logic
  useEffect(() => {
    let pollInterval = 100; // Start fast
    let pollId: NodeJS.Timeout;
    const startTime = Date.now();

    const poll = async () => {
      try {
        const start = Date.now();
        await window.electron.requestPython({ command: 'ping' });
        const latency = Date.now() - start;
        setIsHealthy(latency < 1000);
        // If successful, back off immediately
        clearInterval(pollId);
        pollInterval = 5000;
        pollId = setInterval(poll, pollInterval);
      } catch {
        setIsHealthy(false);
        // If failing for more than 5s, back off anyway
        if (Date.now() - startTime > 5000 && pollInterval < 5000) {
           clearInterval(pollId);
           pollInterval = 5000;
           pollId = setInterval(poll, pollInterval);
        }
      }
    };

    pollId = setInterval(poll, pollInterval);

    // Listen for backend-ready event for immediate switch
    const removeReadyListener = window.electron.onBackendReady(() => {
      setIsHealthy(true);
      clearInterval(pollId);
      pollInterval = 5000;
      pollId = setInterval(poll, pollInterval);
    });

    const removeDisconnectListener = window.electron.onBackendDisconnected(() => {
      setIsHealthy(false);
    });

    return () => {
      clearInterval(pollId);
      removeReadyListener();
      removeDisconnectListener();
    };
  }, []);

  // Log Streaming Logic
  useEffect(() => {
    const removeListener = window.electron.onPythonLog((data: LogEntry) => {
      setLogs(prev => [...prev.slice(-99), data]);
    });
    return () => removeListener();
  }, []);

  // Save DLC selections to localStorage when they change
  useEffect(() => {
    const dlcSelections = dlcs.reduce((acc, dlc) => {
      acc[dlc.folder] = dlc.selected;
      return acc;
    }, {} as Record<string, boolean>);
    
    saveAppState({ dlcSelections });
  }, [dlcs]);

  const addError = (code: string, message: string, details?: string, autoDismissIn: number = 8000) => {
    const errorId = `${code}-${Date.now()}-${Math.random()}`;
    const error: ErrorMessage = {
      id: errorId,
      code,
      message,
      details,
      timestamp: Date.now(),
      autoDismissIn
    };
    setErrors(prev => [...prev, error]);
  };

  const dismissError = (id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id));
  };

  /**
   * Format command responses for user-friendly display
   * Extracts key information and presents it clearly
   */
  const formatAndDisplayResponse = (command: string, data: any) => {
    const formatters: Record<string, (d: any) => string> = {
      verify_complete: (d) => `✓ Verification Complete\n\n${d.summary}`,
      verify_no_ops: (d) => '✓ All files verified and up-to-date',
      update_started: (d) => `✓ Update started\n\nProcessing ${d.operationsCount} operations...`,
      update_complete: (d) => `✓ Update Complete\n\nSuccessfully processed ${d.operationsCount} operations`,
      ping: (d) => '✓ Backend is responding normally',
      versions_discovered: (d) => `✓ Found ${d.count} versions available`,
      dlc_status: (d) => `✓ Scanned ${d.count} DLC packs`,
      mirrors_discovered: (d) => `✓ Found ${d.count} mirrors (${d.healthy} healthy)`
    };

    const formatter = formatters[command];
    if (formatter && data) {
      setResponse(formatter(data));
    }
  };

  const handleIpcError = (e: unknown, canRetry: boolean = false) => {
    const msg = e instanceof Error ? e.message : String(e);
    
    // Check if it's an error response with proper error structure
    if (e && typeof e === 'object' && 'error' in e) {
      const errorObj = (e as any).error;
      if (errorObj && typeof errorObj === 'object' && 'code' in errorObj) {
        addError(
          errorObj.code || 'IPC_ERROR',
          errorObj.message || msg,
          errorObj.details
        );
        setIsHealthy(false);
        return;
      }
    }

    // Handle other error types
    if (msg.includes('timed out')) {
      addError('TIMEOUT_ERROR', 'Backend request timed out', 'The request took too long to complete. Check the backend status and try again.', canRetry ? 0 : 8000);
      setIsHealthy(false);
    } else if (msg.includes('Network') || msg.includes('network')) {
      addError('NETWORK_ERROR', 'Network connection error', msg, canRetry ? 0 : 8000);
      setIsHealthy(false);
    } else {
      addError('IPC_ERROR', 'Communication error', msg);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handlePing = async () => {
    try {
      const res = await requestWithRetry(
        () => window.electron.requestPython({ command: 'ping' }),
        true // Enable retry for ping
      );
      formatAndDisplayResponse('ping', { status: 'healthy' });
    } catch (e) {
      handleIpcError(e, true);
    }
  };

  const toggleDLC = (folder: string) => {
    setDlcs(prev => prev.map(d => d.folder === folder ? { ...d, selected: !d.selected } : d));
  };

  const handleRefreshDLCs = async () => {
    try {
      setResponse("Scanning for installed and missing content...");
      const res = await requestWithRetry(
        () => window.electron.requestPython({
          command: 'get_dlc_status',
          game_dir: '.',
          manifest_url: manifestUrl
        }),
        true // Enable retry for DLC status
      ) as { result: DLC[] };
      
      if (res.result) {
        // Preserve selection state if the DLC was already in the list
        const updatedDlcs = res.result.map(newDlc => {
          const existing = dlcs.find(d => d.folder === newDlc.folder);
          return {
            ...newDlc,
            selected: existing ? existing.selected : false
          };
        });
        setDlcs(updatedDlcs);
        formatAndDisplayResponse('dlc_status', { count: updatedDlcs.length });
      }
    } catch (e) {
      handleIpcError(e, true);
    }
  };

  // Parse operations from verify_all response
  const parseOperations = (response: any): { operations: Operation[]; totalSize: number } => {
    const operations: Operation[] = [];
    let totalSize = 0;

    // Handle different response formats
    if (response?.result?.operations) {
      response.result.operations.forEach((op: any) => {
        operations.push({
          type: op.type || 'update',
          file: op.file || op.filename,
          path: op.path || op.filepath,
          size: op.size || 0,
          status: op.status
        });
        totalSize += op.size || 0;
      });
    } else if (response?.result?.files) {
      // Alternative format: list of files to download/verify
      response.result.files.forEach((file: any) => {
        operations.push({
          type: file.type || 'download',
          file: file.name || file.filename,
          size: file.size || 0
        });
        totalSize += file.size || 0;
      });
    } else if (Array.isArray(response?.result)) {
      // Direct array format
      response.result.forEach((item: any) => {
        operations.push({
          type: item.type || 'update',
          file: item.file || item.name,
          size: item.size || 0
        });
        totalSize += item.size || 0;
      });
    }

    return { operations, totalSize };
  };

  const handleVerify = async () => {
    const id = Math.random().toString(36).substring(7);
    const removeListener = window.electron.onPythonProgress(id, (data) => {
      setProgress(data);
    });

    try {
      setResponse("Starting verification...");
      
      // Use retry for retryable errors
      const res = await requestWithRetry(
        () => window.electron.requestPython({ 
          command: 'verify_all', 
          game_dir: '.', 
          manifest_url: manifestUrl,
          version: selectedVersion || undefined,
          selected_packs: dlcs.filter(d => d.selected).map(d => d.folder),
          language: selectedLanguage,
          id 
        }),
        true // Enable retry for verify_all
      );

      // Parse operations from response
      const { operations, totalSize } = parseOperations(res);

      if (operations.length > 0) {
        // Show operations summary and wait for confirmation
        setPendingOperations(operations);
        setShowOperationsSummary(true);
        
        // Set callback for when user confirms
        setConfirmedOperationsCallback(() => {
          setShowOperationsSummary(false);
          setResponse(`Verified ${operations.length} operations. Ready to update. Click "Update Game" to proceed.`);
          formatAndDisplayResponse('verify_complete', {
            operationsCount: operations.length,
            totalSize: totalSize,
            summary: `${operations.length} file(s) to process (${(totalSize / 1024 / 1024).toFixed(2)} MB)`
          });
        });
      } else {
        // No operations needed
        setResponse("Verification complete: All files are up-to-date. No operations needed.");
        formatAndDisplayResponse('verify_no_ops', { status: 'No operations needed' });
      }
    } catch (e) {
      handleIpcError(e, true); // Can retry
    } finally {
      removeListener();
    }
  };

  const handleConfirmOperations = () => {
    if (confirmedOperationsCallback) {
      confirmedOperationsCallback();
      setConfirmedOperationsCallback(null);
    }
  };

  const handleCancelOperations = () => {
    setShowOperationsSummary(false);
    setPendingOperations([]);
    setConfirmedOperationsCallback(null);
    setResponse("Verification cancelled.");
  };

  const handleDiscoverVersions = async () => {
    try {
      setResponse("Scanning for available versions...");
      const res = await requestWithRetry(
        () => window.electron.requestPython({
          command: 'discover_versions',
          url: manifestUrl
        }),
        true // Enable retry for version discovery
      ) as { result?: string[] };
      if (res.result) {
        const discovered = res.result;
        setAvailableVersions(discovered);
        if (discovered.length > 0) setSelectedVersion(discovered[0]);
        formatAndDisplayResponse('versions_discovered', { count: discovered.length });
      }
    } catch (e) {
      handleIpcError(e, true);
    }
  };

  const filteredVersions = useMemo(() => {
    if (showHistorical) return availableVersions;
    return availableVersions.slice(0, 1); // Only latest
  }, [availableVersions, showHistorical]);

  const handleDiscoverMirrors = async () => {
    setIsProbing(true);
    const defaultMirrors = [
      { url: 'https://fitgirl-repacks.site', weight: 10 },
      { url: 'https://elamigos.site', weight: 8 },
      { url: 'https://cs.rin.ru', weight: 5 }
    ];
    setDiscoveredMirrors(defaultMirrors);

    try {
      const res = await requestWithRetry(
        () => window.electron.requestPython({
          command: 'discover_mirrors',
          mirrors: defaultMirrors
        }),
        true // Enable retry for mirror discovery
      ) as { result?: MirrorResult[] };
      if (res.result && res.result.length > 0) {
        setDiscoveredMirrors(res.result);
        setSelectedMirror(res.result[0]); // Auto-select best mirror
        formatAndDisplayResponse('mirrors_discovered', { 
          count: res.result.length,
          healthy: res.result.filter(m => m.weight > 0).length 
        });
        // Show selector to allow manual override
        setShowMirrorSelector(true);
      }
    } catch (e) {
      handleIpcError(e, true);
      // Still show selector with default mirrors even if discovery fails
      setShowMirrorSelector(true);
    } finally {
      setIsProbing(false);
    }
  };

  const handleCloseMirrorSelector = () => {
    setShowMirrorSelector(false);
  };

  const handleSelectMirror = (mirror: MirrorResult) => {
    setSelectedMirror(mirror);
  };

  const handleStartUpdate = async () => {
    const id = Math.random().toString(36).substring(7);
    const startTime = Date.now();
    const removeListener = window.electron.onPythonProgress(id, (data) => {
      setProgress(data);
    });

    try {
      setResponse("Starting full update workflow...");
      setProgress({ status: 'initializing' });

      // Use retry for retryable errors
      const res = await requestWithRetry(
        () => window.electron.requestPython({
          command: 'start_update',
          game_dir: '.', 
          manifest_url: manifestUrl,
          version: selectedVersion || undefined,
          selected_packs: dlcs.filter(d => d.selected).map(d => d.folder),
          language: selectedLanguage,
          id
        }),
        true // Enable retry for start_update
      );

      // Parse update result
      const endTime = Date.now();
      const result: UpdateResult = {
        status: 'completed',
        operationsProcessed: res?.result?.processed || res?.result?.operationsProcessed || 0,
        operationsFailed: res?.result?.failed || res?.result?.operationsFailed || 0,
        startTime,
        endTime,
        errors: res?.result?.errors || [],
        summary: res?.result?.summary || 
                  `Successfully updated ${res?.result?.processed || 0} operation(s). ` +
                  `Failed: ${res?.result?.failed || 0}`
      };

      // Determine if partial or failed
      if (result.operationsFailed > 0) {
        result.status = result.operationsFailed === result.operationsProcessed ? 'failed' : 'partial';
      }

      setUpdateResult(result);
      setShowUpdateStatus(true);
      setProgress(null);

      // Format and display response
      formatAndDisplayResponse('update_complete', {
        operationsCount: result.operationsProcessed,
        failed: result.operationsFailed,
        duration: ((endTime - startTime) / 1000).toFixed(1)
      });
    } catch (e) {
      // Handle update failure
      const endTime = Date.now();
      const errorMsg = e instanceof Error ? e.message : String(e);
      
      const result: UpdateResult = {
        status: 'failed',
        operationsProcessed: 0,
        operationsFailed: 1,
        startTime,
        endTime,
        errors: [{ file: 'update_command', error: errorMsg }],
        summary: `Update failed: ${errorMsg}`
      };

      setUpdateResult(result);
      setShowUpdateStatus(true);
      setProgress(null);

      handleIpcError(e, true); // Can retry
    } finally {
      removeListener();
    }
  };

  const handleCloseUpdateStatus = () => {
    setShowUpdateStatus(false);
    setUpdateResult(null);
  };

  const handleRetryUpdate = () => {
    setShowUpdateStatus(false);
    setUpdateResult(null);
    handleStartUpdate();
  };

  return (
    <Environment isHealthy={isHealthy} isProbing={isProbing}>
      <CustomCursor isHealthy={isHealthy} isProbing={isProbing} />

      {/* Progress Indicator Overlay */}
      <AnimatePresence>
        {progress && <ProgressIndicator progress={progress} isVisible={!!progress} />}
      </AnimatePresence>

      {/* Retry Notification */}
      <RetryNotification
        isVisible={retryState.isVisible}
        attempt={retryState.attempt}
        maxAttempts={retryState.maxAttempts}
        nextRetryIn={retryState.nextRetryIn}
        lastError={retryState.lastError}
        onCancel={cancelRetry}
      />

      {/* Error Toast System */}
      <ErrorToast errors={errors} onDismiss={dismissError} />

      {/* Operations Summary Modal */}
      <OperationsSummary
        operations={pendingOperations}
        totalSize={pendingOperations.reduce((sum, op) => sum + (op.size || 0), 0)}
        isVisible={showOperationsSummary}
        onConfirm={handleConfirmOperations}
        onCancel={handleCancelOperations}
        isLoading={!!progress}
      />

      {/* Update Completion Status Modal */}
      <UpdateCompletionStatus
        result={updateResult}
        isVisible={showUpdateStatus}
        onClose={handleCloseUpdateStatus}
        onRetry={handleRetryUpdate}
      />

      {/* Mirror Selector Modal */}
      <MirrorSelector
        mirrors={discoveredMirrors}
        selectedMirror={selectedMirror}
        onSelect={handleSelectMirror}
        onClose={handleCloseMirrorSelector}
        isVisible={showMirrorSelector}
        isProbing={isProbing}
      />

      {/* TopShelf Navigation */}
      <TopShelf activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content Area with Page Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          className="min-h-screen flex flex-col p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Sims 4 Updater</h1>
          <div className="flex items-center gap-3">
            <span className="text-white/70">Backend Status:</span>
            <span className={`flex items-center gap-2 font-semibold ${isHealthy ? 'text-green-400' : 'text-red-400'}`}>
              <span className="text-2xl">●</span>
              {isHealthy ? 'Healthy' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Dashboard View */}
        <div className="space-y-8">
          {/* Configuration Section */}
          <VisionCard variant="elevated" className="border-white/20">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Configuration</h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={manifestUrl}
                    onChange={(e) => setManifestUrl(e.target.value)}
                    placeholder="Enter Manifest URL"
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <Button
                    onClick={handleDiscoverVersions}
                    variant="primary"
                  >
                    Discover Versions
                  </Button>
                </div>

                {availableVersions.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Target Version:</label>
                        <select
                          value={selectedVersion}
                          onChange={(e) => setSelectedVersion(e.target.value)}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          {filteredVersions.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-white/70 text-sm mb-2">Language:</label>
                        <select
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-white/70 cursor-pointer hover:text-white/90 transition-colors">
                      <input
                        type="checkbox"
                        checked={showHistorical}
                        onChange={(e) => setShowHistorical(e.target.checked)}
                        className="w-4 h-4 rounded bg-white/20 border border-white/30 checked:bg-blue-500"
                      />
                      Show Historical Versions
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Selection Summary */}
            <div className="mt-6 pt-6 border-t border-white/10 bg-white/5 rounded-lg p-4">
              <div className="text-white">
                <p className="font-semibold mb-2">Selection Summary</p>
                <p className="text-white/70 text-sm">
                  {selectionSummary.count} packs selected
                </p>
                <p className="text-lg font-bold text-green-400 mt-1">
                  {selectionSummary.size} GB required
                </p>
              </div>
            </div>
          </VisionCard>

          {/* Available Content Section */}
          <VisionCard variant="elevated">
            <h2 className="text-2xl font-semibold text-white mb-4">Available Content</h2>
            <DLCGrid dlcs={dlcs} onToggle={toggleDLC} />
          </VisionCard>

          {/* Action Buttons Section */}
          <div className="grid grid-cols-3 gap-4">
            <Button onClick={handlePing} variant="secondary">
              Ping Python
            </Button>
            <Button onClick={handleRefreshDLCs} variant="secondary">
              Refresh Content List
            </Button>
            <Button onClick={handleDiscoverMirrors} variant="secondary">
              Scan for Mirrors
            </Button>
          </div>

          {/* Queue Status */}
          {queueState.operations.length > 0 && (
            <motion.button
              onClick={() => setShowOperationQueue(!showOperationQueue)}
              className="w-full py-3 px-4 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-colors flex items-center justify-between"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>
                Operation Queue ({queueState.completedCount + queueState.failedCount}/{queueState.operations.length})
              </span>
              <span className="text-sm">
                {queueState.isRunning ? '⏸ Running' : '⏹ Paused'}
              </span>
            </motion.button>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handleVerify} variant="primary">
              Verify All
            </Button>
            <Button onClick={handleStartUpdate} variant="primary">
              Update Game
            </Button>
          </div>

          {/* Intelligence Hub */}
          <VisionCard variant="elevated">
            <h2 className="text-2xl font-semibold text-white mb-4">Intelligence Hub</h2>
            <ScraperViewfinder mirrors={discoveredMirrors} isProbing={isProbing} />
          </VisionCard>

          {/* Progress Display - Note: Component displays as floating overlay via ProgressIndicator */}

          {/* Response Output */}
          <ResponseDisplay response={response} isLoading={isProbing} />
        </div>
        </motion.div>
      </AnimatePresence>

      {/* Operation Queue Display */}
      <OperationQueue
        operations={queueState.operations}
        isRunning={queueState.isRunning}
        totalProgress={queueState.totalProgress}
        completedCount={queueState.completedCount}
        failedCount={queueState.failedCount}
        isVisible={showOperationQueue}
        onRemove={removeOperation}
        onPause={pauseQueue}
        onResume={resumeQueue}
        onCancel={cancelQueue}
        onClearCompleted={clearCompletedOperations}
      />

      {/* Diagnostic Console Overlay */}
      <DiagnosticConsole logs={logs} onClearLogs={handleClearLogs} />
    </Environment>
  );
};

export default App;