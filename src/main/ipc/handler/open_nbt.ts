import { dialog } from 'electron';
import NBT from 'mcnbt';

import { OpenNBTReturnValue } from '../../../../types/ipc_result.d';

import { Bus } from '../../lib/bus';
import { BaseIPCHandler } from '../../lib/ipc/handler';
import { createDeferred, nbtToStructedRoot } from '../../lib/utils';

interface NBTInfo {
  filename: string;
  compressed: boolean;
  nbt: NBT;
}

class OpenNBTHandler extends BaseIPCHandler {
  constructor(bus: Bus) {
    super(bus, 'open-nbt');
  }

  async handle(): Promise<OpenNBTReturnValue> {
    const ret: OpenNBTReturnValue = await dialog.showOpenDialog(this.bus.mainWindow, {
      properties: [ 'openFile' ],
      title: 'Open NBT file',
      filters: [
        { name: 'NBT Formatted Files', extensions: [ 'nbt', 'dat' ] },
        { name: 'All Files', extensions: [ '*' ] },
      ],
    });

    if (ret.canceled) {
      return ret;
    }

    const parsed = await OpenNBTHandler.parseFile(ret.filePaths[0]);
    const structed = nbtToStructedRoot(parsed.nbt);

    ret.root = structed;

    return ret;
  }

  static async parseFile(filename: string): Promise<NBTInfo> {
    const nbt = new NBT();
    const deferred = createDeferred<void>();

    let e: Error;
    let compressed = false;
    nbt.loadFromFile(filename, err => {
      if (!err) {
        deferred.resolve();
        return;
      }

      e = err;
      nbt.loadFromZlibCompressedFile(filename, err => {
        if (!err) {
          compressed = true;
          deferred.resolve();
          return;
        }

        deferred.reject(e);
      });
    });

    try {
      await deferred.promise;
    } catch (e) {
      e.message = `[Broken File] ${e.message}`;
      throw e;
    }

    const info: NBTInfo = {
      filename,
      compressed,
      nbt,
    };

    return info;
  }
}

export default OpenNBTHandler;
export { NBTInfo };
