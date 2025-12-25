import React, { useState, useEffect, useMemo } from 'react';
import DLCGrid from './components/DLCGrid';
import { DLC } from './types';
import ScraperViewfinder, { MirrorResult } from './components/ScraperViewfinder';
import DiagnosticConsole, { LogEntry } from './components/DiagnosticConsole';
import CustomCursor from './components/CustomCursor';

interface ProgressData {
  status: string;
  current?: number;
  total?: number;
  file?: string;
  message?: string;
}

const App = () => {
  const [response, setResponse] = useState<string>('');
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [discoveredMirrors, setDiscoveredMirrors] = useState<MirrorResult[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
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

  // Logic to calculate estimated space (Simplified UI-side)
  const selectionSummary = useMemo(() => {
    const selectedCount = dlcs.filter(d => d.selected).length;
    // Mock estimate: 2GB per DLC
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

  const handleIpcError = (e: unknown) => {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('timed out')) {
      setIsHealthy(false);
      setResponse(`Backend Timeout: The request took too long. Check the logs for details.`);
    } else {
      setResponse(`Communication Error: ${msg}`);
    }
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

  const handleUpdate = async () => {
    // This button will now trigger the full orchestrated update workflow, similar to handleStartUpdate
    // but without needing to fetch the manifest again, as it's already done in handleVerify.
    // For now, we'll make it call start_update for consistency with the new sidecar logic.
    const id = Math.random().toString(36).substring(7);
    const removeListener = window.electron.onPythonProgress(id, (data) => {
      setProgress(data);
    });

    try {
      setResponse("Starting mock update...");
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
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <CustomCursor isHealthy={isHealthy} isProbing={isProbing} />
      <h1>Sims 4 Updater</h1>
      <div style={{ marginBottom: '10px' }}>
        Backend Status: 
        <span style={{ 
          color: isHealthy ? '#2ecc71' : '#e74c3c', 
          fontWeight: 'bold',
          marginLeft: '5px'
        }}>
          {isHealthy ? '● Healthy' : '● Disconnected'}
        </span>
      </div>
      
      <section style={{ marginBottom: '20px' }}>
        <h3>Configuration</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            value={manifestUrl} 
            onChange={(e) => setManifestUrl(e.target.value)}
            placeholder="Enter Manifest URL"
            style={{ width: '300px', padding: '5px' }}
          />
          <button onClick={handleDiscoverVersions}>Discover Versions</button>
        </div>
        {availableVersions.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <label>Target Version: </label>
            <select value={selectedVersion} onChange={(e) => setSelectedVersion(e.target.value)} style={{ padding: '5px', marginRight: '20px' }}>
              {filteredVersions.map(v => <option key={v} value={v}>{v}</option>)}
            </select>

            <label style={{ marginRight: '20px' }}>
              <input 
                type="checkbox" 
                checked={showHistorical} 
                onChange={(e) => setShowHistorical(e.target.checked)} 
              />
              Show Historical Versions
            </label>

            <label>Language: </label>
            <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} style={{ padding: '5px' }}>
              {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
        )}
        <div style={{ marginTop: '15px', padding: '10px', background: '#2c3e50', borderRadius: '4px', border: '1px solid #3498db' }}>
          <strong>Selection Summary:</strong> {selectionSummary.count} packs selected. 
          Estimated space required: <span style={{ color: '#2ecc71' }}>{selectionSummary.size} GB</span>
        </div>
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h3>Available Content</h3>
        <DLCGrid dlcs={dlcs} onToggle={toggleDLC} />
      </section>

      <section style={{ marginBottom: '20px' }}>
        <button onClick={handlePing}>Ping Python</button>
        <button onClick={handleRefreshDLCs} style={{ marginLeft: '10px' }}>Refresh Content List</button>
        <button onClick={handleVerify} style={{ marginLeft: '10px' }}>Verify All (Live Mock)</button>
        <button onClick={handleUpdate} style={{ marginLeft: '10px' }}>Start Mock Update (Live Mock)</button>
        <button onClick={handleStartUpdate} style={{ marginLeft: '10px', fontWeight: 'bold' }}>Update Game (Live Mock)</button>
        <button onClick={handleDiscoverMirrors} style={{ marginLeft: '10px', background: '#2980b9', color: 'white' }}>Scan for Mirrors</button>
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h3>Intelligence Hub</h3>
        <ScraperViewfinder mirrors={discoveredMirrors} isProbing={isProbing} />
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h3>Diagnostic Console</h3>
        <DiagnosticConsole logs={logs} />
      </section>

      {progress && (
        <div style={{ padding: '10px', background: '#f0f0f0', marginBottom: '10px' }}>
          Progress: {progress.status} {progress.current ? `${progress.current} / ${progress.total}` : ''} - {progress.file || progress.message}
        </div>
      )}
      
      <pre style={{ background: '#eee', padding: '10px', overflowX: 'auto' }}>
        {response}
      </pre>
    </div>
  );
};

export default App;