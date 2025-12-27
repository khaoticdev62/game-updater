import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { VisionCard } from './VisionCard';
import { Button } from './Button';
import { ErrorToast } from './ErrorToast';
import { DLCUnlockerStatus, UnlockerOperationResult } from '../types';

interface DLCUnlockerSettingsProps {
  className?: string;
}

/**
 * DLC Unlocker Settings Component
 *
 * Provides UI for managing the EA DLC Unlocker installation.
 * Features client detection, status display, and install/uninstall operations.
 *
 * Props:
 *   - className: Additional custom classes
 *
 * Features:
 *   - Real-time installation status
 *   - Client detection (EA App/Origin)
 *   - Safe install/uninstall with warnings
 *   - Loading states and error handling
 *   - Backup and rollback on failure
 *   - Clear instructions and warnings
 */

const DLCUnlockerSettingsComponent: React.FC<DLCUnlockerSettingsProps> = ({
  className = '',
}) => {
  const [status, setStatus] = useState<DLCUnlockerStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [operating, setOperating] = useState(false);
  const [operationType, setOperationType] = useState<'install' | 'uninstall' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await (window as any).electron.requestPython({
        command: 'dlc_unlocker_status',
      });

      if (result && typeof result === 'object') {
        setStatus(result as DLCUnlockerStatus);
      }
    } catch (err) {
      setError('Failed to fetch DLC Unlocker status');
      console.error('Status fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInstall = React.useCallback(async () => {
    try {
      setOperating(true);
      setOperationType('install');
      setError(null);
      setSuccess(null);

      const result = await (window as any).electron.requestPython({
        command: 'dlc_unlocker_install',
      });

      const opResult = result as UnlockerOperationResult;

      if (opResult.success) {
        setSuccess(opResult.message);
        // Refresh status
        setTimeout(() => fetchStatus(), 1000);
      } else {
        setError(`Installation failed: ${opResult.message}`);
      }
    } catch (err) {
      setError('Installation failed with error');
      console.error('Install error:', err);
    } finally {
      setOperating(false);
      setOperationType(null);
    }
  }, [fetchStatus]);

  const handleUninstall = React.useCallback(async () => {
    try {
      setOperating(true);
      setOperationType('uninstall');
      setError(null);
      setSuccess(null);

      const result = await (window as any).electron.requestPython({
        command: 'dlc_unlocker_uninstall',
      });

      const opResult = result as UnlockerOperationResult;

      if (opResult.success) {
        setSuccess(opResult.message);
        // Refresh status
        setTimeout(() => fetchStatus(), 1000);
      } else {
        setError(`Uninstallation failed: ${opResult.message}`);
      }
    } catch (err) {
      setError('Uninstallation failed with error');
      console.error('Uninstall error:', err);
    } finally {
      setOperating(false);
      setOperationType(null);
    }
  }, [fetchStatus]);

  if (loading) {
    return (
      <VisionCard className={className}>
        <div className="flex items-center justify-center py-8">
          <div className="spinner spinner-md" />
          <span className="ml-3 text-white/80">Loading status...</span>
        </div>
      </VisionCard>
    );
  }

  if (!status) {
    return (
      <VisionCard className={className}>
        <div className="text-red-400">
          Failed to load DLC Unlocker status
        </div>
      </VisionCard>
    );
  }

  const installed = status.installed;
  const hasClient = status.client.type !== null;
  const clientRunning = status.client.running;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status Card */}
      <VisionCard variant="default">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">
              DLC Unlocker
            </h3>
            <motion.div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                installed
                  ? 'bg-green-600/20 text-green-300'
                  : 'bg-gray-600/20 text-gray-300'
              }`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {installed ? '✓ Installed' : 'Not Installed'}
            </motion.div>
          </div>

          {/* Client Information */}
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-medium text-white/80 mb-3">
              Game Client
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Status:</span>
                <span className={hasClient ? 'text-green-300' : 'text-yellow-300'}>
                  {hasClient ? `${status.client.type?.replace('_', ' ').toUpperCase()}` : 'Not Detected'}
                </span>
              </div>
              {status.client.path && (
                <div className="flex justify-between">
                  <span className="text-white/60">Path:</span>
                  <span className="text-white/80 text-right truncate ml-2">
                    {status.client.path}
                  </span>
                </div>
              )}
              {status.client.running && (
                <div className="flex justify-between text-amber-300">
                  <span>⚠ Client is running</span>
                </div>
              )}
            </div>
          </div>

          {/* Installation Status */}
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-medium text-white/80 mb-3">
              Installation Files
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Configuration:</span>
                <span className={status.unlocker.config_exists ? 'text-green-300' : 'text-red-300'}>
                  {status.unlocker.config_exists ? '✓ Present' : '✗ Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Version DLL:</span>
                <span className={status.unlocker.version_dll_exists ? 'text-green-300' : 'text-red-300'}>
                  {status.unlocker.version_dll_exists ? '✓ Installed' : '✗ Not Installed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Backup:</span>
                <span className={status.unlocker.backup_available ? 'text-green-300' : 'text-gray-400'}>
                  {status.unlocker.backup_available ? '✓ Available' : 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </VisionCard>

      {/* Warnings */}
      {!hasClient && (
        <VisionCard>
          <div className="text-amber-300 text-sm space-y-2">
            <div className="flex gap-2">
              <span className="text-lg">⚠</span>
              <div>
                <p className="font-semibold">No Game Client Detected</p>
                <p className="text-amber-200/70 text-xs mt-1">
                  Please install EA App or Origin before using the DLC Unlocker.
                </p>
              </div>
            </div>
          </div>
        </VisionCard>
      )}

      {clientRunning && (
        <VisionCard>
          <div className="text-red-300 text-sm space-y-2">
            <div className="flex gap-2">
              <span className="text-lg">⛔</span>
              <div>
                <p className="font-semibold">Game Client is Running</p>
                <p className="text-red-200/70 text-xs mt-1">
                  Please close the game client before installing or uninstalling the DLC Unlocker.
                </p>
              </div>
            </div>
          </div>
        </VisionCard>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {!installed ? (
          <VisionCard>
            <div className="space-y-3">
              <p className="text-sm text-white/80">
                The DLC Unlocker provides access to additional content. A backup will be created before installation.
              </p>
              <Button
                variant="primary"
                onClick={handleInstall}
                disabled={!hasClient || clientRunning || operating}
                loading={operating && operationType === 'install'}
                className="w-full"
              >
                {operating && operationType === 'install' ? 'Installing...' : 'Install DLC Unlocker'}
              </Button>
            </div>
          </VisionCard>
        ) : (
          <VisionCard>
            <div className="space-y-3">
              <p className="text-sm text-white/80">
                DLC Unlocker is installed. Click below to remove it.
              </p>
              <Button
                variant="danger"
                onClick={handleUninstall}
                disabled={clientRunning || operating}
                loading={operating && operationType === 'uninstall'}
                className="w-full"
              >
                {operating && operationType === 'uninstall' ? 'Uninstalling...' : 'Uninstall DLC Unlocker'}
              </Button>
            </div>
          </VisionCard>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <ErrorToast message={error} onClose={() => setError(null)} />
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 rounded-lg bg-green-600/20 border border-green-600/50 text-green-300 text-sm"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">✓</span>
            <span>{success}</span>
          </div>
        </motion.div>
      )}

      {/* Information */}
      <VisionCard>
        <div className="text-xs text-white/60 space-y-2">
          <p className="font-semibold text-white/80 mb-2">ℹ About DLC Unlocker</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Provides access to additional in-game content</li>
            <li>Works with both EA App and Origin clients</li>
            <li>Automatic backup is created before installation</li>
            <li>Can be safely uninstalled at any time</li>
            <li>Requires game client to be closed during operation</li>
          </ul>
        </div>
      </VisionCard>
    </div>
  );
};

export const DLCUnlockerSettings = React.memo(DLCUnlockerSettingsComponent);

export default DLCUnlockerSettings;
