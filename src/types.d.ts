export interface IElectron {
  requestPython: (request: any) => Promise<any>;
  onPythonProgress: (id: string, callback: (data: any) => void) => () => void;
  onPythonLog: (callback: (data: any) => void) => () => void;
  onBackendReady: (callback: () => void) => () => void;
  onBackendDisconnected: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electron: IElectron;
  }
}
