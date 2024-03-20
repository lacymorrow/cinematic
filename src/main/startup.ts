import { app } from 'electron';
import Logger from 'electron-log/main';
import { $init } from '../config/strings';
import analytics from './analytics';
import appFlags from './app-flags';
import appListeners from './app-listeners';
import { AutoUpdate } from './auto-update';
import { createChildWindow, createMainWindow } from './create-window';
import debugging from './debugging';
import errorHandling from './error-handling';
import kb from './keyboard';
import logger from './logger';
import { setupDockMenu } from './menu';
import protocol from './protocol';
import sounds from './sounds';
import tray from './tray';
import { debugInfo, is } from './util';
import windows from './windows';

export const startup = () => {
	console.timeLog(app.name, $init.startup);

	// Initialize logger
	logger.initialize();

	// Initialize analytics
	analytics.initialize();
	analytics.track('app_started');

	// Initialize the error handler
	errorHandling.initialize();

	if (is.debug) {
		// Reset the app and store to default settings
		// resetApp();
	}

	// Enable electron debug and source map support
	debugging.initialize();

	// App CLI flags
	appFlags.initialize();

	// Register app listeners, e.g. `app.on()`
	appListeners.register();

	Logger.status($init.started);
	console.timeLog(app.name, $init.started);
};

export const ready = async () => {
	Logger.status($init.started);
	console.timeLog(app.name, $init.ready);

	// Log Node/Electron versions
	Logger.info(debugInfo());

	if (is.debug) {
		await debugging.installExtensions();
	}

	// Add remaining app listeners
	appListeners.ready();

	// Setup keyboard shortcuts
	kb.registerKeyboardShortcuts();

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
	Logger.status($init.mainIdle);
	console.timeLog(app.name, $init.mainIdle);
};

export const idle = async () => {
	sounds.play('STARTUP');
	windows.childWindow = await createChildWindow();

	// ... do something with your app

	Logger.status($init.idle);
	console.timeLog(app.name, $init.idle);
};
