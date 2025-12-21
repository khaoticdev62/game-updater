import React from 'react';

export interface DLC {
  name: string;
  folder: string;
  status: 'Installed' | 'Missing' | 'Update Available';
  selected: boolean;
}

interface DLCListProps {
  dlcs: DLC[];
  onToggle: (folder: string) => void;
}

const DLCList: React.FC<DLCListProps> = ({ dlcs, onToggle }) => {
  return (
    <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee' }}>
            <th style={{ textAlign: 'left' }}>Select</th>
            <th style={{ textAlign: 'left' }}>DLC Name</th>
            <th style={{ textAlign: 'left' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {dlcs.map((dlc) => (
            <tr key={dlc.folder} style={{ borderBottom: '1px solid #eee' }}>
              <td>
                <input
                  type="checkbox"
                  checked={dlc.selected}
                  onChange={() => onToggle(dlc.folder)}
                />
              </td>
              <td>{dlc.name}</td>
              <td style={{ 
                color: dlc.status === 'Installed' ? 'green' : 
                       dlc.status === 'Missing' ? 'red' : 'orange' 
              }}>
                {dlc.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DLCList;
