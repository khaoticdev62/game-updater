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
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      isHealthy={isHealthy}
      onRefresh={handlePing}
    >
      <CustomCursor isHealthy={isHealthy} isProbing={isProbing} />
      
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <section className="bg-white/5 border border-gray-800 rounded-2xl p-8 shadow-xl backdrop-blur-md relative overflow-hidden group">
            {/* Background Accent Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
            
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-accent/10 rounded-lg flex items-center justify-center">
                <Settings className="text-brand-accent" size={18} />
              </div>
              Core Configuration
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
              <div className="space-y-4">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Manifest Update Source</label>
                <div className="flex gap-2 p-1.5 bg-black/40 border border-gray-700/50 rounded-xl focus-within:border-brand-accent transition-all duration-300">
                  <input 
                    type="text" 
                    value={manifestUrl} 
                    onChange={(e) => setManifestUrl(e.target.value)}
                    placeholder="https://example.com/manifest.json"
                    className="flex-1 bg-transparent px-4 py-2 text-sm text-gray-200 focus:outline-none placeholder:text-gray-700"
                  />
                  <button 
                    onClick={handleDiscoverVersions}
                    className="bg-brand-accent hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-brand-accent/20 active:scale-95 flex items-center gap-2"
                  >
                    <RefreshCw size={14} />
                    Sync
                  </button>
                </div>
                <p className="text-[10px] text-gray-600 ml-1 italic">Point to a valid Sims 4 manifest to begin scanning for updates.</p>
              </div>

              {availableVersions.length > 0 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Target Version</label>
                      <select 
                        value={selectedVersion} 
                        onChange={(e) => setSelectedVersion(e.target.value)}
                        className="w-full bg-black/40 border border-gray-700/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent transition-all appearance-none cursor-pointer hover:bg-black/60"
                      >
                        {filteredVersions.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Language Sector</label>
                      <select 
                        value={selectedLanguage} 
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="w-full bg-black/40 border border-gray-700/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent transition-all appearance-none cursor-pointer hover:bg-black/60"
                      >
                        {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 group cursor-pointer">
                      <div className={`w-5 h-5 rounded-md border border-gray-700 flex items-center justify-center transition-all duration-300 ${showHistorical ? 'bg-brand-accent border-brand-accent shadow-lg shadow-brand-accent/20' : 'bg-black/40 group-hover:border-gray-500'}`}>
                        {showHistorical && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <input 
                        type="checkbox" 
                        checked={showHistorical} 
                        onChange={(e) => setShowHistorical(e.target.checked)} 
                        className="hidden"
                      />
                      <span className="text-xs font-medium text-gray-500 group-hover:text-gray-300 transition-colors">Show Legacy Patches</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 p-6 bg-gradient-to-r from-brand-accent/[0.03] to-transparent border border-brand-accent/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-500 group-hover:border-brand-accent/20">
              <div className="flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-brand-dark bg-gray-800 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-accent/40" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-200 tracking-tight">{selectionSummary.count} Units Selected for Deployment</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-mono">Estimated allocation: {selectionSummary.size} GB</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={handleVerify}
                  className="flex-1 sm:flex-none bg-white/5 hover:bg-white/10 text-gray-300 px-8 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/5 active:scale-95"
                >
                  Analyze Files
                </button>
                <button 
                  onClick={handleStartUpdate}
                  className="flex-1 sm:flex-none bg-brand-accent hover:bg-blue-600 text-white px-10 py-2.5 rounded-xl text-xs font-black transition-all shadow-xl shadow-brand-accent/20 active:scale-95 uppercase tracking-widest"
                >
                  Initiate Sync
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
        <div className="animate-in fade-in duration-500 h-[70vh] flex flex-col">
          <DiagnosticConsole logs={logs} onClear={() => setLogs([])} />
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