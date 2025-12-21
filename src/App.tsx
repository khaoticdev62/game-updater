import React, { useState } from 'react';

const App = () => {
  const [response, setResponse] = useState<string>('');

  const [progress, setProgress] = useState<any>(null);

  const handlePing = async () => {
    try {
      const res = await window.electron.requestPython({ command: 'ping' });
      setResponse(JSON.stringify(res));
    } catch (e) {
      setResponse(`Error: ${e}`);
    }
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
    <div>
      <h1>Sims 4 Updater</h1>
      <p>Welcome to the rebuilt updater.</p>
      <button onClick={handlePing}>Ping Python</button>
      <button onClick={handleVerify}>Verify All (Mock)</button>
      {progress && (
        <div>
          Progress: {progress.current} / {progress.total} - {progress.file}
        </div>
      )}
      <pre>{response}</pre>
    </div>
  );
};

export default App;
