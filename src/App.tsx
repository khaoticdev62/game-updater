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
        // This manifest URL would be configured by the user or dynamically obtained
        const mockManifestUrl = "http://test.com/live_manifest.json"; 
        
        // Example manifest content for the mock API to serve
        const mockManifestContent = {
          version: '1.0',
          dlcs: dlcs.map(d => ({ name: d.name, folder: d.folder })),
          patch: {
            files: [
              { name: 'updater_readme.txt', MD5_to: 'SOMEHASH', type: 'full', url: 'http://test.com/mock_file_full.zip' }
            ]
          }
        };
        
        // Mock the ManifestFetcher and URLResolver calls in the backend
        // For this frontend test, we just pass the URL
        // The actual HTTP requests will be mocked by pytest-httpx in backend tests.
    
        const id = Math.random().toString(36).substring(7);
        const removeListener = window.electron.onPythonProgress(id, (data) => {
          setProgress(data);
        });
    
        try {
          const res = await window.electron.requestPython({ 
            command: 'verify_all', 
            game_dir: '.', 
            manifest_url: mockManifestUrl, // Pass URL
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
        const mockManifestUrl = "http://test.com/live_manifest.json";
        const mockOperations = [
          { type: 'download_full', file: 'test_download.txt', target_md5: 'NONE', url: 'http://test.com/test_download.txt' }
        ];
        
        const id = Math.random().toString(36).substring(7);
        const removeListener = window.electron.onPythonProgress(id, (data) => {
          setProgress(data);
        });
    
        try {
          setResponse("Starting update...");
          const res = await window.electron.requestPython({ 
            command: 'apply_update', 
            game_dir: '.', 
            manifest_url: mockManifestUrl, // Pass URL
            operations: mockOperations,
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
        const mockManifestUrl = "http://test.com/live_manifest.json"; // This will be fetched by Python

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

        

        <section style={{ marginBottom: '20px' }}>

          <h3>Available Content</h3>

          <DLCList dlcs={dlcs} onToggle={toggleDLC} />

        </section>

  

              <section style={{ marginBottom: '20px' }}>

  

                <button onClick={handlePing}>Ping Python</button>

  

                <button onClick={handleVerify} style={{ marginLeft: '10px' }}>Verify All (Mock)</button>

  

                <button onClick={handleUpdate} style={{ marginLeft: '10px' }}>Start Mock Update</button>

  

                <button onClick={handleStartUpdate} style={{ marginLeft: '10px', fontWeight: 'bold' }}>Update Game</button>

  

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
