import { ProgressInfo, autoUpdater } from 'electron-updater';

import { shell } from 'electron';
import Logger from 'electron-log/main';
import { $autoUpdate } from '../config/strings';
import dialog from './dialog';
import dock from './dock';
import { notification } from './notifications';
import sounds from './sounds';
import { getSetting } from './store-actions';
import { is } from './util';
import windows from './windows';

const FOUR_HOURS = 1000 * 60 * 60 * 4;

export class AutoUpdate {
	constructor() {
		if (getSetting('allowAutoUpdate')) {
			Logger.status($autoUpdate.autoUpdate);

			// Configure log debugging to file
			Logger.transports.file.level = 'silly';
			autoUpdater.logger = Logger;

			autoUpdater.checkForUpdatesAndNotify();
		}
	}
}

const install = () => autoUpdater.quitAndInstall();

const onDownloadProgress = (progressObject: ProgressInfo) => {
	try {
		let message = `Download speed: ${progressObject.bytesPerSecond}`;
		message = `${message} - Downloaded ${progressObject.percent}%`;
		message = `${message} (${progressObject.transferred}/${progressObject.total})`;
		Logger.info(message);

		// Dock progress bar
		windows.mainWindow?.setProgressBar(progressObject.percent / 100);
	} catch (error) {
		Logger.error('onDownloadProgress', error);
	}
};

const onUpdateAvailable = () => {
	try {
		// Notify user of update
		notification({
			title: $autoUpdate.updateAvailable,
			body: $autoUpdate.updateAvailableBody,
		});

		sounds.play('UPDATE');

		if (is.linux) {
			dialog.openUpdateDialog(() => {
				// AutoUpdater.downloadUpdate()
				shell.openExternal(
					'https://github.com/lacymorrow/crossover/releases/latest',
				);
			});
		}
	} catch (error) {
		Logger.error(error);
	}
};

const onUpdateDownloaded = () => {
	try {
		windows.mainWindow?.setProgressBar(-1);
		dock.setBadge('!');
		notification({
			title: 'CrossOver has been Updated',
			body: 'Relaunch to take effect',
		});
		// sound.play( 'DONE' ) // uncomment if we make notification silent
	} catch (error) {
		Logger.error(error);
	}
};

const update = () => {
	// We trycatch here because appx throws errors
	try {

	// Comment this before publishing your first version.
	// It's commented out as it throws an error if there are no published versions.

	// 	if (getSetting('allowAutoUpdate')) {
	// 		Logger.info('Setting: Automatic Updates');

	// 		autoUpdater.logger = Logger;
	// 		autoUpdater.on('update-available', onUpdateAvailable);

	// 		if (is.linux) {
	// 			return;
	// 		}

	// 		autoUpdater.on('download-progress', onDownloadProgress);

	// 		autoUpdater.on('update-downloaded', onUpdateDownloaded);

	// 		setInterval(() => {
	// 			autoUpdater.checkForUpdates();
	// 		}, FOUR_HOURS);

	// 		autoUpdater.checkForUpdatesAndNotify();
	// 	}
	
	} catch (error) {
		Logger.error(error);
	}
};

export default {
	install,
	onDownloadProgress,
	onUpdateAvailable,
	onUpdateDownloaded,
	update,
};
