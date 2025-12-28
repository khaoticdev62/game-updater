import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RotateCcw, X } from 'lucide-react';

export interface RetryNotificationProps {
  isVisible?: boolean;
  attempt?: number;
  maxAttempts?: number;
  nextRetryIn?: number; // milliseconds
  lastError?: Error | null;
  onCancel?: () => void;
}

/**
 * RetryNotification Component
 *
 * Displays retry progress and status during automatic retry operations.
 * Shows attempt number, next retry countdown, and allows user to cancel.
 *
 * Features:
 * - Shows current attempt and max attempts
 * - Countdown timer for next retry
 * - Error message display
 * - Cancel retry button
 * - Animated progress indicator
 * - Fixed position in bottom-left corner
 *
 * @param isVisible - Whether notification is shown
 * @param attempt - Current attempt number
 * @param maxAttempts - Maximum number of attempts
 * @param nextRetryIn - Milliseconds until next retry
 * @param lastError - Last error encountered
 * @param onCancel - Callback when user cancels retry
 */
export const RetryNotification: React.FC<RetryNotificationProps> = ({
  isVisible = false,
  attempt = 0,
  maxAttempts = 5,
  nextRetryIn = 0,
  lastError,
  onCancel
}) => {
  const [countdown, setCountdown] = useState(nextRetryIn);

  // Update countdown
  useEffect(() => {
    setCountdown(nextRetryIn);
  }, [nextRetryIn]);

  useEffect(() => {
    if (!isVisible || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 100));
    }, 100);

    return () => clearInterval(timer);
  }, [isVisible, countdown]);

  const countdownSeconds = Math.ceil(countdown / 1000);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-8 left-8 w-96 max-w-[calc(100vw-4rem)] z-50"
          initial={{ opacity: 0, x: -20, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -20, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="glass-medium rounded-lg border border-orange-500/50 bg-gradient-to-br from-orange-500/10 to-orange-600/5 p-4 shadow-xl"
            layout
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <motion.div
                className="text-orange-400 flex-shrink-0 mt-0.5"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <RotateCcw className="w-5 h-5" />
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-orange-300 font-semibold text-sm">
                    Retrying Operation
                  </p>
                  <button
                    onClick={onCancel}
                    className="p-1 hover:bg-white/10 rounded transition-colors text-white/70 hover:text-white/80"
                    title="Cancel retry"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-white/70 text-xs">
                  Attempt {attempt} of {maxAttempts}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <motion.div
              className="w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/20 mb-3"
              layout
            >
              <motion.div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${((attempt) / maxAttempts) * 100}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </motion.div>

            {/* Countdown or status */}
            {countdown > 0 ? (
              <motion.div
                className="flex items-center justify-between"
                layout
              >
                <span className="text-white/60 text-xs">
                  Retrying in:
                </span>
                <motion.span
                  className="text-orange-300 font-mono font-semibold text-sm"
                  key={countdownSeconds}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {countdownSeconds}s
                </motion.span>
              </motion.div>
            ) : (
              <p className="text-white/60 text-xs text-center">
                Attempting now...
              </p>
            )}

            {/* Error details */}
            {lastError && (
              <motion.div
                className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-300 text-xs line-clamp-2">
                    {lastError.message}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Cancel button (if not showing countdown) */}
            {countdown <= 0 && onCancel && (
              <motion.button
                onClick={onCancel}
                className="mt-3 w-full py-1 px-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded text-white/70 hover:text-white text-xs font-medium transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Cancel Retry
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RetryNotification;
