/* eslint global-require: off, no-console: off, promise/always-return: off */

/*
Todo:
- Inputs should reset to default value when the settings are reset
- Debounce Slider
*/

import { app } from 'electron';
import Logger from 'electron-log/main';
import { $errors, $messages } from '../config/strings';

import ipc from './ipc';
import { ready, startup } from './startup';

// Initialize the timer
console.time(app.name);
console.timeLog(app.name, $messages.init);

// Register ipcMain listeners
ipc.initialize();

// SETUP APP (runs after startup())
app
	.whenReady()
	.then(ready) // <-- this is where the app is initialized
	.catch((error: Error) => {
		Logger.error($errors.main, error);
	});

// LAUNCH THE APP
startup();

// See the idle() function in src/main/startup.ts
// it's called in the ipcMain.on(ipcChannels.RENDERER_READY) listener
// when the renderer process is ready
