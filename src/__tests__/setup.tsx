import '@testing-library/jest-dom';
import React from 'react';

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock window.electron for IPC testing
Object.defineProperty(window, 'electron', {
  value: {
    requestPython: jest.fn(),
    onPythonLog: jest.fn(() => jest.fn()),
    onPythonProgress: jest.fn(() => jest.fn()),
    onBackendReady: jest.fn(() => jest.fn()),
    onBackendDisconnected: jest.fn(() => jest.fn()),
  },
  writable: true,
});

// Mock framer-motion AnimatePresence and motion components
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: {
    div: ({
      children,
      className,
      ...props
    }: {
      children?: React.ReactNode;
      className?: string;
      [key: string]: any;
    }) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
    button: ({
      children,
      className,
      ...props
    }: {
      children?: React.ReactNode;
      className?: string;
      [key: string]: any;
    }) => (
      <button className={className} {...props}>
        {children}
      </button>
    ),
  },
}));

// Suppress console errors in tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
