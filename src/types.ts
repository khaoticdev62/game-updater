export interface DLC {
  name: string;
  folder: string;
  status: 'Installed' | 'Missing' | 'Update Available';
  selected: boolean;
  category?: string;
  description?: string;
  release_date?: string;
  source?: string;
}

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
