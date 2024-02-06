import { Menu, app, ipcMain, shell } from 'electron';
import { CustomAcceleratorsType } from '../types/keyboard';
import { ipcChannels } from '../config/ipc-channels';
import { SettingsType } from '../config/settings';
import { serializeMenu, triggerMenuItemById } from './menu';
import { rendererPaths } from './paths';
import { idle } from './startup';
import {
	getAppMessages,
	getKeybinds,
	getSettings,
	setSettings,
} from './store-actions';
import kb from './keyboard';

export default {
	initialize() {
		// Activate the idle state when the renderer process is ready
		ipcMain.once(ipcChannels.RENDERER_READY, () => {
			idle();
		});

		// These send data back to the renderer process
		ipcMain.handle(ipcChannels.GET_APP_NAME, () => app.getName());
		ipcMain.handle(ipcChannels.GET_APP_MENU, () =>
			serializeMenu(Menu.getApplicationMenu()),
		);
		ipcMain.handle(ipcChannels.GET_APP_PATHS, () => {
			return rendererPaths;
		});
		ipcMain.handle(ipcChannels.GET_MESSAGES, getAppMessages);
		ipcMain.handle(ipcChannels.GET_SETTINGS, getSettings);
		ipcMain.handle(
			ipcChannels.SET_SETTINGS,
			(_event, settings: Partial<SettingsType>) => {
				setSettings(settings);
			},
		);

		ipcMain.handle(ipcChannels.GET_KEYBINDS, getKeybinds);
		ipcMain.handle(
			ipcChannels.SET_KEYBIND,
			(_event, keybind: keyof CustomAcceleratorsType, accelerator: string) => {
				kb.setKeybind(keybind, accelerator);
			},
		);

		// These do not send data back to the renderer process
		// Trigger an app menu item by its id
		ipcMain.on(
			ipcChannels.TRIGGER_APP_MENU_ITEM_BY_ID,
			(_event: any, id: string) => {
				triggerMenuItemById(Menu.getApplicationMenu(), id);
			},
		);

		// Open a URL in the default browser
		ipcMain.on(ipcChannels.OPEN_URL, (_event: any, url: string) => {
			shell.openExternal(url);
		});
	},
};
