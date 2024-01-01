/* eslint global-require: off, no-console: off, promise/always-return: off */

import { app, shell } from 'electron';
import Logger from 'electron-log/main';
import { $errors, $messages } from '../config/strings';
import { is } from './util';

import appListeners from './app-listeners';
import { AutoUpdate } from './auto-update';
import { debugInfo } from './constants';
import { createMainWindow } from './create-window';
import debugging from './debugging';
import ipc from './ipc';
import logger from './logger';
import shortcuts from './shortcuts';
import { getSetting, resetStore } from './store';
import windows from './windows';

console.time(app.name);

const start = () => {
	// Initialize logger and error handler
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
			resetStore();
		}
	})
	.then(async () => {
		// Create the main browser window.
		windows.mainWindow = await createMainWindow();

		windows.mainWindow.on('ready-to-show', () => {
			if (!windows.mainWindow) {
				throw new Error($errors.main_window);
			}

			// Setting: Start minimized
			if (process.env.START_MINIMIZED || getSetting('startMinimized')) {
				windows.mainWindow.minimize();
			} else {
				windows.mainWindow.show();
			}

			// Setting: Show dock icon
			if (is.macos && !getSetting('showDockIcon')) {
				app.dock.hide();
			}
		});

		// Clean
		windows.mainWindow.on('closed', () => {
			windows.mainWindow = null;
		});

		// Open urls in the user's browser
		windows.mainWindow.webContents.setWindowOpenHandler((data) => {
			shell.openExternal(data.url);
			return { action: 'deny' };
		});

		// Remove this if your app does not use auto updates
		if (getSetting('autoUpdate')) {
			// eslint-disable-next-line no-new
			new AutoUpdate();
		}

		// Register shortcuts
		shortcuts.init();
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
