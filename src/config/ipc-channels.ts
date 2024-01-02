// Whitelist channels for IPC
export type Channels = string;

// Main -> Renderer
export const ADD_MEDIA_PATH = 'add-media-path';
export const LIBRARY_UPDATED = 'library-updated';
export const SETTINGS_UPDATED = 'settings-updated';
export const APP_STATUS_MESSAGE = 'app-status-message';

// Renderer -> Main
export const CLEAR_LIBRARY = 'clear-library';

const GET_APP_MENU = 'get-app-menu';
export const GET_APP_NAME = 'get-app-name';
export const GET_LIBRARY = 'get-library';
export const GET_GENRES = 'get-genres';
export const GET_PLAYLISTS = 'get-playlists';
export const GET_SETTINGS = 'get-settings';
export const SET_SETTINGS = 'set-settings';
export const GET_MESSAGES = 'get-messages';

const TRIGGER_APP_MENU_ITEM_BY_ID = 'trigger-app-menu-item-by-id';

export const SET_MEDIA_LIKE = 'set-media-like';
export const ADD_TO_HISTORY = 'add-to-history';
export const ADD_TO_PLAYLIST = 'add-to-playlist';
export const DELETE_PLAYLIST = 'delete-playlist';
export const OPEN_MEDIA_PATH = 'open-media-path';
export const OPEN_PATH = 'open-path';
export const OPEN_URL = 'open-url';

export const ipcChannels = {
	// main -> renderer
	APP_STATUS_MESSAGE,
	SETTINGS_UPDATED,
	LIBRARY_UPDATED,

	// renderer -> main
	CLEAR_LIBRARY,

	GET_APP_MENU,
	GET_APP_NAME,
	GET_GENRES,
	GET_LIBRARY,
	GET_PLAYLISTS,
	GET_MESSAGES,
	GET_SETTINGS,
	SET_SETTINGS,

	TRIGGER_APP_MENU_ITEM_BY_ID,

	SET_MEDIA_LIKE,
	ADD_TO_HISTORY,
	ADD_TO_PLAYLIST,
	DELETE_PLAYLIST,
	ADD_MEDIA_PATH,
	OPEN_MEDIA_PATH,
	OPEN_PATH,
	OPEN_URL,
};
