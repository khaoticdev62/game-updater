import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, AlertTriangle, AlertOctagon } from 'lucide-react';

export interface ErrorMessage {
  id: string;
  code: string;
  message: string;
  details?: string;
  timestamp: number;
  autoDismissIn?: number; // milliseconds, undefined = no auto-dismiss
}

interface ErrorToastProps {
  errors: ErrorMessage[];
  onDismiss: (id: string) => void;
}

/**
 * ErrorToast Component
 * 
 * Displays stacked error notifications with auto-dismiss functionality.
 * Features include:
 * - Multiple error stacking with smooth animations
 * - Color-coded severity levels
 * - Auto-dismiss with progress indicator
 * - Click-to-dismiss functionality
 * - Error code and detailed information display
 * - Smooth enter/exit animations
 * 
 * Error codes:
 * - JSON_ERROR: Invalid JSON request
 * - MISSING_FIELD: Required field missing
 * - FILE_NOT_FOUND: File or directory not found
 * - PERMISSION_DENIED: Access denied
 * - INTERNAL_ERROR: Unexpected backend error
 * - IPC_ERROR: Inter-process communication error
 * - NETWORK_ERROR: Network connectivity error
 * - TIMEOUT_ERROR: Request timeout
 * 
 * @param errors - Array of error messages to display
 * @param onDismiss - Callback when an error is dismissed
 */
export const ErrorToast: React.FC<ErrorToastProps> = ({ errors, onDismiss }) => {
  // Auto-dismiss errors based on their configuration
  useEffect(() => {
    const timers = errors
      .filter(e => e.autoDismissIn && e.autoDismissIn > 0)
      .map(error => {
        return setTimeout(() => {
          onDismiss(error.id);
        }, error.autoDismissIn);
      });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [errors, onDismiss]);

  // Determine severity and styling based on error code
  const getErrorSeverity = (code: string): 'critical' | 'high' | 'medium' => {
    if (['FILE_NOT_FOUND', 'PERMISSION_DENIED', 'INTERNAL_ERROR'].includes(code)) {
      return 'critical';
    }
    if (['JSON_ERROR', 'MISSING_FIELD', 'IPC_ERROR', 'TIMEOUT_ERROR'].includes(code)) {
      return 'high';
    }
    return 'medium';
  };

  const getSeverityStyles = (severity: 'critical' | 'high' | 'medium') => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'from-red-500/10 to-red-600/5',
          border: 'border-red-500/50',
          icon: <AlertOctagon className="w-5 h-5 text-red-400" />,
          textColor: 'text-red-300',
          accentColor: 'text-red-400',
          progressBg: 'bg-red-500/20',
          progressFill: 'bg-red-500'
        };
      case 'high':
        return {
          bg: 'from-orange-500/10 to-orange-600/5',
          border: 'border-orange-500/50',
          icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
          textColor: 'text-orange-300',
          accentColor: 'text-orange-400',
          progressBg: 'bg-orange-500/20',
          progressFill: 'bg-orange-500'
        };
      case 'medium':
        return {
          bg: 'from-yellow-500/10 to-yellow-600/5',
          border: 'border-yellow-500/50',
          icon: <AlertCircle className="w-5 h-5 text-yellow-400" />,
          textColor: 'text-yellow-300',
          accentColor: 'text-yellow-400',
          progressBg: 'bg-yellow-500/20',
          progressFill: 'bg-yellow-500'
        };
    }
  };

  return (
    <AnimatePresence mode="popLayout">
      <div className="fixed top-6 right-6 w-96 max-w-[calc(100vw-3rem)] z-[60] space-y-3 pointer-events-none">
        {errors.map((error) => {
          const severity = getErrorSeverity(error.code);
          const styles = getSeverityStyles(severity);

          return (
            <motion.div
              key={error.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                type: 'spring',
                damping: 20,
                stiffness: 300,
                mass: 1
              }}
              className="pointer-events-auto"
            >
              <motion.div
                className={`relative glass-medium rounded-lg border ${styles.border} bg-gradient-to-br ${styles.bg} p-4 shadow-xl overflow-hidden`}
                layout
              >
                {/* Background blur effect */}
                <motion.div
                  className="absolute inset-0 -z-10 opacity-30 filter blur-xl"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                {/* Header with icon and title */}
                <div className="flex items-start gap-3 mb-2">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {styles.icon}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`font-semibold text-sm ${styles.accentColor}`}>
                        {error.code.replace(/_/g, ' ')}
                      </p>
                      <button
                        onClick={() => onDismiss(error.id)}
                        className={`flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors ${styles.textColor}`}
                        title="Dismiss error"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className={`text-xs leading-snug mt-1 ${styles.textColor}`}>
                      {error.message}
                    </p>
                  </div>
                </div>

                {/* Details section - expandable */}
                {error.details && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 p-2 bg-white/5 rounded border border-white/10"
                  >
                    <p className="text-white/60 text-xs font-mono break-all line-clamp-3">
                      {error.details}
                    </p>
                  </motion.div>
                )}

                {/* Auto-dismiss progress bar */}
                {error.autoDismissIn && (
                  <motion.div
                    className={`absolute bottom-0 left-0 right-0 h-1 ${styles.progressBg}`}
                  >
                    <motion.div
                      className={`h-full ${styles.progressFill}`}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{
                        duration: (error.autoDismissIn / 1000),
                        ease: 'linear'
                      }}
                      onAnimationComplete={() => onDismiss(error.id)}
                    />
                  </motion.div>
                )}

                {/* Timestamp */}
                <p className="text-white/40 text-xs mt-2 text-right">
                  {new Date(error.timestamp).toLocaleTimeString()}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </AnimatePresence>
  );
};

export default ErrorToast;
