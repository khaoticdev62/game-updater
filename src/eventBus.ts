import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { EventEmitter } from 'events';
import { PythonRequest } from './types';
import { app } from 'electron';

export class HybridEventBus extends EventEmitter {
  private sidecar: ChildProcess | null = null;
  private pendingRequests: Map<string, (data: unknown) => void> = new Map();
  private defaultTimeout = 30000; // 30 seconds default

  start() {
    let pythonPath = 'python';
    // Robust path resolution: try both levels of depth (for .webpack/main/ and tests/)
    let scriptPath = path.join(__dirname, '..', 'sidecar.py');
    if (!fs.existsSync(scriptPath)) {
      scriptPath = path.join(__dirname, '..', '..', 'sidecar.py');
    }

    if (app && app.isPackaged) {
      // In production, we spawn the bundled executable
      // PyInstaller usually outputs to 'dist/sidecar/sidecar.exe' or 'dist/sidecar.exe'
      // After bundling with Electron, it should be in process.resourcesPath
      pythonPath = path.join(process.resourcesPath, 'sidecar.exe');
      scriptPath = ''; // No script needed for executable
    }
    
    const args = scriptPath ? [scriptPath] : [];
    this.sidecar = spawn(pythonPath, args, { stdio: ['pipe', 'pipe', 'pipe'] });

    this.sidecar.stdout?.on('data', (data: Buffer) => {
      data.toString().split('\n').forEach((line: string) => {
        if (!line.trim()) return;
        try {
          const message = JSON.parse(line);
          if (message.type === 'ready') {
            this.emit('backend-ready');
            return;
          }
          if (message.timestamp && message.level) {
            this.emit('python-log', message);
            return;
          }
          if (message.id) {
            if (message.type === 'progress') {
              this.emit(`progress-${message.id as string}`, message.data);
            } else {
              const resolver = this.pendingRequests.get(message.id as string);
              if (resolver) {
                resolver(message);
                this.pendingRequests.delete(message.id as string);
              }
            }
          }
        } catch {
          console.log(`[Python Stdout]: ${line}`);
        }
      });
    });

    this.sidecar.stderr?.on('data', (data: Buffer) => {
      console.error(`[Python Stderr]: ${data.toString()}`);
    });

    this.sidecar.on('exit', (code) => {
      console.error(`Sidecar process exited with code ${code}`);
      this.emit('backend-disconnected');
      // Attempt to restart after a delay
      setTimeout(() => this.start(), 3000);
    });
  }

  request(payload: PythonRequest, timeoutMs?: number): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(7);
      const fullRequest = { ...payload, id };
      
      const timeout = timeoutMs || this.defaultTimeout;
      const timer = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request timed out after ${timeout}ms (command: ${payload.command})`));
        }
      }, timeout);

      this.pendingRequests.set(id, (data) => {
        clearTimeout(timer);
        resolve(data);
      });

      if (this.sidecar && this.sidecar.stdin) {
        this.sidecar.stdin.write(JSON.stringify(fullRequest) + '\n');
      } else {
        clearTimeout(timer);
        this.pendingRequests.delete(id);
        reject(new Error('Sidecar process not started or stdin unavailable'));
      }
    });
  }

  stop() {
    this.sidecar?.kill();
  }
}
