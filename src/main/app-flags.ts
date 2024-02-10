import { app } from 'electron';
import Logger from 'electron-log';
import { $init } from '../config/strings';

const initialize = () => {
	Logger.status($init.appFlags);

	// Prevent multiple instances of the app
	if (!app.requestSingleInstanceLock()) {
		app.quit();
	}
};

export default { initialize };
