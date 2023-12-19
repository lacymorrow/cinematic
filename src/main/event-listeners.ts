import { app } from 'electron';
import EXIT_CODES from '../config/exit-codes';

const register = () => {
	/**
	 * Add event listeners...
	 */

	app.on('will-quit', () => {
		// Unregister all shortcuts.
		// keyboard.unregisterShortcuts();
	});

	// Sending a `SIGINT` (e.g: Ctrl-C) to an Electron app that registers
	// a `beforeunload` window event handler results in a disconnected white
	// browser window in GNU/Linux and macOS.
	// The `before-quit` Electron event is triggered in `SIGINT`, so we can
	// make use of it to ensure the browser window is completely destroyed.
	// See https://github.com/electron/electron/issues/5273
	app.on('before-quit', () => {
		app.releaseSingleInstanceLock();
		process.exit(EXIT_CODES.SUCCESS);
	});

	app.on('window-all-closed', () => {
		// Respect the OSX convention of having the application in memory even
		// after all windows have been closed
		if (process.platform !== 'darwin') {
			app.quit();
		}
	});

	// Security measures
	app.on('web-contents-created', (_event, webContents) => {
		// Security #13: Prevent navigation
		// https://www.electronjs.org/docs/latest/tutorial/security#13-disable-or-limit-navigation
		webContents.on('will-navigate', (event, _navigationUrl) => {
			event.preventDefault();
		});
	});
};

export default { register };
