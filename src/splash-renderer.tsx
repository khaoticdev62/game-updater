import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import SplashScreen from './components/SplashScreen';
import './index.css';

/**
 * Splash Screen Renderer
 *
 * This is the entry point for the splash window.
 * It handles the splash screen lifecycle and communicates with the main process.
 *
 * Flow:
 * 1. Render with 'connecting' status
 * 2. Listen for 'backend-ready' event from main process
 * 3. Transition to 'connected' status
 * 4. Wait for smooth fade-out animation (600ms)
 * 5. Send 'splash-complete' message to main process
 * 6. Main process closes splash window and shows main window
 */

const SplashApp = () => {
  const [backendStatus, setBackendStatus] = useState<'connecting' | 'connected' | 'error'>(
    'connecting'
  );
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    // Listen for backend ready event from main process
    window.electron?.onBackendReady(() => {
      console.log('[Splash] Backend ready event received');
      setBackendStatus('connected');
    });

    // Listen for backend error event (if applicable)
    window.electron?.onBackendError?.(() => {
      console.error('[Splash] Backend error event received');
      setBackendStatus('error');
    });

    // Fallback: if no backend event after 30 seconds, assume error
    const fallbackTimer = setTimeout(() => {
      if (backendStatus === 'connecting') {
        console.warn('[Splash] Backend timeout - no ready signal after 30s');
        setBackendStatus('error');
      }
    }, 30000);

    return () => clearTimeout(fallbackTimer);
  }, []);

  const handleSplashComplete = () => {
    console.log('[Splash] Hiding splash screen');
    setIsSplashVisible(false);

    // Notify main process that splash is complete
    setTimeout(() => {
      window.electron?.splashComplete?.();
    }, 100);
  };

  return (
    <SplashScreen
      isVisible={isSplashVisible}
      backendStatus={backendStatus}
      onComplete={handleSplashComplete}
    />
  );
};

// Mount React app to DOM
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <SplashApp />
    </React.StrictMode>
  );
}
