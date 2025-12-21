export interface IElectron {
  requestPython: (request: any) => Promise<any>;
}

declare global {
  interface Window {
    electron: IElectron;
  }
}
