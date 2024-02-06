import { Menu, app, ipcMain, shell } from 'electron';
import { getOS } from '../utils/getOS';
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
import { notification } from './notifications';
import sounds from './sounds';
import { is } from './util';

export default {
	initialize() {
		// Activate the idle state when the renderer process is ready
		ipcMain.once(ipcChannels.RENDERER_READY, () => {
			idle();
		});

		// This is called ONCE, don't use it for anything that changes
		ipcMain.handle(ipcChannels.GET_APP_INFO, () => {
			const os = getOS();
			return {
				name: app.getName(),
				version: app.getVersion(),
				os,
				isMac: os === 'mac',
				isWindows: os === 'windows',
				isLinux: os === 'linux',
				isDev: is.debug,
				paths: rendererPaths,
			};
		});

		// These send data back to the renderer process
		ipcMain.handle(ipcChannels.GET_APP_MENU, () =>
			serializeMenu(Menu.getApplicationMenu()),
		);
		ipcMain.handle(ipcChannels.GET_MESSAGES, getAppMessages);
		ipcMain.handle(ipcChannels.GET_KEYBINDS, getKeybinds);
		ipcMain.handle(ipcChannels.GET_SETTINGS, getSettings);

		// These do not send data back to the renderer process
		ipcMain.on(
			ipcChannels.SET_KEYBIND,
			(_event, keybind: keyof CustomAcceleratorsType, accelerator: string) => {
				kb.setKeybind(keybind, accelerator);
			},
		);

		ipcMain.on(
			ipcChannels.SET_SETTINGS,
			(_event, settings: Partial<SettingsType>) => {
				setSettings(settings);
			},
		);

		ipcMain.on(ipcChannels.APP_NOTIFICATION, (_event, options: any) => {
			notification(options);
		});

		// Play a sound
		ipcMain.on(ipcChannels.PLAY_SOUND, (_event: any, sound: string) => {
			sounds.play(sound);
		});

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
