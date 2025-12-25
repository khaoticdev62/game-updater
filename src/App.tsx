import React, { useState, useEffect, useMemo } from 'react';
import DLCGrid from './components/DLCGrid';
import { DLC, ProgressData, MirrorResult } from './types';
import ScraperViewfinder from './components/ScraperViewfinder';
import DiagnosticConsole, { LogEntry } from './components/DiagnosticConsole';
import CustomCursor from './components/CustomCursor';
import Layout from './components/Layout';
import { 
  Settings, 
  Download, 
  ShieldCheck, 
  Activity, 
  Info,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';


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
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [dlcs, setDlcs] = useState<DLC[]>([
    { name: 'Get to Work', folder: 'EP01', status: 'Installed', selected: true, category: 'Expansion Packs', description: 'Rule the workplace with The Sims 4 Get to Work.' },
    { name: 'Get Together', folder: 'EP02', status: 'Missing', selected: false, category: 'Expansion Packs', description: 'Create Clubs for Sims where you set the rules.' },
    { name: 'City Living', folder: 'EP03', status: 'Missing', selected: false, category: 'Expansion Packs', description: 'Take your Sims to the city.' },
    { name: 'Vampires', folder: 'GP04', status: 'Missing', selected: false, category: 'Game Packs', description: 'Transform your Sims into powerful vampires.' },
    { name: 'Laundry Day', folder: 'SP13', status: 'Missing', selected: false, category: 'Stuff Packs', description: 'Surround your Sims in clean clothes.' },
    { name: 'Desert Luxe', folder: 'SP34', status: 'Missing', selected: false, category: 'Kits', description: 'Soak up the sun with indoor/outdoor pieces.' },
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
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} isHealthy={isHealthy}>
      <CustomCursor isHealthy={isHealthy} isProbing={isProbing} />
      
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <section className="bg-white/5 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Settings className="text-brand-accent" size={20} />
              Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Manifest URL</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={manifestUrl} 
                    onChange={(e) => setManifestUrl(e.target.value)}
                    placeholder="Enter URL"
                    className="flex-1 bg-black/40 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                  />
                  <button 
                    onClick={handleDiscoverVersions}
                    className="bg-brand-accent hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95"
                  >
                    Scan
                  </button>
                </div>
              </div>

              {availableVersions.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Target Version</label>
                      <select 
                        value={selectedVersion} 
                        onChange={(e) => setSelectedVersion(e.target.value)}
                        className="w-full bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
                      >
                        {filteredVersions.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Language</label>
                      <select 
                        value={selectedLanguage} 
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="w-full bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
                      >
                        {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <label className="flex items-center gap-3 group cursor-pointer">
                    <div className={`w-5 h-5 rounded border border-gray-600 flex items-center justify-center transition-all ${showHistorical ? 'bg-brand-accent border-brand-accent' : 'bg-black/40'}`}>
                      {showHistorical && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <input 
                      type="checkbox" 
                      checked={showHistorical} 
                      onChange={(e) => setShowHistorical(e.target.checked)} 
                      className="hidden"
                    />
                    <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">Show Historical Versions</span>
                  </label>
                </div>
              )}
            </div>

            <div className="mt-8 p-4 bg-brand-accent/5 border border-brand-accent/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handlePing}
                  className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                  title="Check Backend Connectivity"
                >
                  <RefreshCw size={18} className={isHealthy ? '' : 'text-brand-danger'} />
                </button>
                <div>
                  <p className="text-sm font-semibold text-gray-200">{selectionSummary.count} Content Packs Selected</p>
                  <p className="text-xs text-gray-500 mt-0.5">Estimated storage needed: {selectionSummary.size} GB</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleVerify}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-6 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                  Verify
                </button>
                <button 
                  onClick={handleStartUpdate}
                  className="bg-brand-accent hover:bg-blue-600 text-white px-8 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-brand-accent/20 active:scale-95"
                >
                  Update Now
                </button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-gray-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent">
                <Download size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Status</p>
                <p className="text-sm font-semibold">{progress ? progress.status : 'Ready'}</p>
              </div>
            </div>
            <div className="bg-white/5 border border-gray-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-success/10 rounded-full flex items-center justify-center text-brand-success">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Security</p>
                <p className="text-sm font-semibold">Guardian Active</p>
              </div>
            </div>
            <div className="bg-white/5 border border-gray-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-warning/10 rounded-full flex items-center justify-center text-brand-warning">
                <Info size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Latency</p>
                <p className="text-sm font-semibold">Optimized</p>
              </div>
            </div>
          </section>

          {progress && (
            <section className="bg-black/40 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-brand-success" />
                  Active Operation: {progress.status}
                </h4>
                {progress.current && (
                  <span className="text-xs font-mono text-brand-accent">{progress.current} / {progress.total}</span>
                )}
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-brand-accent h-full transition-all duration-300 ease-out" 
                  style={{ width: `${progress.current && progress.total ? (progress.current / progress.total) * 100 : 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-3 italic">{progress.file || progress.message}</p>
            </section>
          )}

          {response && (
            <section className="bg-black/60 rounded-2xl p-6 border border-gray-800">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                Server Response
                <button onClick={() => setResponse('')} className="text-[10px] hover:text-white transition-colors">Clear</button>
              </h4>
              <pre className="text-[11px] font-mono text-brand-success overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-40 custom-scrollbar">
                {response}
              </pre>
            </section>
          )}
        </div>
      )}

      {activeTab === 'dlcs' && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <DLCGrid dlcs={dlcs} onToggle={toggleDLC} />
        </div>
      )}

      {activeTab === 'discovery' && (
        <div className="animate-in zoom-in-95 duration-500">
          <ScraperViewfinder 
            mirrors={discoveredMirrors} 
            isProbing={isProbing} 
            onScan={handleDiscoverMirrors} 
          />
        </div>
      )}

      {activeTab === 'diagnostics' && (
        <div className="animate-in fade-in duration-500 h-full flex flex-col">
          <DiagnosticConsole logs={logs} />
        </div>
      )}

      {activeTab === 'mods' && (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
          <div className="w-20 h-20 bg-brand-warning/10 rounded-full flex items-center justify-center animate-bounce">
            <ShieldCheck size={40} className="text-brand-warning" />
          </div>
          <h3 className="text-xl font-bold">Mod Guardian</h3>
          <p className="text-gray-500 max-w-sm">This feature is currently protecting your game in the background. Full management UI coming soon.</p>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
          <div className="w-20 h-20 bg-brand-accent/10 rounded-full flex items-center justify-center spin-slow">
            <Settings size={40} className="text-brand-accent" />
          </div>
          <h3 className="text-xl font-bold">Application Settings</h3>
          <p className="text-gray-500 max-w-sm">Advanced configuration and updater preferences will be available here in the final release.</p>
        </div>
      )}
    </Layout>
  );
};

export default App;