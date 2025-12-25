import React, { useEffect, useRef } from 'react';

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  logger: string;
}

interface DiagnosticConsoleProps {
  logs: LogEntry[];
}

const DiagnosticConsole: React.FC<DiagnosticConsoleProps> = ({ logs }) => {
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return '#e74c3c';
      case 'WARNING': return '#f1c40f';
      case 'DEBUG': return '#95a5a6';
      default: return '#3498db';
    }
  };

  return (
    <div style={{ 
      background: '#000', 
      color: '#fff', 
      padding: '10px', 
      borderRadius: '4px', 
      fontFamily: 'Consolas, monospace',
      fontSize: '11px',
      height: '150px',
      overflowY: 'auto',
      border: '1px solid #444'
    }}>
      {logs.map((log, i) => (
        <div key={i} style={{ marginBottom: '2px', lineBreak: 'anywhere' }}>
          <span style={{ color: '#888' }}>[{log.timestamp.split('T')[1].split('.')[0]}]</span>
          <span style={{ color: getLevelColor(log.level), fontWeight: 'bold', margin: '0 5px' }}>{log.level}</span>
          <span style={{ color: '#aaa' }}>({log.logger})</span>: {log.message}
        </div>
      ))}
      <div ref={consoleEndRef} />
    </div>
  );
};

export default DiagnosticConsole;
