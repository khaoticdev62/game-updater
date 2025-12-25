import React from 'react';
import { DLC } from '../types';

interface DLCGridProps {
  dlcs: DLC[];
  onToggle: (folder: string) => void;
}

const DLCGrid: React.FC<DLCGridProps> = ({ dlcs, onToggle }) => {
  // Group DLCs by category
  const categories: { [key: string]: DLC[] } = {};
  dlcs.forEach(dlc => {
    const cat = dlc.category || 'Other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(dlc);
  });

  return (
    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
      {Object.entries(categories).map(([catName, items]) => (
        <div key={catName} style={{ marginBottom: '20px' }}>
          <h4 style={{ borderBottom: '1px solid #444', paddingBottom: '5px', color: '#3498db' }}>
            {catName} ({items.length})
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '10px' 
          }}>
            {items.map(dlc => (
              <div 
                key={dlc.folder} 
                onClick={() => onToggle(dlc.folder)}
                style={{
                  background: dlc.selected ? '#2c3e50' : '#1a1a1a',
                  border: `1px solid ${dlc.selected ? '#3498db' : '#333'}`,
                  padding: '10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{dlc.name}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>{dlc.folder}</div>
                <div style={{ 
                  fontSize: '11px', 
                  marginTop: '5px',
                  color: dlc.status === 'Installed' ? '#2ecc71' : 
                         dlc.status === 'Missing' ? '#e74c3c' : '#f1c40f' 
                }}>
                  {dlc.status}
                </div>
                {dlc.selected && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '5px', 
                    right: '5px', 
                    color: '#3498db' 
                  }}>✓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DLCGrid;
