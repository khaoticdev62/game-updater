import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Download, Trash2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './Button';

export interface Operation {
  type: 'download' | 'verify' | 'delete' | 'update' | 'install';
  file?: string;
  path?: string;
  size?: number;
  status?: string;
}

interface OperationsSummaryProps {
  operations: Operation[];
  totalSize?: number;
  isVisible?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

/**
 * OperationsSummary Component
 *
 * Displays a summary of operations that will be performed before execution.
 * Allows users to review changes and confirm or cancel operations.
 *
 * Features:
 * - Groups operations by type
 * - Shows file counts and total size
 * - Expandable operation list
 * - Confirm/Cancel workflow
 * - Visual operation type indicators
 *
 * @param operations - Array of operations to display
 * @param totalSize - Total size in bytes to download/process
 * @param isVisible - Whether the summary is displayed
 * @param onConfirm - Callback when user confirms
 * @param onCancel - Callback when user cancels
 * @param isLoading - Loading state during operation processing
 */
export const OperationsSummary: React.FC<OperationsSummaryProps> = ({
  operations,
  totalSize = 0,
  isVisible = false,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const [expanded, setExpanded] = React.useState(true);

  // Group operations by type
  const grouped = useMemo(() => {
    const groups: Record<string, Operation[]> = {};
    operations.forEach(op => {
      if (!groups[op.type]) {
        groups[op.type] = [];
      }
      groups[op.type].push(op);
    });
    return groups;
  }, [operations]);

  // Calculate statistics
  const stats = useMemo(() => {
    const typeIcons: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
      download: { icon: <Download className="w-5 h-5" />, label: 'Download', color: 'text-blue-400' },
      verify: { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Verify', color: 'text-green-400' },
      delete: { icon: <Trash2 className="w-5 h-5" />, label: 'Delete', color: 'text-red-400' },
      update: { icon: <RefreshCw className="w-5 h-5" />, label: 'Update', color: 'text-yellow-400' },
      install: { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Install', color: 'text-purple-400' }
    };

    return {
      total: operations.length,
      byType: Object.entries(grouped).map(([type, ops]) => ({
        type,
        count: ops.length,
        icon: typeIcons[type]?.icon || <AlertCircle className="w-5 h-5" />,
        label: typeIcons[type]?.label || type,
        color: typeIcons[type]?.color || 'text-white/70'
      }))
    };
  }, [grouped, operations.length]);

  // Format bytes to human-readable size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return ((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isVisible || operations.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            className="glass-medium rounded-xl border border-white/20 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto"
            layout
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Review Operations
                  </h2>
                  <p className="text-white/60 text-sm">
                    {stats.total} operation{stats.total !== 1 ? 's' : ''} ready to execute
                  </p>
                </div>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70"
                  title={expanded ? 'Collapse' : 'Expand'}
                >
                  {expanded ? (
                    <ChevronUp className="w-6 h-6" />
                  ) : (
                    <ChevronDown className="w-6 h-6" />
                  )}
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.byType.map(stat => (
                  <motion.div
                    key={stat.type}
                    className="bg-white/5 rounded-lg p-3 border border-white/10"
                    layout
                  >
                    <div className={`flex items-center gap-2 mb-1 ${stat.color}`}>
                      {stat.icon}
                      <span className="text-xs font-medium">{stat.label}</span>
                    </div>
                    <p className="text-lg font-bold text-white">{stat.count}</p>
                  </motion.div>
                ))}
              </div>

              {/* Total Size */}
              {totalSize > 0 && (
                <motion.div
                  className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
                  layout
                >
                  <p className="text-blue-300 text-sm">
                    <span className="font-semibold">Total Data:</span> {formatBytes(totalSize)}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Operations List */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 space-y-4 divide-y divide-white/10"
                >
                  {stats.byType.map(stat => (
                    <motion.div key={stat.type} layout className="pt-4 first:pt-0">
                      <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${stat.color}`}>
                        {stat.icon}
                        {stat.label} ({stat.count})
                      </h3>

                      <motion.div
                        className="space-y-2 max-h-48 overflow-auto"
                        layout
                      >
                        {grouped[stat.type]?.slice(0, 5).map((op, idx) => (
                          <motion.div
                            key={idx}
                            className="bg-white/5 rounded p-2 border border-white/10 text-xs text-white/70"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="truncate">
                                {op.file || op.path || op.type}
                              </span>
                              {op.size && (
                                <span className="flex-shrink-0 text-white/50">
                                  {formatBytes(op.size)}
                                </span>
                              )}
                            </div>
                            {op.status && (
                              <p className="text-white/50 text-xs mt-1">{op.status}</p>
                            )}
                          </motion.div>
                        ))}

                        {grouped[stat.type]?.length > 5 && (
                          <motion.p
                            className="text-xs text-white/50 p-2 italic"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            ... and {grouped[stat.type].length - 5} more
                          </motion.p>
                        )}
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer with Actions */}
            <div className="sticky bottom-0 bg-gradient-to-r from-white/5 to-transparent border-t border-white/20 p-6 flex gap-3 justify-end">
              <Button
                onClick={onCancel}
                variant="secondary"
                disabled={isLoading}
                className="min-w-32"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                variant="primary"
                disabled={isLoading || operations.length === 0}
                className="min-w-32"
              >
                {isLoading ? 'Processing...' : 'Confirm & Proceed'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OperationsSummary;
