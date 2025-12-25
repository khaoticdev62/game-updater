import { app, BrowserWindow, ipcMain } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { EventEmitter } from 'events';

// Hybrid Event Bus: Continuous streaming + Request/Response
class HybridEventBus extends EventEmitter {
  private sidecar: ChildProcess | null = null;
  private pendingRequests: Map<string, (data: any) => void> = new Map();

  start() {
    const pythonPath = 'python';
    const scriptPath = path.join(__dirname, '..', '..', 'sidecar.py');
    
    this.sidecar = spawn(pythonPath, [scriptPath], { stdio: ['pipe', 'pipe', 'pipe'] });

    this.sidecar.stdout?.on('data', (data) => {
      data.toString().split('\n').forEach((line: string) => {
        if (!line.trim()) return;
        try {
          const message = JSON.parse(line);
          if (message.timestamp && message.level) {
            this.emit('python-log', message);
            return;
          }
          if (message.id) {
            if (message.type === 'progress') {
              this.emit(`progress-${message.id}`, message.data);
            } else {
              const resolver = this.pendingRequests.get(message.id);
              if (resolver) {
                resolver(message);
                this.pendingRequests.delete(message.id);
              }
            }
          }
        } catch (e) {
          console.log(`[Python Stdout]: ${line}`);
        }
      });
    });

    this.sidecar.stderr?.on('data', (data) => {
      console.error(`[Python Stderr]: ${data}`);
    });
  }

  request(payload: any): Promise<any> {
    return new Promise((resolve) => {
      const id = Math.random().toString(36).substring(7);
      const fullRequest = { ...payload, id };
      this.pendingRequests.set(id, resolve);
      this.sidecar?.stdin?.write(JSON.stringify(fullRequest) + '\n');
    });
  }

  stop() {
    this.sidecar?.kill();
  }
}

const eventBus = new HybridEventBus();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

ipcMain.handle('python-request', async (event, request) => {
  const id = Math.random().toString(36).substring(7);
  const fullRequest = { ...request, id };

  return new Promise((resolve) => {
    // Listen for progress from the bus and forward to renderer
    const progressListener = (data: any) => {
      event.sender.send(`python-progress-${id}`, data);
    };
    
    eventBus.on(`progress-${id}`, progressListener);

    eventBus.request(fullRequest).then((response) => {
      eventBus.removeListener(`progress-${id}`, progressListener);
      resolve(response);
    });
  });
});

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  eventBus.start();
  createWindow();

  eventBus.on('python-log', (data) => {
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('python-log', data);
    });
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  eventBus.stop();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
