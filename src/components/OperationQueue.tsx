import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader, Trash2, Pause2, Play } from 'lucide-react';
import { QueuedOperation, OperationStatus } from '../hooks/useOperationQueue';
import { Button } from './Button';

interface OperationQueueProps {
  operations: QueuedOperation[];
  isRunning: boolean;
  totalProgress: number;
  completedCount: number;
  failedCount: number;
  isVisible?: boolean;
  onRemove?: (id: string) => void;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onClearCompleted?: () => void;
}

/**
 * OperationQueue Component
 *
 * Displays a list of queued operations with progress tracking.
 * Shows individual operation status and overall queue progress.
 *
 * Features:
 * - Lists all operations with status indicators
 * - Shows progress for each operation
 * - Overall progress bar
 * - Pause/Resume/Cancel controls
 * - Remove individual operations
 * - Operation statistics (completed, failed)
 * - Smooth animations
 *
 * @param operations - Array of queued operations
 * @param isRunning - Whether queue is executing
 * @param totalProgress - Overall progress (0-100)
 * @param completedCount - Number of completed operations
 * @param failedCount - Number of failed operations
 * @param isVisible - Whether to show the queue
 * @param onRemove - Callback to remove operation
 * @param onPause - Callback to pause queue
 * @param onResume - Callback to resume queue
 * @param onCancel - Callback to cancel queue
 * @param onClearCompleted - Callback to clear completed operations
 */
export const OperationQueue: React.FC<OperationQueueProps> = ({
  operations = [],
  isRunning = false,
  totalProgress = 0,
  completedCount = 0,
  failedCount = 0,
  isVisible = false,
  onRemove,
  onPause,
  onResume,
  onCancel,
  onClearCompleted
}) => {
  if (!isVisible || operations.length === 0) {
    return null;
  }

  const getStatusIcon = (status: OperationStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'running':
        return <Loader className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-white/30" />;
    }
  };

  const getStatusColor = (status: OperationStatus): string => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'running':
        return 'text-blue-400';
      case 'failed':
        return 'text-red-400';
      case 'cancelled':
        return 'text-yellow-400';
      default:
        return 'text-white/70';
    }
  };

  const pendingCount = operations.filter(op => op.status === 'pending').length;

  return (
    <motion.div
      className="fixed bottom-8 right-8 w-96 max-w-[calc(100vw-4rem)] z-50 max-h-[60vh] flex flex-col"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="glass-medium rounded-xl border border-white/20 shadow-2xl flex flex-col overflow-hidden"
        layout
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">
              Operation Queue
            </h3>
            <span className="text-sm text-blue-300 font-medium">
              {completedCount + failedCount}/{operations.length}
            </span>
          </div>

          {/* Overall progress */}
          <div className="space-y-2">
            <motion.div
              className="w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/20"
              layout
            >
              <motion.div
                className="h-full bg-gradient-to-r from-blue-400 to-purple-400"
                initial={{ width: 0 }}
                animate={{ width: `${totalProgress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </motion.div>
            <p className="text-xs text-white/60 text-right">
              {totalProgress}% complete
            </p>
          </div>
        </div>

        {/* Operations List */}
        <motion.div
          className="flex-1 overflow-auto p-4 space-y-2"
          layout
        >
          <AnimatePresence>
            {operations.map((op, idx) => (
              <motion.div
                key={op.id}
                className="bg-white/5 border border-white/10 rounded-lg p-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <motion.div
                    animate={op.status === 'running' ? { rotate: 360 } : {}}
                    transition={
                      op.status === 'running'
                        ? { duration: 2, repeat: Infinity, ease: 'linear' }
                        : {}
                    }
                  >
                    {getStatusIcon(op.status)}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {op.name}
                    </p>
                    <p className={`text-xs font-medium ${getStatusColor(op.status)}`}>
                      {op.status.charAt(0).toUpperCase() + op.status.slice(1)}
                    </p>
                  </div>

                  {op.status === 'pending' && (
                    <button
                      onClick={() => onRemove?.(op.id)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white flex-shrink-0"
                      title="Remove operation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Progress bar for running operations */}
                {(op.status === 'running' || op.progress! > 0) && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${op.progress || 0}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-xs text-white/60 w-8 text-right">
                      {op.progress || 0}%
                    </span>
                  </div>
                )}

                {/* Error message */}
                {op.status === 'failed' && op.error && (
                  <motion.p
                    className="text-xs text-red-300 mt-2 line-clamp-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {op.error.message}
                  </motion.p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Stats */}
        {(completedCount > 0 || failedCount > 0) && (
          <motion.div
            className="border-t border-white/20 px-4 py-2 bg-white/5 flex items-center justify-between text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex gap-4">
              {completedCount > 0 && (
                <p className="text-green-400">✓ {completedCount} completed</p>
              )}
              {failedCount > 0 && (
                <p className="text-red-400">✗ {failedCount} failed</p>
              )}
              {pendingCount > 0 && (
                <p className="text-white/60">{pendingCount} pending</p>
              )}
            </div>
            {onClearCompleted && completedCount > 0 && (
              <button
                onClick={onClearCompleted}
                className="text-white/60 hover:text-white/80 transition-colors underline"
              >
                Clear
              </button>
            )}
          </motion.div>
        )}

        {/* Controls */}
        <div className="border-t border-white/20 p-3 bg-gradient-to-r from-white/5 to-transparent flex gap-2">
          {isRunning ? (
            <Button
              onClick={onPause}
              variant="secondary"
              className="flex-1 py-2 text-xs"
            >
              <Pause2 className="w-3 h-3 mr-1 inline" />
              Pause
            </Button>
          ) : (
            <Button
              onClick={onResume}
              variant="secondary"
              className="flex-1 py-2 text-xs"
              disabled={pendingCount === 0}
            >
              <Play className="w-3 h-3 mr-1 inline" />
              Resume
            </Button>
          )}
          <Button
            onClick={onCancel}
            variant="secondary"
            className="flex-1 py-2 text-xs"
          >
            Cancel All
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OperationQueue;
