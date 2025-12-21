export interface IElectron {
  requestPython: (request: any) => Promise<any>;
  onPythonProgress: (id: string, callback: (data: any) => void) => () => void;
}

declare global {
  interface Window {
    electron: IElectron;
  }
}
