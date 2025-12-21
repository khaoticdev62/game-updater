import React, { useState } from 'react';
import DLCList, { DLC } from './components/DLCList';

const App = () => {
  const [response, setResponse] = useState<string>('');
  const [progress, setProgress] = useState<any>(null);
  const [dlcs, setDlcs] = useState<DLC[]>([
    { name: 'Get to Work', folder: 'EP01', status: 'Installed', selected: true },
    { name: 'Get Together', folder: 'EP02', status: 'Missing', selected: false },
    { name: 'City Living', folder: 'EP03', status: 'Missing', selected: false },
  ]);

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

    const manifest = {
      version: '1.0',
      patch: {
        files: [
          { name: 'updater_readme.txt', MD5_to: 'SOMEHASH', type: 'full' }
        ]
      }
    };

    // We need a way to get the request ID before sending, or let the request return it
    // For now, let's modify index.ts to return the ID or just use a fixed one for testing
    // Actually, let's just use a random ID in the renderer and pass it
    const id = Math.random().toString(36).substring(7);
    
    const removeListener = window.electron.onPythonProgress(id, (data) => {
      setProgress(data);
    });

    try {
      const res = await window.electron.requestPython({ 
        command: 'verify_all', 
        game_dir: '.', 
        manifest: JSON.stringify(manifest),
        id // Pass our ID
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
      
      <section style={{ marginBottom: '20px' }}>
        <h3>Available Content</h3>
        <DLCList dlcs={dlcs} onToggle={toggleDLC} />
      </section>

      <section style={{ marginBottom: '20px' }}>
        <button onClick={handlePing}>Ping Python</button>
        <button onClick={handleVerify} style={{ marginLeft: '10px' }}>Verify All (Mock)</button>
      </section>

      {progress && (
        <div style={{ padding: '10px', background: '#f0f0f0', marginBottom: '10px' }}>
          Progress: {progress.current} / {progress.total} - {progress.file}
        </div>
      )}
      
      <pre style={{ background: '#eee', padding: '10px', overflowX: 'auto' }}>
        {response}
      </pre>
    </div>
  );
};

export default App;
