import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {

  requestPython: (request: any) => ipcRenderer.invoke('python-request', request),

  onPythonProgress: (id: string, callback: any) => {

    const listener = (event: any, data: any) => callback(data);

    ipcRenderer.on(`python-progress-${id}`, listener);

    return () => ipcRenderer.removeListener(`python-progress-${id}`, listener);

  },

});
