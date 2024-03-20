import { MediaType } from '@/types/file';
import { app } from 'electron';
import Logger from 'electron-log';
import getUuidByString from 'uuid-by-string';
import {
	APP_MESSAGES_MAX,
	CACHE_TIMEOUT,
	THROTTLE_DELAY,
} from '../config/config';
import { ipcChannels } from '../config/ipc-channels';
import { SettingsType } from '../config/settings';
import { $messages } from '../config/strings';
import { reconcileMovieMeta } from '../lib/reconcile-meta';
import { throttle } from '../utils/throttle';
import store, { AppMessageType, HistoryActionType } from './store';
import tray from './tray';
import { forEachWindow } from './utils/window-utils';

const synchronizeApp = (changedSettings?: Partial<SettingsType>) => {
	// Sync with main
	if (changedSettings) {
		const keys = Object.keys(changedSettings);

		if (keys.includes('showDockIcon')) {
			app.dock[changedSettings.showDockIcon ? 'show' : 'hide']();
		}

		if (keys.includes('showTrayIcon')) {
			if (changedSettings.showTrayIcon) {
				tray.initialize();
			} else {
				tray.destroy();
			}
		}
	}

	// Sync with renderer
	forEachWindow((win) => {
		win.webContents.send(ipcChannels.LIBRARY_UPDATED);
	});
};

const synchronizeSettings = () =>
	forEachWindow((window) =>
		window.webContents.send(ipcChannels.SETTINGS_UPDATED),
	);

// Throttle the app update
const appWasUpdated = throttle(synchronizeApp, THROTTLE_DELAY);

export const resetStoreSettings = () => {
	Logger.status($messages.resetStore);
	store.delete('settings');
	store.delete('keybinds');

	synchronizeApp();
};

export const resetStore = () => {
	Logger.status($messages.resetStore);
	store.clear();

	synchronizeApp();
	synchronizeSettings();
};

export const getKeybinds = () => {
	return store.get('keybinds');
};

export const getSetting = (setting: keyof SettingsType) => {
	const settings = store.get('settings');
	if (settings[setting] !== undefined) {
		return settings[setting];
	}
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
	synchronizeApp(settings);
	synchronizeSettings();
};

export const addAppMessage = (message: AppMessageType) => {
	let appMessageLog = store.get('appMessageLog');
	if (appMessageLog.length > APP_MESSAGES_MAX) {
		appMessageLog = appMessageLog.slice(0, Math.ceil(APP_MESSAGES_MAX / 2));
	}
	appMessageLog.push(message);
	store.set('appMessageLog', appMessageLog);

	// Sync with renderer
	synchronizeApp();
};

export const getAppMessages = () => {
	const messages = store.get('appMessageLog');

	// Reverse the messages so that the most recent is at the top
	const reversed = messages.slice().reverse();
	return reversed;
};

// CINEMATIC

type ThrottledFunctionsType = {
	[key: string]: Function;
};

const throttledFunctions: ThrottledFunctionsType = {};

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
