import { useState, useCallback, useRef } from 'react';

export interface RetryConfig {
  maxAttempts?: number;
  initialDelay?: number; // milliseconds
  maxDelay?: number; // milliseconds
  backoffMultiplier?: number;
  onRetry?: (attempt: number, delay: number) => void;
  onFinal?: (error: Error) => void;
}

export interface RetryState {
  isRetrying: boolean;
  attempt: number;
  lastError: Error | null;
  nextRetryIn: number; // milliseconds
}

/**
 * useRetry Hook
 *
 * Provides automatic retry logic with exponential backoff for async operations.
 * Automatically retries failed operations with increasing delays between attempts.
 *
 * Features:
 * - Exponential backoff: delay = initialDelay * (backoffMultiplier ^ attempt)
 * - Configurable max attempts, delays, and backoff factor
 * - Tracks retry state (attempt number, last error, next retry delay)
 * - Callbacks for monitoring retry progress
 * - Cancellable retries
 * - Type-safe operation execution
 *
 * Exponential Backoff Example:
 * - Attempt 1: Wait 1000ms
 * - Attempt 2: Wait 2000ms
 * - Attempt 3: Wait 4000ms
 * - Attempt 4: Wait 8000ms
 * - Attempt 5: Wait 16000ms (capped at maxDelay)
 *
 * @param config - Retry configuration
 * @returns Tuple of [execute function, retry state, cancel function, reset function]
 *
 * @example
 * ```tsx
 * const [execute, state, cancel, reset] = useRetry({
 *   maxAttempts: 5,
 *   initialDelay: 1000,
 *   maxDelay: 30000,
 *   backoffMultiplier: 2,
 *   onRetry: (attempt, delay) => {
 *     console.log(`Retry attempt ${attempt}, waiting ${delay}ms`);
 *   }
 * });
 *
 * // Use in async operation
 * const result = await execute(async () => {
 *   return await window.electron.requestPython({ command: 'ping' });
 * });
 * ```
 */
export function useRetry(config: RetryConfig = {}) {
  const {
    maxAttempts = 5,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    onRetry,
    onFinal
  } = config;

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attempt: 0,
    lastError: null,
    nextRetryIn: 0
  });

  const cancelledRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Cancel any pending retry
   */
  const cancel = useCallback(() => {
    cancelledRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setState(prev => ({ ...prev, isRetrying: false }));
  }, []);

  /**
   * Reset retry state
   */
  const reset = useCallback(() => {
    cancelledRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setState({
      isRetrying: false,
      attempt: 0,
      lastError: null,
      nextRetryIn: 0
    });
  }, []);

  /**
   * Execute operation with automatic retry on failure
   */
  const execute = useCallback(
    async <T,>(operation: () => Promise<T>): Promise<T> => {
      cancelledRef.current = false;
      let lastError: Error | null = null;
      let attempt = 0;

      while (attempt < maxAttempts) {
        try {
          // Check if cancelled
          if (cancelledRef.current) {
            throw new Error('Operation cancelled');
          }

          setState(prev => ({
            ...prev,
            attempt: attempt + 1,
            lastError: null,
            isRetrying: attempt > 0
          }));

          // Execute the operation
          return await operation();
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          attempt++;

          // Check if we should retry
          if (attempt >= maxAttempts) {
            setState(prev => ({
              ...prev,
              isRetrying: false,
              lastError,
              attempt
            }));

            onFinal?.(lastError);
            throw lastError;
          }

          // Calculate delay with exponential backoff
          const delay = Math.min(
            initialDelay * Math.pow(backoffMultiplier, attempt - 1),
            maxDelay
          );

          setState(prev => ({
            ...prev,
            lastError,
            attempt,
            isRetrying: true,
            nextRetryIn: delay
          }));

          onRetry?.(attempt, delay);

          // Wait before retrying
          await new Promise<void>((resolve, reject) => {
            timeoutRef.current = setTimeout(() => {
              if (cancelledRef.current) {
                reject(new Error('Operation cancelled during retry delay'));
              } else {
                resolve();
              }
            }, delay);
          });
        }
      }

      // Should not reach here, but just in case
      throw lastError || new Error('Operation failed after max attempts');
    },
    [maxAttempts, initialDelay, maxDelay, backoffMultiplier, onRetry, onFinal]
  );

  return [execute, state, cancel, reset] as const;
}

/**
 * Helper function to wrap an IPC request with automatic retry
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  config?: RetryConfig
): Promise<T> {
  let lastError: Error | null = null;
  const maxAttempts = config?.maxAttempts ?? 5;
  const initialDelay = config?.initialDelay ?? 1000;
  const maxDelay = config?.maxDelay ?? 30000;
  const backoffMultiplier = config?.backoffMultiplier ?? 2;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      config?.onRetry?.(attempt + 1, 0);
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (attempt >= maxAttempts - 1) {
        config?.onFinal?.(lastError);
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );

      config?.onRetry?.(attempt + 2, delay);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Operation failed after max attempts');
}

export default useRetry;
