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
  onBackendError?: (callback: () => void) => () => void;
  splashComplete?: () => void;
}

export interface ClientInfo {
  type: 'ea_app' | 'origin' | null;
  path: string | null;
  running: boolean;
  version?: string | null;
}

export interface UnlockerPaths {
  path: string;
  config_exists: boolean;
  version_dll_exists: boolean;
  backup_available: boolean;
}

export interface DLCUnlockerStatus {
  installed: boolean;
  client: ClientInfo;
  unlocker: UnlockerPaths;
}

export interface UnlockerOperationResult {
  success: boolean;
  message: string;
}

export interface UnlockerConfig {
  [section: string]: {
    [key: string]: string;
  };
}

declare global {
  interface Window {
    electron: IElectron;
  }
}
