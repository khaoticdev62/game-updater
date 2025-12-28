import { HybridEventBus } from '../src/eventBus';
import { spawn } from 'child_process';
import { app } from 'electron';
import path from 'path';
import { EventEmitter } from 'events';

jest.mock('child_process');
jest.mock('electron', () => ({
  app: {
    isPackaged: false
  }
}));

describe('Spawning Logic Verification', () => {
  let bus: HybridEventBus;
  let mockSidecar: unknown;

    beforeEach(() => {
      const emitter = new EventEmitter();
      const mockWithInputs = emitter as unknown as {
        stdout: EventEmitter;
        stderr: EventEmitter;
        stdin: { write: jest.Mock };
      };
      mockWithInputs.stdout = new EventEmitter();
      mockWithInputs.stderr = new EventEmitter();
      mockWithInputs.stdin = { write: jest.fn() };
      mockSidecar = mockWithInputs;
      (spawn as jest.Mock).mockReturnValue(mockSidecar);
      bus = new HybridEventBus();
    jest.clearAllMocks();
  });

  test('should spawn sidecar.py in development', () => {
    (app as unknown as { isPackaged: boolean }).isPackaged = false;
    bus.start();
    
    expect(spawn).toHaveBeenCalledWith(
      'python',
      [expect.stringContaining('sidecar.py')],
      expect.anything()
    );
  });

  test('should spawn sidecar.exe in production', () => {
    (app as unknown as { isPackaged: boolean }).isPackaged = true;
    (process as unknown as { resourcesPath: string }).resourcesPath = '/mock/resources';
    bus.start();
    
    expect(spawn).toHaveBeenCalledWith(
      path.join('/mock/resources', 'sidecar.exe'),
      [],
      expect.anything()
    );
  });
});
