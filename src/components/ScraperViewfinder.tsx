import React from 'react';
import { MirrorResult } from '../types';
import { Search } from 'lucide-react';

interface ScraperViewfinderProps {
  mirrors: MirrorResult[];
  isProbing: boolean;
  onScan?: () => void;
}

const ScraperViewfinder: React.FC<ScraperViewfinderProps> = ({ mirrors, isProbing, onScan }) => {
  return (
    <div className="bg-black/40 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
          <Search size={16} className="text-brand-accent" />
          Intel Viewfinder {isProbing ? '[Scanning...]' : '[Ready]'}
        </h3>
        {onScan && (
          <button 
            onClick={onScan}
            disabled={isProbing}
            aria-label="Scan for new content mirrors"
            className="text-xs bg-brand-accent/10 hover:bg-brand-accent text-brand-accent hover:text-white px-3 py-1 rounded transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand-accent disabled:opacity-50"
          >
            Trigger Re-Scan
          </button>
        )}
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar font-mono text-[11px]">
        {mirrors.map((m, i) => (
          <div key={i} className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/5 hover:border-gray-700 transition-colors">
            <span className="text-gray-400">
              <span className="text-brand-accent mr-2">{'>'}</span>
              {m.url} 
              <span className="text-gray-600 ml-2">(weight:{m.weight})</span>
            </span>
            <span className={`font-bold ${
              m.available === true ? 'text-brand-success' : m.available === false ? 'text-brand-danger' : 'text-brand-warning'
            }`}>
              {m.available === true ? `[OK] ${m.latency?.toFixed(3)}s` : m.available === false ? '[FAIL]' : '[PROBING]'}
            </span>
          </div>
        ))}
        {mirrors.length === 0 && <div className="text-gray-600 italic">No mirror links detected in the current sector.</div>}
      </div>
    </div>
  );
};

export default ScraperViewfinder;
