import * as fs from 'fs/promises';

import { dialog, IpcMainInvokeEvent } from 'electron';

import { BaseIPCHandler } from '../../lib/ipc/handler';
import { Bus } from '../../lib/bus';
import NBT from 'mcnbt';
import { createDeferred, nbtToStructedRoot } from '../../lib/utils';

interface ISaveResult {
  canceled: boolean;
  filename?: string;
  root?: StructedNBTRoot;
}

class SaveNBTHandler extends BaseIPCHandler {
  constructor(bus: Bus) {
    super(bus, 'save-nbt');
  }

  async handle(event: IpcMainInvokeEvent, root: StructedNBTRoot, saveAs: boolean): Promise<ISaveResult> {
    let filename = this.bus.openedInfo.filename;
    if (saveAs) {
      const ret = await dialog.showSaveDialog(this.bus.mainWindow, {
        title: 'Save NBT file',
        filters: [
          { name: 'NBT Files', extensions: [ 'nbt' ] },
          { name: 'Dat Files', extensions: [ 'dat' ] },
          { name: 'All Files', extensions: [ '*' ] },
        ],
        properties: [ 'showOverwriteConfirmation' ],
      });
      if (ret.canceled) {
        return { canceled: true };
      }
      filename = ret.filePath;
    }

    const ret = await this.buildNBTBuffer(root, this.bus.openedInfo.compressed);

    await fs.writeFile(filename, ret.buffer, { encoding: 'binary' });

    this.bus.openedInfo.filename = filename;
    this.bus.openedInfo.nbt = ret.nbt;

    return {
      canceled: false,
      filename,
      root: nbtToStructedRoot(ret.nbt),
    };
  }

  buildTag(node: StructedNBTTag) {
    switch (node.type) {
      case 'byte': {
        const tag = new NBT.Tags.TAGByte();
        tag.id = node.key;
        tag.setValue(node.value);
        return tag;
      }

      case 'short': {
        const tag = new NBT.Tags.TAGShort();
        tag.id = node.key;
        tag.setValue(node.value);
        return tag;
      }

      case 'int': {
        const tag = new NBT.Tags.TAGInt();
        tag.id = node.key;
        tag.setValue(node.value);
        return tag;
      }

      case 'long': {
        const tag = new NBT.Tags.TAGLong();
        tag.id = node.key;
        tag.setValue(node.value);
        return tag;
      }

      case 'float': {
        const tag = new NBT.Tags.TAGFloat();
        tag.id = node.key;
        tag.setValue(node.value);
        return tag;
      }

      case 'double': {
        const tag = new NBT.Tags.TAGDouble();
        tag.id = node.key;
        tag.setValue(node.value);
        return tag;
      }

      case 'byte_array': {
        const tag = new NBT.Tags.TAGByteArray();
        tag.id = node.key;
        tag.value = node.value;
        return tag;
      }

      case 'string': {
        const tag = new NBT.Tags.TAGString();
        tag.id = node.key;
        tag.setValue(node.value);
        return tag;
      }

      case 'list': {
        const tag = new NBT.Tags.TAGList();
        tag.id = node.key;
        tag.value = [];
        tag.childType = node.childrenType;
        for (const child of node.value) {
          tag.value.push(this.buildTag(child));
        }
        return tag;
      }

      case 'compound': {
        const tag = new NBT.Tags.TAGCompound();
        tag.id = node.key;
        tag.value = {};
        for (const child of node.value) {
          tag.value[child.key] = this.buildTag(child);
        }
        return tag;
      }

      case 'int_array': {
        const tag = new NBT.Tags.TAGIntArray();
        tag.id = node.key;
        tag.value = node.value;
        return tag;
      }

      default:
        throw new Error(`Unknown tag type: ${node.type}`);
    }
  }

  buildNBTBuffer(root: StructedNBTRoot, compress: boolean): Promise<{ nbt: NBT, buffer: Buffer }> {
    const nbt = new NBT();
    for (const node of root) {
      const tag = this.buildTag(node);
      (nbt.root as { [key: string]: typeof tag })[tag.id] = tag;
    }

    if (!compress) {
      let buf: Buffer;
      try {
        buf = nbt.writeToBuffer();
      } catch (e) {
        return Promise.reject(e);
      }

      return Promise.resolve({ nbt, buffer: buf });
    }

    const deferred = createDeferred<{ nbt: NBT, buffer: Buffer }>();

    nbt.writeToCompressedBuffer((err?: Error, buff?: Buffer) => {
      if (err) {
        deferred.reject(err);
        return;
      }

      deferred.resolve({ nbt, buffer: buff });
    });

    return deferred.promise;
  }
}

export default SaveNBTHandler;
