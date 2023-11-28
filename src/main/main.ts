/* eslint global-require: off, no-console: off, promise/always-return: off */

import { app, BrowserWindow, shell } from 'electron';
import log from 'electron-log/main';
import path from 'path';
import { AutoUpdate } from './auto-update';
import MenuBuilder from './menu';
import { is, resolveHtmlPath } from './util';

import { debugInfo, DEFAULT_PATH } from './constants';
import eventListeners from './event-listeners';
import { scanMedia } from './file';
import ipc from './ipc';
import { clearCache } from './store';
import win from './win';

console.time('startup');

// Prevent window from being garbage collected
let mainWindow: BrowserWindow | null = null;

const start = () => {
  // Register ipcMain listeners
  ipc.init();

  // Enable source map support in production
  if (is.prod) {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
  }

  // Enable debug utilities in development
  if (is.debug) {
    require('electron-debug')();
  }

  // app.on()
  eventListeners.register();
};

// Add debugging extensions like `react-devtools` and `redux-devtools`
const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.warn);
};

const createWindow = async () => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    minWidth: 550,
    height: 728,
    minHeight: 420,
    icon: getAssetPath('icon.png'), // todo: set icon
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  // Save reference to main window
  win.mainWindow = mainWindow;

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AutoUpdate();
};

const ready = async () => {
  // initialize the logger for any renderer process
  log.initialize({ preload: true });

  if (is.debug) {
    log.info(debugInfo());
    await installExtensions();
  }

  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow();
  });

  // todo: load previous session

  // if no session, begin fresh scan
  // clearLibrary(); // todo: remove
  clearCache();
};

// BEGIN
console.timeLog('startup', 'init');

app
  .whenReady()
  .then(ready)
  .then(() => console.timeLog('startup', 'ready'))
  .then(() => {
    if (process.argv.includes('--scan')) {
      scanMedia(DEFAULT_PATH);
    }

    // Idle
  })
  .catch((error: Error) => {
    console.error('cinematic: ', error);
  });

start();

console.timeLog('startup', 'start');
