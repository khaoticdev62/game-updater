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

export interface ProgressData {
  status: string;
  current?: number;
  total?: number;
  file?: string;
  message?: string;
}

export interface PythonRequest {
  command: string;
  [key: string]: unknown;
}

export interface IElectron {
  requestPython: (request: PythonRequest) => Promise<unknown>;
  onPythonProgress: (id: string, callback: (data: ProgressData) => void) => () => void;
  onPythonLog: (callback: (data: unknown) => void) => () => void;
  onBackendReady: (callback: () => void) => () => void;
  onBackendDisconnected: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electron: IElectron;
  }
}
