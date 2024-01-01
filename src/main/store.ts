import Logger from 'electron-log';
import Store from 'electron-store';
import getUuidByString from 'uuid-by-string';
import { CACHE_TIMEOUT, THROTTLE_DELAY } from '../config/config';
import { ipcChannels } from '../config/ipc-channels';
import { DEFAULT_SETTINGS, SettingsType } from '../config/settings';
import { $messages } from '../config/strings';
import { reconcileMovieMeta } from '../lib/reconcile-meta';
import { MediaType } from '../types/file';
import { CollectionItemType } from '../types/media';
import { throttle } from '../utils/throttle';
import win from './window';

type DebouncedFunctionsType = {
	[key: string]: Function;
};

const throttledFunctions: DebouncedFunctionsType = {};

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

	appMessageLog: AppMessageLogType;
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
	settings: {
		type: 'object',
		properties: {
			paths: {
				type: 'array',
			},
			sidebarLayout: {
				type: 'array',
			},
			autoUpdate: {
				type: 'boolean',
			},
			quitOnWindowClose: {
				type: 'boolean',
			},
			showSidebar: {
				type: 'boolean',
			},
			showDockIcon: {
				type: 'boolean',
			},
			showTrayIcon: {
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

const synchronizeApp = () =>
	win?.mainWindow?.webContents.send(ipcChannels.LIBRARY_UPDATED);

const synchronizeSettings = () =>
	win?.mainWindow?.webContents.send(ipcChannels.LIBRARY_UPDATED);

// Throttle the app update
const appWasUpdated = throttle(synchronizeApp, THROTTLE_DELAY);

const appMessageUpdated = () => {
	win?.mainWindow?.webContents.send(
		ipcChannels.APP_STATUS_MESSAGE,
		store.get('appMessageLog'),
	);
};

export const resetStore = () => {
	store.clear();

	synchronizeApp();
	synchronizeSettings();
};

export const clearLibrary = () => {
	store.delete('library');
	store.delete('genres');
	store.delete('playlists');
	store.delete('history');
	store.delete('appMessageLog');
	store.delete('settings');

	synchronizeApp();
};

export const clearCache = () => {
	store.delete('cache');
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
	synchronizeSettings();
};

// Add a media path to the library
export const addPath = (path: string) => {
	const settings = getSettings();

	// check if path already exists
	if (!Array.isArray(settings?.paths) || settings.paths.includes(path)) {
		return;
	}

	settings.paths.push(path);
	store.set('settings', settings);
};

export const updateAppStatusMessage = (message: AppMessageType) => {
	const appMessageLog = store.get('appMessageLog');
	appMessageLog.push(message);
	store.set('appMessageLog', appMessageLog);

	// Sync with renderer
	appMessageUpdated();
};

export const getAppMessages = () => {
	return store.get('appMessageLog');
};

export const getHistory = () => {
	return store.get('history');
};

export const addToHistory = (action: HistoryActionType, id: string) => {
	const history = store.get('history');

	// check that action or id are different from the last one
	if (
		history.length > 0 &&
		history[history.length - 1].action === action &&
		history[history.length - 1].id === id
	) {
		return;
	}

	console.warn('addToHistory', action, id);

	history.push({
		action,
		timestamp: Date.now(),
		id,
	});
	store.set('history', history);
};

export const getLibrary = () => {
	return store.get('library');
};

export const getGenres = () => {
	return store.get('genres');
};

// We don't update the library here, we just add to the genres collection, it gets updated juust after
export const addGenre = ({ genre, id }: { genre: string; id: string }) => {
	const genreId = getUuidByString(genre);
	const genres = store.get('genres');
	if (!genres[genreId]) {
		// This genre doesn't exist yet
		store.set('genres', {
			...genres,
			[genreId]: {
				id: genreId,
				name: genre,
				values: [id],
			},
		});
	} else if (!genres[genreId].values.includes(id)) {
		// This genre exists, add to it
		genres[genreId].values.push(id);
		store.set('genres', genres);
	}
};

export const getMedia = (id: string) => {
	const library = store.get('library');
	if (!id) {
		return;
	}

	return library[id];
};

// This is the actual update, no reconciliation is done here
const upsertMedia = (media: MediaType) => {
	const library = store.get('library');
	const { id } = media;

	library[id] = { ...library[id], ...media };
	store.set('library', library);

	// throttled
	appWasUpdated();
};

const afterUpsertMediaLibrary = (key: string) => {
	if (throttledFunctions[key]) {
		throttledFunctions[key]();
	} else {
		// create a debounced function with the key so if it's called again with the same key it will cancel the previous call
		throttledFunctions[key] = throttle(() => {
			const media = getMedia(key);

			if (!media) {
				return;
			}

			const updatedMedia = reconcileMovieMeta(media);
			upsertMedia(updatedMedia);

			// add to history
			addToHistory('added', key);
		}, THROTTLE_DELAY);
		throttledFunctions[key]();
	}
};
// This is called if we need to run a reconcile
export const upsertMediaLibrary = (media: MediaType) => {
	const { id } = media;

	// todo: not needed?
	if (!id) {
		return;
	}

	media.dateUpdated = Date.now();

	upsertMedia(media);
	afterUpsertMediaLibrary(id);
};

export const setMediaLike = (id: string, like: boolean) => {
	const media = getMedia(id);
	if (!media) {
		return;
	}

	media.liked = like;
	upsertMedia(media);
};

export const getPlaylists = () => {
	return store.get('playlists');
};

// create a playlist or add to existing playlist
export const addToPlaylist = (id: string, name: string) => {
	const isSHA1 = name.match(/^[a-fA-F0-9]{40}$/);
	const playlistId = isSHA1 ? name : getUuidByString(name);
	const playlists = store.get('playlists');
	if (!playlists[playlistId]) {
		// This playlist doesn't exist yet
		store.set('playlists', {
			...playlists,
			[playlistId]: {
				id: playlistId,
				name,
				values: [id],
			},
		});
	} else if (!playlists[playlistId].values.includes(id)) {
		// This genre exists, add to it
		playlists[playlistId].values.push(id);
		store.set('playlists', playlists);
	}
	appWasUpdated();
};

export const deletePlaylist = (id: string) => {
	const playlists = store.get('playlists');
	delete playlists[id];
	store.set('playlists', playlists);
	appWasUpdated();
};

export const getCachedObject = (key: string) => {
	const cache = store.get('cache');

	if (cache && Object.hasOwn(cache, key)) {
		const cached = cache[key];
		if (cached) {
			if (cached.cached_at + CACHE_TIMEOUT > Date.now()) {
				// cache expired
				Logger.log($messages.cache_expire, key);
				delete cache[key];
				store.set('cache', cache);
			} else {
				Logger.log($messages.cache_hit, key);
				return cached.value;
			}
		}
	}
};

// store a value in cache with a timestamp
export const setCachedObject = (key: string, value: any) => {
	const cache = store.get('cache');

	cache[key] = {
		cached_at: Date.now(),
		value,
	};
};

export default store;
