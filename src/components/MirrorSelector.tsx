import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Zap, Signal } from 'lucide-react';
import { Button } from './Button';

export interface Mirror {
  url: string;
  weight?: number;
  healthy?: boolean;
  latency?: number;
  responseTime?: number; // milliseconds
}

interface MirrorSelectorProps {
  mirrors: Mirror[];
  selectedMirror?: Mirror;
  onSelect?: (mirror: Mirror) => void;
  onClose?: () => void;
  isVisible?: boolean;
  isProbing?: boolean;
}

/**
 * MirrorSelector Component
 *
 * Allows users to manually select a download mirror with real-time quality metrics.
 * Shows mirror status (healthy/unhealthy), latency, and response times.
 *
 * Features:
 * - Displays available mirrors with quality metrics
 * - Shows latency and response time
 * - Indicates mirror health status
 * - Sorts mirrors by quality (weight/latency)
 * - Ability to manually override automatic selection
 * - Visual status indicators
 * - Smooth animations
 *
 * @param mirrors - Array of available mirrors
 * @param selectedMirror - Currently selected mirror
 * @param onSelect - Callback when mirror is selected
 * @param onClose - Callback to close selector
 * @param isVisible - Whether to show the selector
 * @param isProbing - Whether mirrors are being probed
 */
export const MirrorSelector: React.FC<MirrorSelectorProps> = ({
  mirrors = [],
  selectedMirror,
  onSelect,
  onClose,
  isVisible = false,
  isProbing = false
}) => {
  // Sort mirrors by quality (weight descending, latency ascending)
  const sortedMirrors = useMemo(() => {
    const sorted = [...mirrors].sort((a, b) => {
      const aScore = ((a.weight || 5) * 1000) / (a.latency || 100);
      const bScore = ((b.weight || 5) * 1000) / (b.latency || 100);
      return bScore - aScore;
    });
    return sorted;
  }, [mirrors]);

  if (!isVisible) {
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
              <h2 className="text-2xl font-bold text-white mb-2">
                Select Download Mirror
              </h2>
              <p className="text-white/60 text-sm">
                Choose a mirror for the best download speeds in your region
              </p>
            </div>

            {/* Mirrors List */}
            <motion.div className="p-6 space-y-3" layout>
              {isProbing ? (
                <motion.div
                  className="flex items-center justify-center py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="mr-3 text-blue-400"
                  >
                    <Zap className="w-5 h-5" />
                  </motion.div>
                  <p className="text-white/70">Probing mirrors for latency...</p>
                </motion.div>
              ) : sortedMirrors.length === 0 ? (
                <motion.div
                  className="text-center py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-white/60">No mirrors available. Run "Scan for Mirrors" first.</p>
                </motion.div>
              ) : (
                sortedMirrors.map((mirror, idx) => {
                  const isSelected = selectedMirror?.url === mirror.url;
                  const isHealthy = mirror.healthy !== false;
                  const quality = mirror.weight || 5;
                  const latency = mirror.latency || mirror.responseTime || 100;

                  // Calculate quality score for visual representation
                  const qualityScore = ((quality * 1000) / latency) / 100; // 0-10 scale
                  const qualityPercent = Math.min(100, qualityScore * 10);

                  return (
                    <motion.button
                      key={mirror.url}
                      onClick={() => onSelect?.(mirror)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-blue-500/20 border-blue-500/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      layout
                    >
                      <div className="flex items-start gap-3">
                        {/* Selection indicator */}
                        <motion.div
                          className="mt-1 flex-shrink-0"
                          animate={{ scale: isSelected ? 1 : 0.8 }}
                        >
                          {isSelected ? (
                            <CheckCircle2 className="w-5 h-5 text-blue-400" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-white/30" />
                          )}
                        </motion.div>

                        {/* Mirror info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold truncate">
                              {new URL(mirror.url).hostname}
                            </h3>
                            {isHealthy ? (
                              <div className="flex items-center gap-1 text-green-400 text-xs font-medium flex-shrink-0">
                                <Signal className="w-3 h-3" />
                                Healthy
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-red-400 text-xs font-medium flex-shrink-0">
                                <AlertCircle className="w-3 h-3" />
                                Unhealthy
                              </div>
                            )}
                          </div>

                          {/* URL */}
                          <p className="text-white/50 text-xs font-mono truncate mb-2">
                            {mirror.url}
                          </p>

                          {/* Quality metrics */}
                          <div className="grid grid-cols-3 gap-2 mb-2">
                            {/* Quality bar */}
                            <div>
                              <p className="text-white/60 text-xs mb-1">Quality</p>
                              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-green-400 to-blue-400"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${qualityPercent}%` }}
                                  transition={{ duration: 0.6, ease: 'easeOut' }}
                                />
                              </div>
                            </div>

                            {/* Latency */}
                            <div>
                              <p className="text-white/60 text-xs mb-1">Latency</p>
                              <p className={`text-sm font-semibold ${
                                latency < 100 ? 'text-green-400' :
                                latency < 500 ? 'text-yellow-400' :
                                'text-red-400'
                              }`}>
                                {latency}ms
                              </p>
                            </div>

                            {/* Weight/Score */}
                            <div>
                              <p className="text-white/60 text-xs mb-1">Weight</p>
                              <p className="text-sm font-semibold text-blue-400">
                                {quality}/10
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </motion.div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gradient-to-r from-white/5 to-transparent border-t border-white/20 p-6 flex gap-3 justify-end">
              <Button
                onClick={onClose}
                variant="secondary"
                className="min-w-32"
              >
                Close
              </Button>
              {selectedMirror && (
                <Button
                  onClick={onClose}
                  variant="primary"
                  className="min-w-32"
                >
                  Use Selected Mirror
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MirrorSelector;
