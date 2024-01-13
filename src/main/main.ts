/* eslint global-require: off, no-console: off, promise/always-return: off */

// todo: user alerts

// todo: boot:
// app.setLoginItemSettings( {
// 	openAtLogin: false, // or true
// } )

import { BrowserWindow, app } from 'electron';
import Logger from 'electron-log/main';
import { $errors, $messages } from '../config/strings';
import { debugInfo, is } from './util';

import appListeners from './app-listeners';

import { createMainWindow } from './create-window';
import debugging from './debugging';
import errorHandling from './error-handling';
import ipc from './ipc';
import logger from './logger';
import protocol from './protocol';
import { resetApp } from './reset';
import SystemTray from './tray';
import windows from './windows';

console.time(app.name);
let mainWindow: BrowserWindow | null = null;

const start = () => {
	// Initialize the error handler
	errorHandling.initialize();

	// Initialize logger
	logger.initialize();

	// Register ipcMain listeners
	ipc.initialize();

	// Enable electron debug and source map support
	debugging.initialize();

	// Register app listeners, e.g. `app.on()`
	appListeners.register();
};

// This happens when the app is loaded, AFTER the 'ready' event is fired
app
	.whenReady()
	.then(async () => {
		// initialize  the logger for any renderer process
		Logger.initialize({ preload: true });
		console.timeLog(app.name, $messages.ready);

		// Log Node/Electron versions
		Logger.info(debugInfo());

		if (is.debug) {
			await debugging.installExtensions();

			// Reset the app and store to default settings
			resetApp();
		}
	})
	.then(async () => {
		// Create the main browser window.
		mainWindow = await createMainWindow(mainWindow);
		windows.mainWindow = mainWindow;
	})
	.then(() => {
		// Add remaining app listeners
		appListeners.ready();

		// Setup Tray
		windows.tray = new SystemTray();

		// Register custom protocol like `app://`
		protocol.initialize();
	})
	.then(() => console.timeLog(app.name, $messages.started))
	.finally(() => {
		// Idle
		console.timeLog(app.name, $messages.idle);
		Logger.status($messages.idle);
	})
	.catch((error: Error) => {
		Logger.error($errors.prefix_main, error);
	});

// LAUNCH THE APP
console.timeLog(app.name, $messages.init);
start();
