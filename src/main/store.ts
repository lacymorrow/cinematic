import Store from 'electron-store';
import { ipcChannels } from '../config/ipc-channels';
import { DEFAULT_SETTINGS, SettingsType } from '../config/settings';
import { CollectionItemType } from '../types/media';
import win from './window';

export interface CollectionStoreType {
	[key: string]: CollectionItemType;
}

export type AppMessageType = string;

export type AppMessageLogType = AppMessageType[];

export interface StoreType {
	settings: SettingsType;

	appMessageLog: AppMessageLogType;
}

const schema: Store.Schema<StoreType> = {
	appMessageLog: {
		type: 'array',
		default: [],
	},
	settings: {
		type: 'object',
		properties: {
			autoUpdate: {
				type: 'boolean',
			},
			showDockIcon: {
				type: 'boolean',
			},
			quitOnWindowClose: {
				type: 'boolean',
			},
			theme: {
				type: 'string',
				enum: ['system', 'light', 'dark'],
			},
		},
		default: DEFAULT_SETTINGS,
	},
};

const store = new Store<StoreType>({ schema });

const synchronizeApp = () =>
	win?.mainWindow?.webContents.send(ipcChannels.SETTINGS_UPDATED);

// Throttle the app update
// const appWasUpdated = throttle(synchronizeApp, THROTTLE_DELAY);

const appMessageUpdated = () => {
	win?.mainWindow?.webContents.send(
		ipcChannels.APP_STATUS_MESSAGE,
		store.get('appMessageLog'),
	);
};

export const resetStore = () => {
	store.clear();

	synchronizeApp();
};

export const getSettings = () => {
	return store.get('settings');
};

export const setSettings = (settings: Partial<SettingsType>) => {
	store.set('settings', {
		...getSettings(),
		...settings,
	});

	// Sync with renderer
	synchronizeApp();
};

export const logAppMessage = (message: AppMessageType) => {
	const appMessageLog = store.get('appMessageLog');
	appMessageLog.push(message);
	store.set('appMessageLog', appMessageLog);

	// Sync with renderer
	appMessageUpdated();
};

export const getAppMessages = () => {
	return store.get('appMessageLog');
};

export default store;
