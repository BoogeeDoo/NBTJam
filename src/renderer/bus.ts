import { message } from "antd";
import { ipcRenderer } from "electron";
import uuid from 'uuid-1345';

import { OpenNBTReturnValue } from '../../types/ipc_result.d';
import { NBTDataNode } from "./lib/NBTDataNode";

class Bus {
  #root: StructedNBTRoot;

  #loading: [ string, (_: string) => void ];
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
    this.#loading = [ '', () => { /**/ } ];

    ipcRenderer.on('trigger-open-file', () => {
      this.openFile();
    });

    ipcRenderer.on('trigger-save-file', () => {
      this.triggerSaveFile();
    });

    ipcRenderer.on('trigger-save-file-as', () => {
      this.triggerSaveFile(true);
    });
  }

  updateLoadingSetter(updater: [ string, (_: string) => void ]) {
    this.#loading = updater;
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

  set loading(loading: string) {
    this.#loading[1](loading);
  }

  get loading(): string {
    return this.#loading[0];
  }

  async triggerSaveFile(saveAs = false) {
    if (!this.currentFilename || !this.currentFileUUID) {
      message.error('No file is opened.');
      return;
    }

    console.log('triggerSaveFile', this.currentModifyVersion, saveAs);
    if (!this.currentModifyVersion && !saveAs) {
      return;
    }

    this.loading = 'Saving file...';
    let ret;
    try {
      ret = await ipcRenderer.invoke('save-nbt', this.root, saveAs);
    } catch (e) {
      const msg = e.message.replace(/Error invoking remote method .*?Error: /, '');
      message.error(`Failed to save file: ${msg}`);
      this.loading = '';
      return;
    }

    if (ret.canceled) {
      this.loading = '';
      return;
    }

    this.currentFilename = ret.filename;
    this.currentModifyVersion = 0;
    this.root = ret.root;
    this.loading = '';
  }

  async openFile() {
    this.loading = 'Opening file...';

    if (this.#currentModifyVersion[0]) {
      if (!confirm('You have unsaved changes. Are you sure to open a new file?')) {
        this.loading = '';
        return;
      }
    }

    try {
      const ret = (await ipcRenderer.invoke('open-nbt')) as OpenNBTReturnValue;
      if (ret.canceled) {
        this.loading = '';
        return;
      }

      this.currentModifyVersion = 0;
      this.currentFilename = ret.filePaths[0];
      this.root = ret.root;
      this.currentFileUUID = uuid.v1();
      this.selectedNode = null;
      this.loading = '';
    } catch (e) {
      const msg = e.message.replace(/Error invoking remote method .*?Error: /, '');
      message.error(`Failed to open file: ${msg}`);
      this.loading = '';
      return;
    }
  }
}

export { Bus };
