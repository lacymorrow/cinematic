// Whitelist channels for IPC
export type Channels = string;

// Main -> Renderer
export const ADD_MEDIA_PATH = 'add-media-path';
export const SETTINGS_UPDATED = 'settings-updated';
export const APP_STATUS_MESSAGE = 'app-status-message';

// Renderer -> Main
export const GET_APP_NAME = 'get-app-name';
export const GET_SETTINGS = 'get-settings';
export const SET_SETTINGS = 'set-settings';
export const GET_MESSAGES = 'get-messages';

export const OPEN_URL = 'open-url';

export const ipcChannels = {
	// main -> renderer
	APP_STATUS_MESSAGE,
	SETTINGS_UPDATED,

	// renderer -> main
	GET_APP_NAME,
	GET_MESSAGES,
	GET_SETTINGS,
	SET_SETTINGS,
	OPEN_URL,
};
