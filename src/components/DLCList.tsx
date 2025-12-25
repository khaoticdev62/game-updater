import React from 'react';
import { DLC } from '../types';
import { Calendar, CheckCircle2, Circle } from 'lucide-react';

interface DLCListProps {
  dlcs: DLC[];
  onToggle: (folder: string) => void;
}

const DLCList: React.FC<DLCListProps> = ({ dlcs, onToggle }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-800 bg-white/5 backdrop-blur-sm shadow-xl">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-black/20">
              <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Select</th>
              <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Content Name</th>
              <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Status</th>
              <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Release Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {dlcs.map((dlc) => (
              <tr 
                key={dlc.folder} 
                onClick={() => onToggle(dlc.folder)}
                className={`group transition-colors cursor-pointer ${dlc.selected ? 'bg-brand-accent/5' : 'hover:bg-white/[0.02]'}`}
                title={dlc.description}
              >
                <td className="px-6 py-4">
                  <div className={`transition-all duration-200 ${dlc.selected ? 'text-brand-accent scale-110' : 'text-gray-700'}`}>
                    {dlc.selected ? <CheckCircle2 size={18} fill="currentColor" className="text-brand-dark" /> : <Circle size={18} />}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className={`font-semibold transition-colors ${dlc.selected ? 'text-white' : 'text-gray-300'}`}>{dlc.name}</span>
                    <span className="text-[10px] font-mono text-gray-600 uppercase mt-0.5">{dlc.folder}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                    dlc.status === 'Installed' 
                      ? 'text-brand-success border-brand-success/20 bg-brand-success/5' 
                      : dlc.status === 'Missing' 
                        ? 'text-brand-danger border-brand-danger/20 bg-brand-danger/5' 
                        : 'text-brand-warning border-brand-warning/20 bg-brand-warning/5'
                  }`}>
                    {dlc.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {dlc.release_date ? (
                    <div className="flex items-center gap-2 text-gray-500 text-[11px] font-mono">
                      <Calendar size={12} className="text-gray-700" />
                      {dlc.release_date}
                    </div>
                  ) : (
                    <span className="text-gray-700 text-[10px]">--</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DLCList;
