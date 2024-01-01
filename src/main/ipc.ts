import { app, ipcMain, shell } from 'electron';
import { ipcChannels } from '../config/ipc-channels';
import { SettingsType } from '../config/settings';
import { getAppMessages, getSettings, setSettings } from './store';

export default {
	initialize() {
		ipcMain.handle(ipcChannels.GET_APP_NAME, () => app.getName());
		ipcMain.handle(ipcChannels.GET_SETTINGS, getSettings);
		ipcMain.handle(ipcChannels.GET_MESSAGES, getAppMessages);

		ipcMain.handle(
			ipcChannels.SET_SETTINGS,
			(_event, settings: Partial<SettingsType>) => {
				setSettings(settings);
			},
		);

		// Open a URL in the default browser
		ipcMain.on(ipcChannels.OPEN_URL, (_event: any, url: string) => {
			shell.openExternal(url);
		});
	},
};
