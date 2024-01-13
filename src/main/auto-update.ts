import { ProgressInfo, autoUpdater } from 'electron-updater';

import { shell } from 'electron';
import Logger from 'electron-log';
import { $messages } from '../config/strings';
import dialog from './dialog';
import dock from './dock';
import { notification } from './notifications';
import sound from './sounds';
import { getSetting } from './store';
import { is } from './util';
import windows from './windows';

const FOUR_HOURS = 1000 * 60 * 60 * 4;

export class AutoUpdate {
	constructor() {
		Logger.status($messages.auto_update);

		// Configure log debugging to file
		Logger.transports.file.level = 'silly';
		autoUpdater.logger = Logger;

		autoUpdater.checkForUpdatesAndNotify();
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
			title: $messages.update_available,
			body: $messages.update_available_body,
		});

		sound.play('UPDATE');

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
	// Comment this before publishing your first version.
	// It's commented out as it throws an error if there are no published versions.

	// We trycatch here because appx throws errors
	try {
		if (getSetting('autoUpdate')) {
			Logger.info('Setting: Automatic Updates');

			autoUpdater.logger = Logger;
			autoUpdater.on('update-available', onUpdateAvailable);

			if (is.linux) {
				return;
			}

			autoUpdater.on('download-progress', onDownloadProgress);

			autoUpdater.on('update-downloaded', onUpdateDownloaded);

			setInterval(() => {
				autoUpdater.checkForUpdates();
			}, FOUR_HOURS);

			autoUpdater.checkForUpdatesAndNotify();
		}
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
