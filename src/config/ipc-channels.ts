// Whitelist channels for IPC
export type Channels = string;

// Main -> Renderer
const ADD_MEDIA_PATH = 'add-media-path';
const LIBRARY_UPDATED = 'library-updated';
const SETTINGS_UPDATED = 'settings-updated';
const APP_STATUS_MESSAGE = 'app-status-message'; // for the renderer to display status messages
const APP_NOTIFICATION = 'app-notification'; // to display a notification using the OS notification system

const PRELOAD_SOUNDS = 'preload-sounds';
const PLAY_SOUND = 'play-sound';

// Renderer -> Main
const CLEAR_LIBRARY = 'clear-library';

const GET_APP_MENU = 'get-app-menu';
const GET_APP_NAME = 'get-app-name';
const GET_LIBRARY = 'get-library';
const GET_GENRES = 'get-genres';
const GET_PLAYLISTS = 'get-playlists';
const GET_APP_PATHS = 'get-app-paths';
const GET_MESSAGES = 'get-messages';
const GET_SETTINGS = 'get-settings';
const SET_SETTINGS = 'set-settings';

const RENDERER_READY = 'renderer-ready';

const TRIGGER_APP_MENU_ITEM_BY_ID = 'trigger-app-menu-item-by-id';

const SET_MEDIA_LIKE = 'set-media-like';
const ADD_TO_HISTORY = 'add-to-history';
const ADD_TO_PLAYLIST = 'add-to-playlist';
const DELETE_PLAYLIST = 'delete-playlist';
const OPEN_MEDIA_PATH = 'open-media-path';
const OPEN_PATH = 'open-path';
const OPEN_URL = 'open-url';

export const ipcChannels = {
	// main -> renderer
	APP_NOTIFICATION,
	APP_STATUS_MESSAGE,
	SETTINGS_UPDATED,
	LIBRARY_UPDATED,
	PRELOAD_SOUNDS,
	PLAY_SOUND,

	// renderer -> main
	CLEAR_LIBRARY,

	GET_GENRES,
	GET_LIBRARY,
	GET_PLAYLISTS,
	RENDERER_READY,
	GET_APP_NAME,
	GET_APP_MENU,
	GET_APP_PATHS,
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
