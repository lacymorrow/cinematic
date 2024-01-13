// Whitelist channels for IPC
export type Channels = string;

// Main -> Renderer
const APP_UPDATED = 'app-updated';
const APP_STATUS_MESSAGE = 'app-status-message'; // for the renderer to display status messages
const APP_NOTIFICATION = 'app-notification'; // to display a notification using the OS notification system

const PRELOAD_SOUNDS = 'preload-sounds';
const PLAY_SOUND = 'play-sound';

// Renderer -> Main
const RENDERER_READY = 'renderer-ready';
const GET_APP_NAME = 'get-app-name';
const GET_APP_MENU = 'get-app-menu';
const GET_MESSAGES = 'get-messages';
const GET_SETTINGS = 'get-settings';
const SET_SETTINGS = 'set-settings';

const TRIGGER_APP_MENU_ITEM_BY_ID = 'trigger-app-menu-item-by-id';
const OPEN_URL = 'open-url';

export const ipcChannels = {
	// main -> renderer
	APP_NOTIFICATION,
	APP_STATUS_MESSAGE,
	APP_UPDATED,
	PRELOAD_SOUNDS,
	PLAY_SOUND,

	// renderer -> main
	RENDERER_READY,
	GET_APP_NAME,
	GET_APP_MENU,
	GET_MESSAGES,
	GET_SETTINGS,

	SET_SETTINGS,

	TRIGGER_APP_MENU_ITEM_BY_ID,
	OPEN_URL,
};
