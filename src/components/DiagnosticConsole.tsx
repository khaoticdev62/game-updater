import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, X, Trash2 } from 'lucide-react';

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
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('All');

  useEffect(() => {
    if (!isMinimized) {
      consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isMinimized]);

  // Filter logs by selected level
  const filteredLogs = useMemo(() => {
    if (selectedLevel === 'All') return logs;
    return logs.filter(log => log.level === selectedLevel);
  }, [logs, selectedLevel]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-red-400';
      case 'WARNING': return 'text-yellow-400';
      case 'DEBUG': return 'text-gray-400';
      default: return 'text-blue-400';
    }
  };

  const levels = ['All', 'ERROR', 'WARNING', 'INFO', 'DEBUG'];

  return (
    <motion.div
      className="fixed bottom-4 right-4 w-96 glass-heavy rounded-lg border border-white/20 overflow-hidden shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Diagnostic Console
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/10 rounded transition-colors text-white/70 hover:text-white"
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            <ChevronUp size={18} className={`transform transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => {}}
            className="p-1 hover:bg-white/10 rounded transition-colors text-white/70 hover:text-white"
            title="Clear logs"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-64"
          >
            {/* Filter Buttons */}
            <div className="flex gap-1 px-3 py-2 border-b border-white/10 bg-white/5 overflow-x-auto">
              {levels.map(level => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all whitespace-nowrap ${
                    selectedLevel === level
                      ? 'glass-medium text-white border border-white/30'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            {/* Logs Container */}
            <div className="flex-1 overflow-y-auto bg-black/30 px-3 py-2 space-y-1">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-white/50 text-sm">
                  No logs {selectedLevel !== 'All' && `at level "${selectedLevel}"`}
                </div>
              ) : (
                filteredLogs.map((log, i) => (
                  <div key={i} className="text-xs font-mono text-white/80 hover:text-white/100 transition-colors">
                    <span className="text-white/40">[{log.timestamp.split('T')[1].split('.')[0]}]</span>
                    <span className={`ml-2 font-bold ${getLevelColor(log.level)}`}>
                      {log.level.padEnd(7)}
                    </span>
                    <span className="ml-2 text-white/50">({log.logger})</span>
                    <span className="ml-1">:</span>
                    <span className="ml-1 text-white/90 break-words">{log.message}</span>
                  </div>
                ))
              )}
              <div ref={consoleEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized Badge */}
      {isMinimized && (
        <div className="px-4 py-2 text-xs text-white/60">
          {logs.length} logs • {filteredLogs.length} visible
        </div>
      )}
    </motion.div>
  );
};

export default DiagnosticConsole;
