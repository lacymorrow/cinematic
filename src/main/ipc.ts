import { Menu, app, ipcMain, shell } from 'electron';
import { ipcChannels } from '../config/ipc-channels';
import { SettingsType } from '../config/settings';
import { CustomAcceleratorsType } from '../types/keyboard';
import { getOS } from '../utils/getOS';
import { openMediaPathDialog } from './dialog';
import { scanMedia } from './file';
import kb from './keyboard';
import { notification } from './notifications';
import { rendererPaths } from './paths';
import sounds from './sounds';
import { idle } from './startup';
import { HistoryActionType } from './store';
import {
	addToHistory,
	addToPlaylist,
	clearLibrary,
	deletePlaylist,
	getAppMessages,
	getGenres,
	getKeybinds,
	getLibrary,
	getPlaylists,
	getSettings,
	setMediaLike,
	setSettings,
} from './store-actions';
import { is } from './util';
import { serializeMenu, triggerMenuItemById } from './utils/menu-utils';

export default {
	initialize() {
		// Activate the idle state when the renderer process is ready
		ipcMain.once(ipcChannels.RENDERER_READY, () => {
			idle();
		});

		ipcMain.handle(ipcChannels.GET_GENRES, getGenres);
		ipcMain.handle(ipcChannels.GET_LIBRARY, getLibrary);
		ipcMain.handle(ipcChannels.GET_PLAYLISTS, getPlaylists);
		ipcMain.handle(ipcChannels.GET_APP_PATHS, () => {
			return rendererPaths;
		});
		ipcMain.handle(ipcChannels.GET_SETTINGS, getSettings);
		ipcMain.handle(ipcChannels.GET_MESSAGES, getAppMessages);

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
		ipcMain.handle(ipcChannels.GET_RENDERER_SYNC, (id) => {
			return {
				settings: getSettings(),
				keybinds: getKeybinds(),
				messages: getAppMessages(),
				appMenu: serializeMenu(Menu.getApplicationMenu()),
			};
		});

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

		ipcMain.handle(
			ipcChannels.SET_MEDIA_LIKE,
			(_event, id: string, liked: boolean) => {
				setMediaLike(id, liked);
			},
		);

		ipcMain.handle(
			ipcChannels.ADD_TO_PLAYLIST,
			(_event, id: string, playlist: string) => {
				addToPlaylist(id, playlist);
			},
		);

		// These do not send data back to the renderer process
		// Show a notification
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

		ipcMain.on(ipcChannels.DELETE_PLAYLIST, (_event: any, id: string) => {
			deletePlaylist(id);
		});

		// Add the user's video folder to the library
		ipcMain.on(ipcChannels.ADD_MEDIA_PATH, (_event: any) => {
			scanMedia(app.getPath('videos'));
		});

		ipcMain.on(
			ipcChannels.ADD_TO_HISTORY,
			(_event: any, action: HistoryActionType, id: string) => {
				addToHistory(action, id);
			},
		);

		// uses main process for file dialog
		ipcMain.on(ipcChannels.OPEN_MEDIA_PATH, (_event: any) => {
			openMediaPathDialog();
		});

		// Open a video file in the default video player
		ipcMain.on(ipcChannels.OPEN_PATH, (_event: any, path: string) => {
			addToHistory('watch', path);

			shell.openPath(path);
		});

		// Open a URL in the default browser
		ipcMain.on(ipcChannels.OPEN_URL, (_event: any, url: string) => {
			shell.openExternal(url);
		});

		ipcMain.on(ipcChannels.CLEAR_LIBRARY, () => {
			clearLibrary();
		});
	},
};
