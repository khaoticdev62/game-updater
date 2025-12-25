import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

export type UpdateStatus = 'pending' | 'running' | 'completed' | 'failed' | 'partial';

export interface UpdateResult {
  status: UpdateStatus;
  operationsProcessed: number;
  operationsFailed: number;
  startTime: number;
  endTime?: number;
  errors: Array<{ file: string; error: string }>;
  summary: string;
}

interface UpdateCompletionStatusProps {
  result: UpdateResult | null;
  isVisible?: boolean;
  onClose?: () => void;
  onRetry?: () => void;
}

/**
 * UpdateCompletionStatus Component
 *
 * Displays the completion status and results of an update operation.
 * Shows success/failure with detailed statistics and error information.
 *
 * Features:
 * - Status indicators (success, failure, partial)
 * - Operation statistics (processed, failed, duration)
 * - Error list with file and error details
 * - Retry and close actions
 * - Animated completion celebration
 *
 * @param result - Update operation result
 * @param isVisible - Whether to show the status dialog
 * @param onClose - Callback when closing
 * @param onRetry - Callback to retry the operation
 */
export const UpdateCompletionStatus: React.FC<UpdateCompletionStatusProps> = ({
  result,
  isVisible = false,
  onClose,
  onRetry
}) => {
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (result?.status === 'completed' && isVisible) {
      setCelebrating(true);
      const timer = setTimeout(() => setCelebrating(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [result?.status, isVisible]);

  if (!isVisible || !result) {
    return null;
  }

  const isSuccess = result.status === 'completed' && result.operationsFailed === 0;
  const isFailed = result.status === 'failed';

  // Calculate operation duration
  const duration = result.endTime
    ? ((result.endTime - result.startTime) / 1000).toFixed(1)
    : '...';

  const statusConfig = {
    completed: {
      icon: <CheckCircle2 className="w-12 h-12" />,
      color: 'text-green-400',
      bgColor: 'from-green-500/10 to-green-600/5',
      borderColor: 'border-green-500/50',
      title: 'Update Complete',
      subtitle: 'All operations completed successfully'
    },
    partial: {
      icon: <AlertTriangle className="w-12 h-12" />,
      color: 'text-yellow-400',
      bgColor: 'from-yellow-500/10 to-yellow-600/5',
      borderColor: 'border-yellow-500/50',
      title: 'Update Partial',
      subtitle: 'Some operations failed. Please review errors.'
    },
    failed: {
      icon: <AlertCircle className="w-12 h-12" />,
      color: 'text-red-400',
      bgColor: 'from-red-500/10 to-red-600/5',
      borderColor: 'border-red-500/50',
      title: 'Update Failed',
      subtitle: 'The operation encountered errors and could not complete.'
    },
    pending: {
      icon: <CheckCircle2 className="w-12 h-12" />,
      color: 'text-blue-400',
      bgColor: 'from-blue-500/10 to-blue-600/5',
      borderColor: 'border-blue-500/50',
      title: 'Processing',
      subtitle: 'Update operation in progress...'
    }
  };

  const config = statusConfig[result.status];

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
          {/* Celebration confetti effect */}
          {celebrating && (
            <>
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={`confetti-${i}`}
                  className="fixed pointer-events-none"
                  initial={{
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2,
                    opacity: 1
                  }}
                  animate={{
                    x: window.innerWidth / 2 + (Math.random() - 0.5) * 400,
                    y: window.innerHeight / 2 + 200 + Math.random() * 200,
                    opacity: 0,
                    rotate: Math.random() * 720
                  }}
                  transition={{ duration: 2, ease: 'easeOut', delay: Math.random() * 0.3 }}
                >
                  <div className={`text-2xl ${['🎉', '✨', '🎊', '⭐'][i % 4]}`} />
                </motion.div>
              ))}
            </>
          )}

          <motion.div
            className={`glass-medium rounded-xl border ${config.borderColor} shadow-2xl max-w-2xl w-full bg-gradient-to-br ${config.bgColor} overflow-hidden`}
            layout
          >
            {/* Header */}
            <div className="relative p-8">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>

              <motion.div
                className="flex justify-center mb-6"
                animate={celebrating ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 0.6 }}
              >
                <motion.div className={config.color}>
                  {config.icon}
                </motion.div>
              </motion.div>

              <h2 className={`text-2xl font-bold text-center mb-2 ${config.color}`}>
                {config.title}
              </h2>
              <p className="text-white/70 text-center text-sm">
                {config.subtitle}
              </p>
            </div>

            {/* Statistics */}
            <div className="px-8 py-6 border-y border-white/20 grid grid-cols-3 gap-4">
              <motion.div
                className="bg-white/5 rounded-lg p-4 border border-white/10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-white/70 text-xs font-medium mb-1">Processed</p>
                <p className="text-2xl font-bold text-green-400">
                  {result.operationsProcessed}
                </p>
              </motion.div>

              <motion.div
                className="bg-white/5 rounded-lg p-4 border border-white/10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-white/70 text-xs font-medium mb-1">Failed</p>
                <p className={`text-2xl font-bold ${result.operationsFailed > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {result.operationsFailed}
                </p>
              </motion.div>

              <motion.div
                className="bg-white/5 rounded-lg p-4 border border-white/10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-white/70 text-xs font-medium mb-1">Duration</p>
                <p className="text-2xl font-bold text-blue-400">
                  {duration}s
                </p>
              </motion.div>
            </div>

            {/* Summary */}
            <div className="px-8 py-6 border-b border-white/20">
              <motion.p
                className="text-white/80 text-sm leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {result.summary}
              </motion.p>
            </div>

            {/* Error Details */}
            {result.errors.length > 0 && (
              <motion.div
                className="px-8 py-6 border-b border-white/20"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Errors ({result.errors.length})
                </h3>

                <div className="space-y-2 max-h-40 overflow-auto">
                  {result.errors.map((err, idx) => (
                    <motion.div
                      key={idx}
                      className="bg-red-500/10 border border-red-500/30 rounded p-3 text-xs"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                    >
                      <p className="text-red-300 font-mono font-semibold mb-1">
                        {err.file}
                      </p>
                      <p className="text-red-300/80">
                        {err.error}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Footer Actions */}
            <div className="px-8 py-6 bg-gradient-to-r from-white/5 to-transparent flex gap-3 justify-end">
              {isFailed && onRetry && (
                <Button
                  onClick={onRetry}
                  variant="primary"
                  className="min-w-32"
                >
                  Retry
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="secondary"
                className="min-w-32"
              >
                {isSuccess ? 'Done' : 'Close'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateCompletionStatus;
