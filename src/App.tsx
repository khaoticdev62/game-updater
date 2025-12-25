import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DLCGrid from './components/DLCGrid';
import { DLC } from './types';
import ScraperViewfinder, { MirrorResult } from './components/ScraperViewfinder';
import DiagnosticConsole, { LogEntry } from './components/DiagnosticConsole';
import { ProgressIndicator } from './components/ProgressIndicator';
import { ErrorToast, ErrorMessage } from './components/ErrorToast';
import CustomCursor from './components/CustomCursor';
import { Environment } from './components/Environment';
import { TopShelf } from './components/TopShelf';
import { VisionCard } from './components/VisionCard';
import { Button } from './components/Button';

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
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [errors, setErrors] = useState<ErrorMessage[]>([]);
  const [manifestUrl, setManifestUrl] = useState<string>('');
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [showHistorical, setShowHistorical] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en_US');
  const [dlcs, setDlcs] = useState<DLC[]>([
    { name: 'Get to Work', folder: 'EP01', status: 'Installed', selected: true, category: 'Expansion Packs' },
    { name: 'Get Together', folder: 'EP02', status: 'Missing', selected: false, category: 'Expansion Packs' },
    { name: 'City Living', folder: 'EP03', status: 'Missing', selected: false, category: 'Expansion Packs' },
    { name: 'Vampires', folder: 'GP04', status: 'Missing', selected: false, category: 'Game Packs' },
    { name: 'Laundry Day', folder: 'SP13', status: 'Missing', selected: false, category: 'Stuff Packs' },
    { name: 'Desert Luxe', folder: 'SP34', status: 'Missing', selected: false, category: 'Kits' },
  ]);

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

  const handleIpcError = (e: unknown) => {
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
      addError('TIMEOUT_ERROR', 'Backend request timed out', 'The request took too long to complete. Check the backend status and try again.');
      setIsHealthy(false);
    } else if (msg.includes('Network') || msg.includes('network')) {
      addError('NETWORK_ERROR', 'Network connection error', msg);
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
      const res = await window.electron.requestPython({ command: 'ping' });
      setResponse(JSON.stringify(res));
    } catch (e) {
      handleIpcError(e);
    }
  };

  const toggleDLC = (folder: string) => {
    setDlcs(prev => prev.map(d => d.folder === folder ? { ...d, selected: !d.selected } : d));
  };

  const handleRefreshDLCs = async () => {
    try {
      setResponse("Scanning for installed and missing content...");
      const res = await window.electron.requestPython({
        command: 'get_dlc_status',
        game_dir: '.',
        manifest_url: manifestUrl
      }) as { result: DLC[] };
      
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
        setResponse(`Discovered ${updatedDlcs.length} total packs.`);
      }
    } catch (e) {
      handleIpcError(e);
    }
  };

  const handleVerify = async () => {
    const id = Math.random().toString(36).substring(7);
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
      setResponse(JSON.stringify(res, null, 2));
    } catch (e) {
      handleIpcError(e);
    } finally {
      removeListener();
    }
  };

  const handleDiscoverVersions = async () => {
    try {
      setResponse("Scanning for available versions...");
      const res = await window.electron.requestPython({
        command: 'discover_versions',
        url: manifestUrl
      }) as { result?: string[] };
      if (res.result) {
        const discovered = res.result;
        setAvailableVersions(discovered);
        if (discovered.length > 0) setSelectedVersion(discovered[0]);
        setResponse(`Discovered ${discovered.length} versions.`);
      }
    } catch (e) {
      handleIpcError(e);
    }
  };

  const filteredVersions = useMemo(() => {
    if (showHistorical) return availableVersions;
    return availableVersions.slice(0, 1); // Only latest
  }, [availableVersions, showHistorical]);

  const handleDiscoverMirrors = async () => {
    setIsProbing(true);
    setDiscoveredMirrors([
      { url: 'https://fitgirl-repacks.site', weight: 10 },
      { url: 'https://elamigos.site', weight: 8 },
      { url: 'https://cs.rin.ru', weight: 5 }
    ]);

    try {
      const res = await window.electron.requestPython({
        command: 'discover_mirrors',
        mirrors: [
          { url: 'https://fitgirl-repacks.site', weight: 10 },
          { url: 'https://elamigos.site', weight: 8 },
          { url: 'https://cs.rin.ru', weight: 5 }
        ]
      }) as { result?: MirrorResult[] };
      if (res.result) {
        setDiscoveredMirrors(res.result);
      }
    } catch (e) {
      handleIpcError(e);
    } finally {
      setIsProbing(false);
    }
  };

  const handleStartUpdate = async () => {
    const id = Math.random().toString(36).substring(7);
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
      setResponse(JSON.stringify(res, null, 2));
    } catch (e) {
      handleIpcError(e);
    } finally {
      removeListener();
    }
  };

  return (
    <Environment isHealthy={isHealthy} isProbing={isProbing}>
      <CustomCursor isHealthy={isHealthy} isProbing={isProbing} />

      {/* Progress Indicator Overlay */}
      <AnimatePresence>
        {progress && <ProgressIndicator progress={progress} isVisible={!!progress} />}
      </AnimatePresence>

      {/* Error Toast System */}
      <ErrorToast errors={errors} onDismiss={dismissError} />

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
          <div className="glass-medium rounded-lg p-4 border border-white/20 max-h-64 overflow-auto">
            <p className="text-white/50 text-sm font-mono whitespace-pre-wrap break-words">
              {response}
            </p>
          </div>
        </div>
        </motion.div>
      </AnimatePresence>

      {/* Diagnostic Console Overlay */}
      <DiagnosticConsole logs={logs} onClearLogs={handleClearLogs} />
    </Environment>
  );
};

export default App;