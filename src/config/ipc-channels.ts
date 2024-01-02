// Whitelist channels for IPC
export type Channels = string;

// Main -> Renderer
const SETTINGS_UPDATED = 'settings-updated';
const APP_STATUS_MESSAGE = 'app-status-message';

// Renderer -> Main
const GET_APP_NAME = 'get-app-name';
const GET_SETTINGS = 'get-settings';
const GET_MESSAGES = 'get-messages';
const GET_APP_MENU = 'get-app-menu';

const SET_SETTINGS = 'set-settings';

const TRIGGER_APP_MENU_ITEM_BY_ID = 'trigger-app-menu-item-by-id';
const OPEN_URL = 'open-url';

export const ipcChannels = {
	// main -> renderer
	APP_STATUS_MESSAGE,
	SETTINGS_UPDATED,

	// renderer -> main
	GET_APP_NAME,
	GET_APP_MENU,
	GET_MESSAGES,
	GET_SETTINGS,

	SET_SETTINGS,

	TRIGGER_APP_MENU_ITEM_BY_ID,
	OPEN_URL,
};
