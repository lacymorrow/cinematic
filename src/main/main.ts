/* eslint global-require: off, no-console: off, promise/always-return: off */

/*
Todo:
- Allow disabling of the inputs
- Debounce Slider/color picker input
- sass
- Homepage
- Documentation
*/

// TODO: ERROR
// 16:38:08.836 > Main>  Error: Failed to load image from path 'C:\Users\Librarian\electron-hotplate\assets\icons\icon.ico'
//     at Object.initialize (C:\Users\Librarian\electron-hotplate\src\main\tray.ts:26:17)
//     at ready (C:\Users\Librarian\electron-hotplate\src\main\startup.ts:76:7)

import { app } from 'electron';
import Logger from 'electron-log/main';
import { $errors, $init } from '../config/strings';

import ipc from './ipc';

import { ready, startup } from './startup';

// Initialize the timer
console.time(app.name);
console.timeLog(app.name, $init.app);

// Register ipcMain listeners
ipc.initialize();

// SETUP APP (runs after startup())
app
	.whenReady()
	.then(ready) // <-- this is where the app is initialized
	.catch((error: Error) => {
		Logger.error($errors.prefix, error);
	});

// LAUNCH THE APP
startup();

// See the idle() function in src/main/startup.ts
// it's called in the ipcMain.on(ipcChannels.RENDERER_READY) listener
// when the renderer process is ready
