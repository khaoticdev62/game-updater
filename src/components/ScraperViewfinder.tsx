import React from 'react';

export interface MirrorResult {
  url: string;
  weight: number;
  available?: boolean;
  latency?: number;
  error?: string;
}

interface ScraperViewfinderProps {
  mirrors: MirrorResult[];
  isProbing: boolean;
}

const ScraperViewfinder: React.FC<ScraperViewfinderProps> = ({ mirrors, isProbing }) => {
  return (
    <div style={{ 
      background: '#1a1a1a', 
      color: '#00ff00', 
      padding: '15px', 
      borderRadius: '8px', 
      fontFamily: 'monospace',
      fontSize: '12px',
      border: '1px solid #333',
      maxHeight: '200px',
      overflowY: 'auto'
    }}>
      <div style={{ borderBottom: '1px solid #333', marginBottom: '10px', paddingBottom: '5px', fontWeight: 'bold' }}>
        INTEL VIEW_FINDER {isProbing ? '[SCANNING...]' : '[READY]'}
      </div>
      {mirrors.map((m, i) => (
        <div key={i} style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
          <span>{'>'} {m.url} (w:{m.weight})</span>
          <span style={{ 
            color: m.available === true ? '#2ecc71' : m.available === false ? '#e74c3c' : '#f1c40f' 
          }}>
            {m.available === true ? `[OK] ${m.latency?.toFixed(3)}s` : m.available === false ? '[FAIL]' : '[PROBING]'}
          </span>
        </div>
      ))}
      {mirrors.length === 0 && <div style={{ color: '#666' }}>No mirrors identified.</div>}
    </div>
  );
};

export default ScraperViewfinder;
