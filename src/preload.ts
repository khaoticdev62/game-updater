import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  requestPython: (request: any) => ipcRenderer.invoke('python-request', request),
});