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

        dlcs: dlcs.map(d => ({ name: d.name, folder: d.folder })),

        patch: {

          files: [

            { name: 'updater_readme.txt', MD5_to: 'SOMEHASH', type: 'full' }

          ]

        }

      };

  

      const id = Math.random().toString(36).substring(7);

      const removeListener = window.electron.onPythonProgress(id, (data) => {

        setProgress(data);

      });

  

      try {

        const res = await window.electron.requestPython({ 

          command: 'verify_all', 

          game_dir: '.', 

          manifest: JSON.stringify(manifest),

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

  

        // In a real app, we'd use the operations from handleVerify

  

        const mockOps = [

  

          { type: 'download_full', file: 'test_download.txt', target_md5: 'NONE' }

  

        ];

  

        

  

        // We need to pass the real URL if we want it to actually download

  

        // Since our update_logic.py currently mocks the URL, let's just test that the loop works.

  

        // If we want a real download, we'd need to update update_logic.py to accept URLs.

  

        

  

        const manifest = { version: '1.0', patch: { files: [] as any[] } };

  

    

      const id = Math.random().toString(36).substring(7);

      

      const removeListener = window.electron.onPythonProgress(id, (data) => {

        setProgress(data);

      });

  

      try {

        setResponse("Starting update...");

        const res = await window.electron.requestPython({ 

          command: 'apply_update', 

          game_dir: '.', 

          manifest: JSON.stringify(manifest),

          operations: mockOps,

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

          <button onClick={handleUpdate} style={{ marginLeft: '10px', fontWeight: 'bold' }}>Start Update (Mock)</button>

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
