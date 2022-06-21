import { message } from "antd";
import { ipcRenderer } from "electron";
import uuid from 'uuid-1345';

import { OpenNBTReturnValue } from '../../types/ipc_result.d';
import { NBTDataNode } from "./lib/NBTDataNode";

class Bus {
  #root: StructedNBTRoot;

  #currentFileUUID: [ string, (_: string) => void ];
  #currentFilename: [ string, (_: string) => void ];
  #currentModifyVersion: [ number, (_: number) => void ];

  #selectedNode: [ NBTDataNode | null, (_: NBTDataNode | null) => void ];

  constructor() {
    this.#root = [];
    this.#currentFileUUID = [ '', () => { /**/ } ];
    this.#currentFilename = [ '', () => { /**/ } ];
    this.#currentModifyVersion = [ 0, () => { /**/ } ];
    this.#selectedNode = [ null, () => { /**/ } ];
  }

  updateSelectedNodeSetter(updater: [ NBTDataNode | null, (_: NBTDataNode | null) => void ]) {
    this.#selectedNode = updater;
  }

  updateCurrentFileUUIDSetter(updater: [ string, (_: string) => void ]) {
    this.#currentFileUUID = updater;
  }

  updateCurrentFilenameSetter(updater: [ string, (_: string) => void ]) {
    this.#currentFilename = updater;
  }

  updateCurrentModifiedSetter(updater: [ number, (_: number) => void ]) {
    this.#currentModifyVersion = updater;
  }

  get currentFileUUID(): string {
    return this.#currentFileUUID[0];
  }

  set currentFileUUID(uuid: string) {
    this.#currentFileUUID[1](uuid);
  }

  set currentFilename(filename: string) {
    this.#currentFilename[1](filename);
  }

  get currentFilename(): string {
    return this.#currentFilename[0];
  }

  get currentModifyVersion(): number{
    return this.#currentModifyVersion[0];
  }

  set currentModifyVersion(modified: number) {
    this.#currentModifyVersion[1](modified);
  }

  set root(root: StructedNBTRoot) {
    this.#root = root;
  }

  get root(): StructedNBTRoot {
    return this.#root;
  }

  set selectedNode(node: NBTDataNode | null) {
    this.#selectedNode[1](node);
  }

  get selectedNode(): NBTDataNode | null {
    return this.#selectedNode[0];
  }

  async openFile() {
    // TODO(XadillaX): current modified.

    try {
      const ret = (await ipcRenderer.invoke('open-nbt')) as OpenNBTReturnValue;
      if (ret.canceled) {
        return;
      }

      this.currentModifyVersion = 0;
      this.currentFilename = ret.filePaths[0];
      this.root = ret.root;
      this.currentFileUUID = uuid.v1();
      this.selectedNode = null;
    } catch (e) {
      const msg = e.message.replace(/Error invoking remote method .*?Error: /, '');
      message.error(`Failed to open file: ${msg}`);
      return;
    }
  }
}

export { Bus };
