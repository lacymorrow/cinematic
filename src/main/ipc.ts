import { Menu, app, ipcMain, shell } from 'electron';
import { ipcChannels } from '../config/ipc-channels';
import { SettingsType } from '../config/settings';
import { openMediaPathDialog } from './dialog';
import { scanMedia } from './file';
import { serializeMenu, triggerMenuItemById } from './menu';
import {
	HistoryActionType,
	addToHistory,
	addToPlaylist,
	clearLibrary,
	deletePlaylist,
	getAppMessages,
	getGenres,
	getLibrary,
	getPlaylists,
	getSettings,
	setMediaLike,
	setSettings,
} from './store';

export default {
	initialize() {
		ipcMain.handle(ipcChannels.GET_APP_NAME, () => app.getName());
		ipcMain.handle(ipcChannels.GET_APP_MENU, () =>
			serializeMenu(Menu.getApplicationMenu()),
		);
		ipcMain.handle(ipcChannels.GET_GENRES, getGenres);
		ipcMain.handle(ipcChannels.GET_LIBRARY, getLibrary);
		ipcMain.handle(ipcChannels.GET_PLAYLISTS, getPlaylists);
		ipcMain.handle(ipcChannels.GET_SETTINGS, getSettings);
		ipcMain.handle(ipcChannels.GET_MESSAGES, getAppMessages);

		ipcMain.handle(
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
