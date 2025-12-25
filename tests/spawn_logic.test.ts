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
  let mockSidecar: any;

  beforeEach(() => {
    mockSidecar = new EventEmitter();
    mockSidecar.stdout = new EventEmitter();
    mockSidecar.stderr = new EventEmitter();
    mockSidecar.stdin = { write: jest.fn() };
    (spawn as jest.Mock).mockReturnValue(mockSidecar);

    bus = new HybridEventBus();
    jest.clearAllMocks();
  });

  test('should spawn sidecar.py in development', () => {
    (app as any).isPackaged = false;
    bus.start();
    
    expect(spawn).toHaveBeenCalledWith(
      'python',
      [expect.stringContaining('sidecar.py')],
      expect.anything()
    );
  });

  test('should spawn sidecar.exe in production', () => {
    (app as any).isPackaged = true;
    (process as any).resourcesPath = '/mock/resources';
    bus.start();
    
    expect(spawn).toHaveBeenCalledWith(
      path.join('/mock/resources', 'sidecar.exe'),
      [],
      expect.anything()
    );
  });
});
