/**
 * Mock implementation of window.electron IPC bridge
 * Used for testing React components without requiring the actual Electron process
 */

export const mockElectron = {
  requestPython: jest.fn().mockResolvedValue({ status: 'ok' }),
  onPythonLog: jest.fn(() => jest.fn()),
  onPythonProgress: jest.fn(() => jest.fn()),
  onBackendReady: jest.fn(() => jest.fn()),
  onBackendDisconnected: jest.fn(() => jest.fn()),
};

/**
 * Setup mock electron for a test
 * Clears all mocks and returns the mock object
 */
export const setupMockElectron = () => {
  jest.clearAllMocks();
  // Just reset the mocks, don't redefine the property since it's already defined in setup.tsx
  if ((window as any).electron) {
    (window as any).electron = mockElectron;
  }
  return mockElectron;
};

/**
 * Create a resolved response for requestPython
 */
export const createPythonResponse = (data: any = {}) => ({
  status: 'ok',
  ...data,
});

/**
 * Create a log entry for testing
 */
export const createLogEntry = (
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
) => ({
  timestamp: new Date().toISOString(),
  level,
  message,
});

/**
 * Create progress data for testing
 */
export const createProgressData = (
  status: string,
  current?: number,
  total?: number
) => ({
  status,
  current,
  total,
});
