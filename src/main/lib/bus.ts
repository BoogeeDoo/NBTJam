import { BrowserWindow } from 'electron';
import { NBTInfo } from '../ipc/handler/open_nbt';

class Bus {
  mainWindow: BrowserWindow;
  openedInfo: NBTInfo;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }
}

export { Bus };
