import React, { useState, useEffect } from 'react';
import DLCList, { DLC } from './components/DLCList';

const App = () => {
  const [response, setResponse] = useState<string>('');
  const [progress, setProgress] = useState<any>(null);
  const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [dlcs, setDlcs] = useState<DLC[]>([
    { name: 'Get to Work', folder: 'EP01', status: 'Installed', selected: true },
    { name: 'Get Together', folder: 'EP02', status: 'Missing', selected: false },
    { name: 'City Living', folder: 'EP03', status: 'Missing', selected: false },
  ]);

  // Health Polling Logic
  useEffect(() => {
    const poll = async () => {
      try {
        const start = Date.now();
        await window.electron.requestPython({ command: 'ping' });
        const latency = Date.now() - start;
        setIsHealthy(latency < 1000);
      } catch (e) {
        setIsHealthy(false);
      }
    };

    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, []);

  const mockManifestUrl = "https://jsonplaceholder.typicode.com/todos/1"; // Public static JSON endpoint

  const handlePing = async () => {
    try {
      const res = await window.electron.requestPython({ command: 'ping' });
      setResponse(JSON.stringify(res));
    } catch (e) {
      setResponse(`Error: ${e}`);
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
        manifest_url: mockManifestUrl,
        id 
      });
      setResponse(JSON.stringify(res, null, 2));
    } catch (e) {
      setResponse(`Error: ${e}`);
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
        manifest_url: mockManifestUrl,
        id 
      });
      setResponse(JSON.stringify(res, null, 2));
    } catch (e) {
      setResponse(`Error: ${e}`);
    } finally {
      removeListener();
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
        manifest_url: mockManifestUrl,
        id
      });
      setResponse(JSON.stringify(res, null, 2));
    } catch (e) {
      setResponse(`Error: ${e}`);
    } finally {
      removeListener();
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
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
        <h3>Available Content</h3>
        <DLCList dlcs={dlcs} onToggle={toggleDLC} />
      </section>

      <section style={{ marginBottom: '20px' }}>
        <button onClick={handlePing}>Ping Python</button>
        <button onClick={handleVerify} style={{ marginLeft: '10px' }}>Verify All (Live Mock)</button>
        <button onClick={handleUpdate} style={{ marginLeft: '10px' }}>Start Mock Update (Live Mock)</button>
        <button onClick={handleStartUpdate} style={{ marginLeft: '10px', fontWeight: 'bold' }}>Update Game (Live Mock)</button>
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