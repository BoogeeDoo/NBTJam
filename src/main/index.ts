import { app, BrowserWindow, Menu, MenuItem, shell } from 'electron';

import { Bus } from './lib/bus';
import { registerIPC } from './ipc/index';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (require('electron-squirrel-startup')) {
  app.quit();
}

let bus: Bus;
const createWindow = async (): Promise<void> => {
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: false,
    icon: './assets/logo.png',
  });

  bus = new Bus(mainWindow);
  await registerIPC(bus);

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  // mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const isMac = process.platform === 'darwin'
const first: MenuItem[] = isMac ? [{
  label: app.name,
  submenu: [
    { role: 'about' },
    { type: 'separator' },
    { role: 'services' },
    { type: 'separator' },
    { role: 'hide' },
    { role: 'hideOthers' },
    { role: 'unhide' },
    { type: 'separator' },
    { role: 'quit' }
  ],
}] as any : [];

const menu = Menu.buildFromTemplate([
  ...first, {
  label: 'File',
  submenu: [{
    label: 'Open NBT File',
    accelerator: 'CmdOrCtrl+O',
    click() {
      bus.mainWindow.webContents.send('trigger-open-file');
    },
  }, {
    label: 'Save NBT File',
    accelerator: 'CmdOrCtrl+S',
    click() {
      bus.mainWindow.webContents.send('trigger-save-file');
    },
  }, {
    label: 'Save NBT File As...',
    accelerator: 'CmdOrCtrl+Shift+S',
    click() {
      bus.mainWindow.webContents.send('trigger-save-file-as');
    },
  }, isMac ? { role: 'close' } : { role: 'quit' }],
}, {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
          ]
        }
      ] as any : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ] as any),
    ],
  },   {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          await shell.openExternal('https://github.com/BoogeeDoo/NBTJam');
        }
      }
    ]
  }]);
Menu.setApplicationMenu(menu);
