import React, { useEffect, useRef } from 'react';
import { Terminal, Trash2 } from 'lucide-react';

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  logger: string;
}

interface DiagnosticConsoleProps {
  logs: LogEntry[];
  onClear?: () => void;
}

const DiagnosticConsole: React.FC<DiagnosticConsoleProps> = ({ logs, onClear }) => {
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLevelStyles = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-brand-danger bg-brand-danger/10 border-brand-danger/20';
      case 'WARNING': return 'text-brand-warning bg-brand-warning/10 border-brand-warning/20';
      case 'DEBUG': return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
      default: return 'text-brand-accent bg-brand-accent/10 border-brand-accent/20';
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/60 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Console Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
            <Terminal size={14} className="text-brand-accent" />
            System_Diagnostics
          </h3>
        </div>
        {onClear && (
          <button 
            onClick={onClear}
            className="p-2 hover:bg-white/5 rounded-lg text-gray-600 hover:text-brand-danger transition-all active:scale-90"
            title="Clear Logs"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Log Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2 font-mono text-[11px] leading-relaxed custom-scrollbar selection:bg-brand-accent/30">
        {logs.map((log, i) => {
          const time = log.timestamp.includes('T') 
            ? log.timestamp.split('T')[1].split('.')[0] 
            : log.timestamp;
            
          return (
            <div key={i} className="flex gap-4 group hover:bg-white/[0.02] -mx-2 px-2 py-1 rounded transition-colors">
              <span className="text-gray-700 shrink-0 select-none">[{time}]</span>
              <span className={`px-1.5 py-0.5 rounded border text-[9px] font-black shrink-0 self-start ${getLevelStyles(log.level)}`}>
                {log.level}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-gray-500 italic mr-2 select-none">({log.logger})</span>
                <span className="text-gray-300 break-words group-hover:text-white transition-colors">
                  {log.message}
                </span>
              </div>
            </div>
          );
        })}
        {logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center space-y-4 text-gray-700 opacity-50">
            <Terminal size={40} strokeWidth={1} />
            <p className="text-xs uppercase tracking-widest">No active telemetry data...</p>
          </div>
        )}
        <div ref={consoleEndRef} />
      </div>

      {/* Console Footer */}
      <div className="px-6 py-3 bg-black/40 border-t border-gray-800 flex items-center justify-between text-[9px] text-gray-600 font-mono">
        <div className="flex gap-4">
          <span>BUFFER: {logs.length}/100</span>
          <span>MODE: REAL_TIME_STREAM</span>
        </div>
        <span className="text-brand-accent/50 animate-pulse">STATUS: LISTENING_FOR_IPC...</span>
      </div>
    </div>
  );
};

export default DiagnosticConsole;
