import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { ProgressData, PythonRequest } from './types';

contextBridge.exposeInMainWorld('electron', {

  requestPython: (request: PythonRequest) => ipcRenderer.invoke('python-request', request),

  onPythonProgress: (id: string, callback: (data: ProgressData) => void) => {

    const listener = (_event: IpcRendererEvent, data: ProgressData) => callback(data);

    ipcRenderer.on(`python-progress-${id}`, listener);

        return () => {
          ipcRenderer.removeListener(`python-progress-${id}`, listener);
        };

      },

      onPythonLog: (callback: (data: unknown) => void) => {

        const listener = (_event: IpcRendererEvent, data: unknown) => callback(data);

            ipcRenderer.on('python-log', listener);

            return () => {
              ipcRenderer.removeListener('python-log', listener);
            };

          },

          onBackendReady: (callback: () => void) => {

            const listener = () => callback();

            ipcRenderer.on('backend-ready', listener);

            return () => {
              ipcRenderer.removeListener('backend-ready', listener);
            };

          },

          onBackendDisconnected: (callback: () => void) => {
            const listener = () => callback();
            ipcRenderer.on('backend-disconnected', listener);
            return () => {
              ipcRenderer.removeListener('backend-disconnected', listener);
            };
          },

        });
