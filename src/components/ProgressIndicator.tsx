import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Loader } from 'lucide-react';

interface ProgressData {
  status: string;
  current?: number;
  total?: number;
  file?: string;
  message?: string;
}

interface ProgressIndicatorProps {
  progress: ProgressData | null;
  isVisible?: boolean;
}

/**
 * ProgressIndicator Component
 * 
 * Displays real-time progress feedback for long-running operations
 * like verification and updates. Features include:
 * - Animated progress bar with percentage display
 * - Status messages and file tracking
 * - Error state display
 * - Smooth motion animations using Framer Motion
 * 
 * @param progress - Progress data from backend callbacks
 * @param isVisible - Whether the progress indicator should be shown
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  progress,
  isVisible = true
}) => {
  if (!progress || !isVisible) {
    return null;
  }

  // Calculate progress percentage
  const percentage = useMemo(() => {
    if (!progress.current || !progress.total) return 0;
    return Math.min(Math.round((progress.current / progress.total) * 100), 100);
  }, [progress.current, progress.total]);

  // Determine progress state (loading, success, error)
  const isError = progress.status.includes('error') || progress.message?.includes('Error');
  const isComplete = percentage === 100 || progress.status.includes('complete');
  const isLoading = !isError && !isComplete;

  // Color scheme based on state
  const progressColor = isError ? 'from-red-500 to-red-600' : 
                        isComplete ? 'from-green-500 to-green-600' :
                        'from-blue-500 to-blue-600';
  
  const accentColor = isError ? 'text-red-400' :
                      isComplete ? 'text-green-400' :
                      'text-blue-400';

  return (
    <motion.div
      className="fixed bottom-8 right-8 w-96 max-w-[calc(100vw-2rem)] z-50"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <motion.div
        className="glass-medium rounded-xl border border-white/20 p-6 shadow-2xl backdrop-blur-xl"
        layout
      >
        {/* Header with Status Icon */}
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={{ 
              rotate: isLoading ? 360 : 0,
              scale: isLoading ? [1, 1.1, 1] : 1
            }}
            transition={{ 
              rotate: isLoading ? { duration: 2, repeat: Infinity, ease: 'linear' } : { duration: 0.3 },
              scale: isLoading ? { duration: 1.5, repeat: Infinity } : { duration: 0.3 }
            }}
          >
            {isError ? (
              <AlertCircle className={`${accentColor} w-6 h-6`} />
            ) : isComplete ? (
              <CheckCircle2 className={`${accentColor} w-6 h-6`} />
            ) : (
              <Loader className={`${accentColor} w-6 h-6`} />
            )}
          </motion.div>
          
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm">
              {isError ? 'Operation Failed' : 
               isComplete ? 'Complete' :
               'Processing'}
            </h3>
            <p className={`text-xs ${accentColor} font-medium`}>
              {progress.status.replace(/_/g, ' ').toUpperCase()}
            </p>
          </div>

          {/* Percentage Display */}
          <motion.div
            className={`text-2xl font-bold font-mono ${accentColor}`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5, repeat: isLoading ? Infinity : 0 }}
          >
            {percentage}%
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <motion.div
            className="w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/20"
            layout
          >
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${progressColor} shadow-lg`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <motion.div
                className="h-full bg-white/20"
                animate={{
                  x: ['100%', '-100%']
                }}
                transition={{
                  duration: 1.5,
                  repeat: isLoading ? Infinity : 0,
                  ease: 'linear'
                }}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Status Message */}
        <motion.p className="text-white/70 text-xs mb-2 min-h-5">
          {progress.message && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {progress.message}
            </motion.span>
          )}
        </motion.p>

        {/* File Display */}
        {progress.file && (
          <motion.div
            className="mb-3 p-2 bg-white/5 rounded border border-white/10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-white/60 text-xs font-mono truncate">
              <span className="text-white/40">📁 </span>
              {progress.file}
            </p>
          </motion.div>
        )}

        {/* Progress Counter */}
        {progress.current && progress.total && (
          <div className="text-white/50 text-xs text-right">
            <span className={accentColor}>{progress.current}</span> / {progress.total}
          </div>
        )}

        {/* Error Details */}
        {isError && progress.message && (
          <motion.div
            className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-300 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="font-semibold mb-1">Error Details:</p>
            <p className="line-clamp-3">{progress.message}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Backdrop blur effect for bottom-right corner */}
      <motion.div
        className="absolute inset-0 -z-10 rounded-xl bg-white/5 filter blur-2xl"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
  );
};

export default ProgressIndicator;
