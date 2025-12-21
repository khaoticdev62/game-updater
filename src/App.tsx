import React, { useState } from 'react';

const App = () => {
  const [response, setResponse] = useState<string>('');

  const handlePing = async () => {
    try {
      const res = await window.electron.requestPython({ command: 'ping' });
      setResponse(JSON.stringify(res));
    } catch (e) {
      setResponse(`Error: ${e}`);
    }
  };

  return (
    <div>
      <h1>Sims 4 Updater</h1>
      <p>Welcome to the rebuilt updater.</p>
      <button onClick={handlePing}>Ping Python</button>
      <pre>{response}</pre>
    </div>
  );
};

export default App;
