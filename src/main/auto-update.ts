import { autoUpdater } from 'electron-updater';

import Logger from 'electron-log';
import { $messages } from '../config/strings';

export class AutoUpdate {
	constructor() {
		Logger.status($messages.auto_update);

		// Configure log debugging to file
		Logger.transports.file.level = 'silly';
		autoUpdater.logger = Logger;

		autoUpdater.checkForUpdatesAndNotify();
	}
}

export const install = () => autoUpdater.quitAndInstall();
