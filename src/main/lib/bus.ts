import { BrowserWindow } from "electron";

class Bus {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }
}

export { Bus };
