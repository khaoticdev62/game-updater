import React, { useEffect, useState } from 'react';

/**
 * SplashScreen Component
 *
 * Loading screen displayed on application startup.
 * Shows the Sims 4 Updater logo with glassmorphism design and backend connection status.
 *
 * Props:
 *   - isVisible: Controls visibility of the splash screen
 *   - backendStatus: Current backend status ('connecting' | 'connected' | 'error')
 *   - onComplete: Callback fired when splash should close (typically on backend ready)
 *   - progress: Optional loading progress (0-100) for future extensibility
 *
 * Features:
 *   - Crystal logo display
 *   - Real-time backend connection status display
 *   - Glassmorphism background design
 *   - Loading bar
 */

interface SplashScreenProps {
  isVisible: boolean;
  backendStatus: 'connecting' | 'connected' | 'error';
  onComplete: () => void;
  progress?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  isVisible,
  backendStatus,
  onComplete,
  progress = 0,
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Auto-increment progress for visual feedback
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        const next = prev + Math.random() * 15;
        return Math.min(next, 90); // Cap at 90% until backend is ready
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isVisible]);

  // Update to 100% when connected
  useEffect(() => {
    if (backendStatus === 'connected') {
      setDisplayProgress(100);
    }
  }, [backendStatus]);

  // Auto-close when connected
  useEffect(() => {
    if (backendStatus === 'connected') {
      const timer = setTimeout(() => {
        onComplete();
      }, 600); // Brief delay for smooth fade-out
      return () => clearTimeout(timer);
    }
  }, [backendStatus, onComplete]);

  const getStatusText = () => {
    switch (backendStatus) {
      case 'connecting':
        return 'Initializing backend services...';
      case 'connected':
        return 'Ready';
      case 'error':
        return 'Connection failed';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connecting':
        return 'text-cyan-400';
      case 'connected':
        return 'text-emerald-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-cyan-400';
    }
  };

  const getStatusDot = () => {
    switch (backendStatus) {
      case 'connecting':
        return 'bg-cyan-400 animate-pulse';
      case 'connected':
        return 'bg-emerald-400';
      case 'error':
        return 'bg-red-400';
      default:
        return 'bg-cyan-400';
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Background: Glassmorphic mesh gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        style={{
          opacity: backendStatus === 'error' ? 0.95 : 0.98,
        }}
      />

      {/* Mesh gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(
            from 180deg at 50% 0%,
            #0ea5e9 0deg,
            #06b6d4 90deg,
            #0891b2 180deg,
            #06b6d4 270deg,
            #0ea5e9 360deg
          )`,
          opacity: backendStatus === 'error' ? 0.1 : 0.2,
        }}
      />

      {/* Glass effect overlay */}
      <div className="absolute inset-0 backdrop-blur-3xl opacity-20" />

      {/* Content container */}
      <div className="relative h-screen w-screen flex flex-col items-center justify-center">
        {/* Logo container with glow effect */}
        <div className="relative mb-12">
          {/* Outer glow halo */}
          <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-r from-cyan-400/20 via-blue-400/10 to-cyan-500/20 blur-3xl" />

          {/* Crystal logo */}
          <svg
            viewBox="0 0 512 512"
            className="w-32 h-32 drop-shadow-2xl relative z-10"
          >
                <defs>
                  {/* Crystal gradients */}
                  <linearGradient id="crystal-core" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>

                  <linearGradient id="crystal-shadow" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.3" />
                  </linearGradient>

                  <radialGradient id="glass-highlight" cx="35%" cy="35%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </radialGradient>

                  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow
                      dx="0"
                      dy="8"
                      stdDeviation="6"
                      floodOpacity="0.3"
                      floodColor="#000000"
                    />
                  </filter>
                </defs>

                {/* Main crystal body: 8-facet isometric gem */}
                <g id="crystal-main" filter="url(#shadow)">
                  {/* Front upper-left facet */}
                  <path
                    d="M 256 80 L 180 160 L 180 260 L 256 180 Z"
                    fill="url(#crystal-core)"
                    stroke="#1d4ed8"
                    strokeWidth="0.5"
                    opacity="0.95"
                  />

                  {/* Front upper-right facet */}
                  <path
                    d="M 256 80 L 332 160 L 332 260 L 256 180 Z"
                    fill="url(#crystal-core)"
                    stroke="#06b6d4"
                    strokeWidth="0.5"
                    opacity="0.98"
                  />

                  {/* Top center peak */}
                  <path
                    d="M 180 160 L 256 80 L 332 160 L 256 140 Z"
                    fill="#06b6d4"
                    stroke="none"
                    opacity="0.85"
                  />

                  {/* Middle left facet */}
                  <path
                    d="M 180 160 L 140 280 L 180 380 L 256 300 Z"
                    fill="url(#crystal-shadow)"
                    stroke="#0c4a6e"
                    strokeWidth="0.5"
                    opacity="0.92"
                  />

                  {/* Middle right facet */}
                  <path
                    d="M 332 160 L 372 280 L 332 380 L 256 300 Z"
                    fill="url(#crystal-shadow)"
                    stroke="#06b6d4"
                    strokeWidth="0.5"
                    opacity="0.88"
                  />

                  {/* Front lower-left facet */}
                  <path
                    d="M 180 260 L 140 380 L 180 380 L 256 300 Z"
                    fill="#0ea5e9"
                    stroke="#1d4ed8"
                    strokeWidth="0.5"
                    opacity="0.92"
                  />

                  {/* Front lower-right facet */}
                  <path
                    d="M 332 260 L 372 380 L 332 380 L 256 300 Z"
                    fill="#06b6d4"
                    stroke="#0ea5e9"
                    strokeWidth="0.5"
                    opacity="0.88"
                  />

                  {/* Bottom point */}
                  <path
                    d="M 140 380 L 256 440 L 372 380 L 256 400 Z"
                    fill="#3b82f6"
                    stroke="#1d4ed8"
                    strokeWidth="0.5"
                    opacity="0.9"
                  />
                </g>

                {/* Glass highlight overlay */}
                <ellipse
                  cx="220"
                  cy="160"
                  rx="45"
                  ry="70"
                  fill="url(#glass-highlight)"
                  opacity="0.6"
                />

                {/* Bright inner glow */}
                <ellipse
                  cx="280"
                  cy="240"
                  rx="30"
                  ry="50"
                  fill="#ffffff"
                  opacity="0.15"
                />
          </svg>
        </div>

        {/* Application title */}
        <h1 className="text-4xl font-bold text-white mb-2 tracking-wider">
          SIMS 4 UPDATER
        </h1>

        {/* Subtitle */}
        <p className="text-cyan-400 text-sm font-light tracking-widest mb-8">
          Game Content Manager
        </p>

        {/* Status section */}
        <div className="flex flex-col items-center gap-4 mb-12">
              {/* Status indicator dot and text */}
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusDot()}`} />
                <p className={`text-sm font-medium ${getStatusColor()} transition-colors duration-300`}>
                  {getStatusText()}
                </p>
              </div>

          {/* Progress bar */}
          <div className="relative w-64 h-1 rounded-full bg-glass-light backdrop-blur-md overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 rounded-full transition-all duration-300"
              style={{ width: `${displayProgress}%` }}
            />
          </div>

          {/* Progress percentage */}
          <p className="text-xs text-slate-400 mt-2">
            {Math.round(displayProgress)}%
          </p>
        </div>

        {/* Loading indicator (only shown during connecting) */}
        {backendStatus === 'connecting' && (
          <div className="flex gap-2">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"
                style={{ animationDelay: `${index * 0.2}s` }}
              />
            ))}
          </div>
        )}

        {/* Error message (only shown on error) */}
        {backendStatus === 'error' && (
          <div className="mt-4 px-6 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-red-400 text-sm font-medium">
              Failed to connect to backend. Please check your network connection.
            </p>
          </div>
        )}
      </div>

      {/* Decorative corner accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-400/10 to-transparent rounded-full blur-3xl" />
    </div>
  );
};

export default SplashScreen;
