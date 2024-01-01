import { autoUpdater } from 'electron-updater';

import Logger from 'electron-log';

export class AutoUpdate {
	constructor() {
		// Configure log debugging to file
		Logger.transports.file.level = 'silly';
		autoUpdater.logger = Logger;

		autoUpdater.checkForUpdatesAndNotify();
	}
}

export const install = () => autoUpdater.quitAndInstall();
