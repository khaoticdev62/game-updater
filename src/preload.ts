import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {

  requestPython: (request: any) => ipcRenderer.invoke('python-request', request),

  onPythonProgress: (id: string, callback: any) => {

    const listener = (event: any, data: any) => callback(data);

    ipcRenderer.on(`python-progress-${id}`, listener);

        return () => ipcRenderer.removeListener(`python-progress-${id}`, listener);

      },

      onPythonLog: (callback: any) => {

        const listener = (event: any, data: any) => callback(data);

            ipcRenderer.on('python-log', listener);

            return () => ipcRenderer.removeListener('python-log', listener);

          },

          onBackendReady: (callback: any) => {

            const listener = () => callback();

            ipcRenderer.on('backend-ready', listener);

            return () => ipcRenderer.removeListener('backend-ready', listener);

          },

          onBackendDisconnected: (callback: any) => {
            const listener = () => callback();
            ipcRenderer.on('backend-disconnected', listener);
            return () => ipcRenderer.removeListener('backend-disconnected', listener);
          },

        });
