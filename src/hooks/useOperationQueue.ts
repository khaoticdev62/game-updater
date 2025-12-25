import { useState, useCallback, useRef } from 'react';

export type OperationType = 'verify' | 'update' | 'download' | 'delete' | 'install';
export type OperationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface QueuedOperation {
  id: string;
  type: OperationType;
  name: string;
  status: OperationStatus;
  progress?: number; // 0-100
  error?: Error;
  startTime?: number;
  endTime?: number;
  result?: unknown;
}

export interface OperationQueueState {
  operations: QueuedOperation[];
  isRunning: boolean;
  currentOperation: QueuedOperation | null;
  totalProgress: number;
  completedCount: number;
  failedCount: number;
}

/**
 * useOperationQueue Hook
 *
 * Manages a queue of async operations with automatic execution.
 * Supports sequential or parallel execution with progress tracking.
 *
 * Features:
 * - Add/remove operations from queue
 * - Sequential or parallel execution modes
 * - Progress tracking per operation and overall
 * - Pause/resume queue execution
 * - Cancel individual operations or entire queue
 * - Error handling and recovery
 * - Operation history
 *
 * @param options - Queue configuration
 * @returns Queue management functions and state
 *
 * @example
 * ```tsx
 * const { add, remove, start, pause, state } = useOperationQueue({
 *   parallel: false
 * });
 *
 * // Add operations
 * add('verify', 'Verify Game Files', async () => {
 *   return await window.electron.requestPython({ command: 'verify_all' });
 * });
 *
 * // Start execution
 * await start();
 * ```
 */
export function useOperationQueue(options?: { parallel?: boolean }) {
  const { parallel = false } = options || {};

  const [state, setState] = useState<OperationQueueState>({
    operations: [],
    isRunning: false,
    currentOperation: null,
    totalProgress: 0,
    completedCount: 0,
    failedCount: 0
  });

  const operationFunctionsRef = useRef<Map<string, () => Promise<unknown>>>(new Map());
  const isPausedRef = useRef(false);
  const isCancelledRef = useRef(false);

  /**
   * Add operation to queue
   */
  const add = useCallback(
    (type: OperationType, name: string, operation: () => Promise<unknown>) => {
      const id = `${type}-${Date.now()}-${Math.random()}`;
      
      setState(prev => ({
        ...prev,
        operations: [
          ...prev.operations,
          {
            id,
            type,
            name,
            status: 'pending' as const,
            progress: 0
          }
        ]
      }));

      operationFunctionsRef.current.set(id, operation);

      return id;
    },
    []
  );

  /**
   * Remove operation from queue
   */
  const remove = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      operations: prev.operations.filter(op => op.id !== id)
    }));
    operationFunctionsRef.current.delete(id);
  }, []);

  /**
   * Update operation progress
   */
  const updateProgress = useCallback(
    (id: string, progress: number) => {
      setState(prev => {
        const operations = prev.operations.map(op =>
          op.id === id ? { ...op, progress: Math.min(100, progress) } : op
        );

        // Calculate total progress
        const totalProgress = Math.round(
          operations.reduce((sum, op) => sum + (op.progress || 0), 0) / operations.length
        );

        return { ...prev, operations, totalProgress };
      });
    },
    []
  );

  /**
   * Start queue execution
   */
  const start = useCallback(async () => {
    setState(prev => ({ ...prev, isRunning: true }));
    isPausedRef.current = false;
    isCancelledRef.current = false;

    try {
      const operations = state.operations;

      if (parallel) {
        // Execute all operations in parallel
        await Promise.allSettled(
          operations.map(async op => {
            if (op.status !== 'pending') return;

            setState(prev => ({
              ...prev,
              currentOperation: op,
              operations: prev.operations.map(o =>
                o.id === op.id ? { ...o, status: 'running' as const, startTime: Date.now() } : o
              )
            }));

            try {
              const operation = operationFunctionsRef.current.get(op.id);
              if (!operation) throw new Error('Operation function not found');

              const result = await operation();

              setState(prev => ({
                ...prev,
                operations: prev.operations.map(o =>
                  o.id === op.id
                    ? {
                        ...o,
                        status: 'completed' as const,
                        progress: 100,
                        endTime: Date.now(),
                        result
                      }
                    : o
                ),
                completedCount: prev.completedCount + 1
              }));
            } catch (error) {
              setState(prev => ({
                ...prev,
                operations: prev.operations.map(o =>
                  o.id === op.id
                    ? {
                        ...o,
                        status: 'failed' as const,
                        error: error instanceof Error ? error : new Error(String(error)),
                        endTime: Date.now()
                      }
                    : o
                ),
                failedCount: prev.failedCount + 1
              }));
            }
          })
        );
      } else {
        // Execute operations sequentially
        for (const op of operations) {
          if (op.status !== 'pending' || isCancelledRef.current) break;

          // Wait if paused
          while (isPausedRef.current && !isCancelledRef.current) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          if (isCancelledRef.current) break;

          setState(prev => ({
            ...prev,
            currentOperation: op,
            operations: prev.operations.map(o =>
              o.id === op.id ? { ...o, status: 'running' as const, startTime: Date.now() } : o
            )
          }));

          try {
            const operation = operationFunctionsRef.current.get(op.id);
            if (!operation) throw new Error('Operation function not found');

            const result = await operation();

            setState(prev => ({
              ...prev,
              operations: prev.operations.map(o =>
                o.id === op.id
                  ? {
                      ...o,
                      status: 'completed' as const,
                      progress: 100,
                      endTime: Date.now(),
                      result
                    }
                  : o
              ),
              completedCount: prev.completedCount + 1
            }));
          } catch (error) {
            setState(prev => ({
              ...prev,
              operations: prev.operations.map(o =>
                o.id === op.id
                  ? {
                      ...o,
                      status: 'failed' as const,
                      error: error instanceof Error ? error : new Error(String(error)),
                      endTime: Date.now()
                    }
                  : o
              ),
              failedCount: prev.failedCount + 1
            }));
          }
        }
      }
    } finally {
      setState(prev => ({ ...prev, isRunning: false, currentOperation: null }));
    }
  }, [state.operations, parallel]);

  /**
   * Pause queue execution
   */
  const pause = useCallback(() => {
    isPausedRef.current = true;
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  /**
   * Resume queue execution
   */
  const resume = useCallback(async () => {
    isPausedRef.current = false;
    setState(prev => ({ ...prev, isRunning: true }));
    await start();
  }, [start]);

  /**
   * Cancel all operations
   */
  const cancel = useCallback(() => {
    isCancelledRef.current = true;
    setState(prev => ({
      ...prev,
      isRunning: false,
      operations: prev.operations.map(op =>
        op.status === 'pending'
          ? { ...op, status: 'cancelled' as const }
          : op
      )
    }));
  }, []);

  /**
   * Clear completed operations
   */
  const clearCompleted = useCallback(() => {
    setState(prev => ({
      ...prev,
      operations: prev.operations.filter(op => op.status === 'pending' || op.status === 'running')
    }));
  }, []);

  /**
   * Clear all operations
   */
  const clearAll = useCallback(() => {
    setState({
      operations: [],
      isRunning: false,
      currentOperation: null,
      totalProgress: 0,
      completedCount: 0,
      failedCount: 0
    });
    operationFunctionsRef.current.clear();
  }, []);

  return {
    add,
    remove,
    updateProgress,
    start,
    pause,
    resume,
    cancel,
    clearCompleted,
    clearAll,
    state
  };
}

export default useOperationQueue;
