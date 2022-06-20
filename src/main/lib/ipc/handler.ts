import { ipcMain, IpcMainInvokeEvent } from "electron";

import { Bus } from "../bus";

class BaseIPCHandler {
  #bus: Bus;

  constructor(bus: Bus, name: string) {
    this.#bus = bus;
    ipcMain.handle(name, this.handle.bind(this));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  handle(event: IpcMainInvokeEvent, ...args: any[]): Promise<any> {
    throw new Error('Not implemented');
  }

  get bus(): Bus {
    return this.#bus;
  }
}

export { BaseIPCHandler };
