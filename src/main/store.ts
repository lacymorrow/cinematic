import { CustomAcceleratorsType } from '@/types/keyboard';
import Store from 'electron-store';
import {
	DEFAULT_KEYBINDS,
	DEFAULT_SETTINGS,
	SettingsType,
} from '../config/settings';

export interface CollectionStoreType {
	[key: string]: CollectionItemType;
}

export interface LibraryStoreType {
	[key: string]: MediaType;
}

export interface CacheType {
	cached_at: number;
	value: any;
}

export type AppMessageType = string;

export type AppMessageLogType = AppMessageType[];

export type HistoryActionType = 'view' | 'watch' | 'like' | 'dislike' | 'added';

export interface HistoryType {
	action: HistoryActionType;
	timestamp: number;
	id: string;
}

export interface StoreType {
	library: LibraryStoreType;
	genres: CollectionStoreType;
	playlists: CollectionStoreType;

	cache: {
		[key: string]: CacheType;
	};

	history: HistoryType[];

	settings: SettingsType;
	appMessageLog: AppMessageLogType; // Public-facing console.log()
	keybinds: CustomAcceleratorsType; // Custom keybinds/accelerators/global shortcuts
}

const schema: Store.Schema<StoreType> = {
	genres: {
		type: 'object',
		default: {},
	},
	library: {
		type: 'object',
		default: {},
	},
	playlists: {
		type: 'object',
		default: {},
	},
	cache: {
		type: 'object',
		default: {},
	},
	history: {
		type: 'array',
		default: [],
	},
	appMessageLog: {
		type: 'array',
		default: [],
	},
	keybinds: {
		type: 'object',
		properties: {
			quit: {
				type: 'string',
			},
			reset: {
				type: 'string',
			},
		},
		default: DEFAULT_KEYBINDS,
	},
	settings: {
		type: 'object',
		properties: {
			paths: {
				type: 'array',
			},
			allowAnalytics: {
				type: 'boolean',
			},
			allowAutoUpdate: {
				type: 'boolean',
			},
			allowSounds: {
				type: 'boolean',
			},
			sidebarLayout: {
				type: 'array',
			},
			showSidebar: {
				type: 'boolean',
			},
			allowNotifications: {
				type: 'boolean',
			},
			notifcationType: {
				type: 'string',
				enum: ['system', 'app', 'all'],
			},
			showDockIcon: {
				type: 'boolean',
			},
			showTrayIcon: {
				type: 'boolean',
			},
			quitOnWindowClose: {
				type: 'boolean',
			},
			theme: {
				type: 'string',
				enum: ['system', 'light', 'dark'],
			},
			thumbnailSize: {
				type: 'string',
				enum: ['small', 'medium', 'large'],
			},
			visibleSidebarElements: {
				type: 'array',
			},
			viewMode: {
				type: 'string',
				enum: ['grid', 'list'],
			},
		},
		default: DEFAULT_SETTINGS,
	},
};

const store = new Store<StoreType>({ schema });

export default store;
