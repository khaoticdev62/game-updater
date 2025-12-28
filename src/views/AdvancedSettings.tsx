import React from 'react';
import { motion } from 'framer-motion';
import { VisionCard } from '../components/VisionCard';
import DLCUnlockerSettings from '../components/DLCUnlockerSettings';

interface AdvancedSettingsProps {
  className?: string;
}

/**
 * Advanced Settings View
 *
 * Container view for advanced features and settings.
 * Currently includes DLC Unlocker management.
 * Can be expanded with additional advanced features in the future.
 *
 * Props:
 *   - className: Additional custom classes
 */

const AdvancedSettingsComponent: React.FC<AdvancedSettingsProps> = ({
  className = '',
}) => {
  return (
    <motion.div
      className={`space-y-8 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-bold text-white mb-4">Advanced Settings</h1>
        <p className="text-white/70">
          Configure advanced features and optional tools for the Sims 4 Updater.
        </p>
      </div>

      {/* Introduction Card */}
      <VisionCard variant="elevated" className="border-white/20">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Welcome to Advanced Settings</h2>
          <p className="text-white/80 leading-relaxed">
            This section provides access to advanced features that enhance your Sims 4 gaming experience.
            All features are optional and can be safely enabled or disabled at any time.
          </p>
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm text-white/60">
              💡 Tip: Each feature includes detailed instructions and warnings to help you make informed decisions.
            </p>
          </div>
        </div>
      </VisionCard>

      {/* DLC Unlocker Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Content Management</h2>
        <DLCUnlockerSettings />
      </div>

      {/* Future Features Placeholder */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Upcoming Features</h2>
        <VisionCard>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚀</span>
              <div>
                <h3 className="font-semibold text-white">Web Scraper (Coming Soon)</h3>
                <p className="text-white/70 text-sm mt-1">
                  Discover patches, DLC releases, and community mods from across the web.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚙️</span>
              <div>
                <h3 className="font-semibold text-white">Advanced Configuration (Coming Soon)</h3>
                <p className="text-white/70 text-sm mt-1">
                  Fine-tune updater behavior, caching, and network settings.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="font-semibold text-white">Performance Analytics (Coming Soon)</h3>
                <p className="text-white/70 text-sm mt-1">
                  Monitor update performance and optimize download speeds.
                </p>
              </div>
            </div>
          </div>
        </VisionCard>
      </div>

      {/* Help & Support */}
      <VisionCard variant="elevated" className="border-white/20">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Help & Support</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h3 className="font-semibold text-white/90">Documentation</h3>
              <ul className="space-y-1 text-white/70">
                <li>• Feature Guides</li>
                <li>• Troubleshooting</li>
                <li>• FAQ</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-white/90">Resources</h3>
              <ul className="space-y-1 text-white/70">
                <li>• Community Forum</li>
                <li>• Report Issues</li>
                <li>• Request Features</li>
              </ul>
            </div>
          </div>
          <div className="pt-4 border-t border-white/10 text-white/60 text-xs">
            <p>For additional support, visit our documentation or community forums.</p>
          </div>
        </div>
      </VisionCard>
    </motion.div>
  );
};

export const AdvancedSettings = React.memo(AdvancedSettingsComponent);

export default AdvancedSettings;
