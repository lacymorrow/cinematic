import { app } from 'electron';
import Logger from 'electron-log/main';
import { $messages } from '../config/strings';
import appListeners from './app-listeners';
import { AutoUpdate } from './auto-update';
import { createChildWindow, createMainWindow } from './create-window';
import debugging from './debugging';
import errorHandling from './error-handling';
import logger from './logger';
import { setupDockMenu } from './menu';
import protocol from './protocol';
import sounds from './sounds';
import tray from './tray';
import { debugInfo, is } from './util';
import windows from './windows';

export const startup = () => {
	// Initialize logger
	logger.initialize();

	// Initialize the error handler
	errorHandling.initialize();

	if (is.debug) {
		// Reset the app and store to default settings
		// resetApp();
	}

	// Enable electron debug and source map support
	debugging.initialize();

	// Register app listeners, e.g. `app.on()`
	appListeners.register();
};

export const ready = async () => {
	console.timeLog(app.name, $messages.ready);

	// Log Node/Electron versions
	Logger.info(debugInfo());

	if (is.debug) {
		await debugging.installExtensions();
	}

	// Add remaining app listeners
	appListeners.ready();

	// Create the main browser window.
	windows.mainWindow = await createMainWindow();

	// Setup Dock Menu
	setupDockMenu();

	// Setup Tray
	tray.initialize();

	// Register custom protocol like `app://`
	protocol.initialize();

	// Auto updates
	// eslint-disable-next-line no-new
	new AutoUpdate();

	// Idle
	Logger.status($messages.mainIdle);
};

export const idle = async () => {
	// ... do something with your app

	Logger.status($messages.idle);
	sounds.play('STARTUP');
	windows.childWindow = await createChildWindow();
};
