import { ipcChannels } from '../config/ipc-channels';
import { NotificationOptions } from '../types/notification';
import { getSetting } from './store';
import windows from './windows';

const notification = (options: NotificationOptions) => {
	if (getSetting('allowNotifications')) {
		windows.mainWindow?.webContents.send(ipcChannels.APP_NOTIFICATION, options);
	}
};

export default notification;
