import { Notification } from 'electron';
import Logger from 'electron-log/main';
import { ipcChannels } from '../config/ipc-channels';
import { NotificationOptions } from '../types/notification';
import { getSetting } from './store';
import windows from './windows';

const mainNotification = (options: NotificationOptions) => {
	Logger.info(
		`Sending notification to main process: ${options.title} - ${options.body}`,
	);
	new Notification(options).show();
};

const rendererNotification = (options: NotificationOptions) => {
	Logger.info(
		`Sending notification to renderer process: ${options.title} - ${options.body}`,
	);
	windows.mainWindow?.webContents.send(ipcChannels.APP_NOTIFICATION, options);
};

export const notification = (options: NotificationOptions) => {
	// Use either the system notification or the renderer notification
	if (getSetting('allowNotifications')) {
		const type = getSetting('notifcationType');
		if (type === 'system' || type === 'all') {
			mainNotification(options);
		}

		if (type === 'all' || type !== 'system') {
			rendererNotification(options);
		}
	} else {
		Logger.info(`Notification not sent: ${options.title} - ${options.body}`);
	}
};

export default { renderer: rendererNotification, main: mainNotification };
