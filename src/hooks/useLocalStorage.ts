import { useState, useEffect, useCallback } from 'react';

/**
 * useLocalStorage Hook
 *
 * Custom React hook for managing state synchronized with localStorage.
 * Automatically saves state changes and restores on mount.
 *
 * Features:
 * - Automatic JSON serialization/deserialization
 * - Type-safe state management
 * - Error handling for quota exceeded
 * - SSR-safe (checks if localStorage is available)
 * - Debounced saving to prevent excessive writes
 *
 * @param key - localStorage key
 * @param initialValue - Default value if not in storage
 * @param options - Optional configuration
 * @returns Tuple of [state, setState, removeFromStorage]
 *
 * @example
 * ```tsx
 * const [manifestUrl, setManifestUrl] = useLocalStorage('manifestUrl', '');
 * const [selectedVersion, setSelectedVersion, clear] = useLocalStorage('version', 'latest');
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: {
    debounceMs?: number;
    errorCallback?: (error: Error) => void;
  }
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const debounceMs = options?.debounceMs ?? 500;
  const errorCallback = options?.errorCallback;

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // Check if localStorage is available
      if (!window.localStorage) {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }

      try {
        return JSON.parse(item) as T;
      } catch {
        // If JSON parsing fails, return initial value
        console.warn(`Failed to parse localStorage value for key "${key}"`);
        return initialValue;
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Error reading from localStorage:', err);
      errorCallback?.(err);
      return initialValue;
    }
  });

  // Debounce timer for saving
  let saveTimer: NodeJS.Timeout | null = null;

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to localStorage with debouncing
        if (saveTimer) {
          clearTimeout(saveTimer);
        }

        saveTimer = setTimeout(() => {
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
          } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            
            if (err.name === 'QuotaExceededError') {
              console.error('localStorage quota exceeded');
              errorCallback?.(new Error('Storage quota exceeded'));
            } else {
              console.error('Error saving to localStorage:', err);
              errorCallback?.(err);
            }
          }
        }, debounceMs);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('Error in useLocalStorage setter:', err);
        errorCallback?.(err);
      }
    },
    [key, storedValue, debounceMs, errorCallback]
  );

  // Function to remove from localStorage
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Error removing from localStorage:', err);
      errorCallback?.(err);
    }
  }, [key, initialValue, errorCallback]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer) {
        clearTimeout(saveTimer);
      }
    };
  }, []);

  return [storedValue, setValue, removeValue];
}

/**
 * Utility function to save application state to localStorage
 * Handles all app-level persistence in one place
 */
export function saveAppState(state: {
  manifestUrl?: string;
  selectedVersion?: string;
  selectedLanguage?: string;
  dlcSelections?: Record<string, boolean>;
}): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    // Save individual state pieces for easy access
    if (state.manifestUrl) {
      window.localStorage.setItem('appState:manifestUrl', state.manifestUrl);
    }
    if (state.selectedVersion) {
      window.localStorage.setItem('appState:selectedVersion', state.selectedVersion);
    }
    if (state.selectedLanguage) {
      window.localStorage.setItem('appState:selectedLanguage', state.selectedLanguage);
    }
    if (state.dlcSelections) {
      window.localStorage.setItem('appState:dlcSelections', JSON.stringify(state.dlcSelections));
    }
  } catch (error) {
    console.error('Error saving app state to localStorage:', error);
  }
}

/**
 * Utility function to load application state from localStorage
 * Returns partial state for any keys that exist
 */
export function loadAppState(): Partial<{
  manifestUrl: string;
  selectedVersion: string;
  selectedLanguage: string;
  dlcSelections: Record<string, boolean>;
}> {
  const state: Partial<{
    manifestUrl: string;
    selectedVersion: string;
    selectedLanguage: string;
    dlcSelections: Record<string, boolean>;
  }> = {};

  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return state;
    }

    const manifestUrl = window.localStorage.getItem('appState:manifestUrl');
    if (manifestUrl) state.manifestUrl = manifestUrl;

    const selectedVersion = window.localStorage.getItem('appState:selectedVersion');
    if (selectedVersion) state.selectedVersion = selectedVersion;

    const selectedLanguage = window.localStorage.getItem('appState:selectedLanguage');
    if (selectedLanguage) state.selectedLanguage = selectedLanguage;

    const dlcSelections = window.localStorage.getItem('appState:dlcSelections');
    if (dlcSelections) {
      try {
        state.dlcSelections = JSON.parse(dlcSelections);
      } catch {
        console.warn('Failed to parse DLC selections from storage');
      }
    }
  } catch (error) {
    console.error('Error loading app state from localStorage:', error);
  }

  return state;
}

/**
 * Utility function to clear all application state from localStorage
 */
export function clearAppState(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    window.localStorage.removeItem('appState:manifestUrl');
    window.localStorage.removeItem('appState:selectedVersion');
    window.localStorage.removeItem('appState:selectedLanguage');
    window.localStorage.removeItem('appState:dlcSelections');
  } catch (error) {
    console.error('Error clearing app state from localStorage:', error);
  }
}

export default useLocalStorage;
