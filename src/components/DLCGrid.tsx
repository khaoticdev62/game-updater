import React from 'react';
import { DLC } from '../types';
import { Calendar, CheckCircle2, Circle, Download } from 'lucide-react';

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
    <div className="space-y-10 animate-in fade-in duration-700">
      {Object.entries(categories).map(([catName, items]) => (
        <div key={catName}>
          <div className="flex items-center gap-4 mb-6">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">
              {catName}
            </h4>
            <div className="h-[1px] flex-1 bg-gray-800" />
            <span className="text-[10px] font-mono text-gray-600 bg-white/5 px-2 py-0.5 rounded border border-white/5">
              {items.length} UNITS
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(dlc => (
              <div 
                key={dlc.folder} 
                onClick={() => onToggle(dlc.folder)}
                title={dlc.description}
                className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 cursor-pointer hover:shadow-2xl ${
                  dlc.selected 
                    ? 'bg-brand-accent/10 border-brand-accent shadow-brand-accent/5' 
                    : 'bg-white/5 border-gray-800 hover:border-gray-600 hover:bg-white/[0.07]'
                }`}
              >
                {/* Background Decor */}
                <div className={`absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500 ${dlc.selected ? 'text-brand-accent' : 'text-gray-600'}`}>
                  <Download size={80} />
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-sm text-gray-100 truncate group-hover:text-white transition-colors">
                        {dlc.name}
                      </h5>
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-mono tracking-tighter">
                        <span className="text-gray-500">{dlc.folder}</span>
                        {dlc.release_date && (
                          <>
                            <span className="text-gray-700">|</span>
                            <span className="flex items-center gap-1 text-gray-500">
                              <Calendar size={10} />
                              {dlc.release_date}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className={`transition-transform duration-300 ${dlc.selected ? 'scale-110 text-brand-accent' : 'text-gray-700 group-hover:text-gray-500'}`}>
                      {dlc.selected ? <CheckCircle2 size={18} fill="currentColor" className="text-brand-dark" /> : <Circle size={18} />}
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      dlc.status === 'Installed' 
                        ? 'text-brand-success border-brand-success/20 bg-brand-success/5' 
                        : dlc.status === 'Missing' 
                          ? 'text-brand-danger border-brand-danger/20 bg-brand-danger/5' 
                          : 'text-brand-warning border-brand-warning/20 bg-brand-warning/5'
                    }`}>
                      {dlc.status.toUpperCase()}
                    </span>
                    
                    {dlc.selected && (
                      <span className="text-[9px] text-brand-accent font-bold tracking-widest animate-pulse">
                        READY_TO_PATCH
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DLCGrid;
