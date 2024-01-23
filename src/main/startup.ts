import { app } from 'electron';
import Logger from 'electron-log/main';
import { $messages } from '../config/strings';
import appListeners from './app-listeners';
import { AutoUpdate } from './auto-update';
import { createMainWindow } from './create-window';
import debugging from './debugging';
import errorHandling from './error-handling';
import logger from './logger';
import { setupDockMenu } from './menu';
import protocol from './protocol';
import { getSetting } from './store';
import SystemTray from './tray';
import { debugInfo, is } from './util';
import windows from './windows';

export const startup = () => {
	// Initialize the error handler
	errorHandling.initialize();

	// Initialize logger
	logger.initialize();

	// Enable electron debug and source map support
	debugging.initialize();

	// Register app listeners, e.g. `app.on()`
	appListeners.register();
};

export const ready = async () => {
	console.timeLog(app.name, $messages.ready);
	// initialize  the logger for any renderer process
	Logger.initialize({ preload: true });

	// Log Node/Electron versions
	Logger.info(debugInfo());

	if (is.debug) {
		await debugging.installExtensions();

		// Reset the app and store to default settings
		// resetApp();
	}

	// Add remaining app listeners
	appListeners.ready();

	// Create the main browser window.
	windows.mainWindow = await createMainWindow();

	// Setup Dock Menu
	setupDockMenu();

	// Setup Tray
	windows.tray = new SystemTray();

	// Register custom protocol like `app://`
	protocol.initialize();

	// Auto updates
	// Remove this if your app does not use auto updates
	if (getSetting('autoUpdate')) {
		// eslint-disable-next-line no-new
		new AutoUpdate();
	}

	// Idle
	Logger.status($messages.mainIdle);
};

export const idle = () => {
	Logger.status($messages.idle);
};
