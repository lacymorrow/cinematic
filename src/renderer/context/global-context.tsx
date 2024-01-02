// DATA SHOULD ONLY FLOW DOWNWARDS
// Do not use this context to update data, only to read it
// Use IPC to update data

import { LIBRARY_UPDATED, SETTINGS_UPDATED } from '@/config/ipc-channels';
import { CollectionStoreType, LibraryStoreType } from '@/main/store';
import { CollectionType, LibraryType } from '@/types/media';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';

import { DEFAULT_SETTINGS, SettingsType } from '@/config/settings';
import Logger from 'electron-log';

interface GlobalContextType {
	genres: CollectionStoreType;
	genresArray: CollectionType;
	library: LibraryStoreType;
	libraryArray: LibraryType;
	liked: LibraryType;
	playlists: CollectionStoreType;
	playlistsArray: CollectionType;
	randomLibraryArray: LibraryType;
	settings: SettingsType;
	setSettings: (newSettings: Partial<SettingsType>) => void;
}

export const GlobalContext = React.createContext<GlobalContextType>({
	genres: {},
	genresArray: [],
	library: {},
	libraryArray: [],
	liked: [],
	playlists: {},
	playlistsArray: [],
	randomLibraryArray: [],
	settings: DEFAULT_SETTINGS,
	setSettings: () => {},
});

export function GlobalContextProvider({
	children,
}: {
	children?: React.ReactNode;
}) {
	const [genres, setGenres] = React.useState<CollectionStoreType>({});
	const [library, setLibrary] = React.useState<LibraryStoreType>({});
	const [playlists, setPlaylists] = React.useState<CollectionStoreType>({});
	const [settings, setCurrentSettings] =
		React.useState<SettingsType>(DEFAULT_SETTINGS);

	useEffect(() => {
		// Create handler for receiving asynchronous messages from the main process
		const syncronize = async () => {
			Logger.log('Synchronize Library');

			setLibrary(await window.electron.getLibrary());
			setGenres(await window.electron.getGenres());
			setPlaylists(await window.electron.getPlaylists());
		};

		const syncronizeSettings = async () => {
			Logger.log('Synchronize Library');
			setCurrentSettings(await window.electron.getSettings());
		};

		// Listen for messages from the main process
		window.electron.ipcRenderer.on(LIBRARY_UPDATED, async (_event) => {
			await syncronize();
		});

		window.electron.ipcRenderer.on(SETTINGS_UPDATED, async (_event) => {
			await syncronizeSettings();
		});

		// Request initial data when the app loads
		syncronize();
		syncronizeSettings();

		return () => {
			// Clean up listeners when the component unmounts
			window.electron.ipcRenderer.removeAllListeners(LIBRARY_UPDATED);
			window.electron.ipcRenderer.removeAllListeners(SETTINGS_UPDATED);
		};
	}, []);

	// Electron API functions
	const setSettings = useCallback((newSettings: Partial<SettingsType>) => {
		window.electron.setSettings(newSettings);
	}, []);

	const libraryArray = useMemo(() => Object.values(library), [library]);
	const playlistsArray = useMemo(() => Object.values(playlists), [playlists]);
	const genresArray = useMemo(() => Object.values(genres), [genres]);
	const liked = useMemo(
		() => libraryArray.filter((media) => media.liked),
		[libraryArray],
	);

	const randomLibraryArray = useMemo(() => {
		const shuffled = [...libraryArray];
		return shuffled.sort(() => 0.5 - Math.random());
	}, [libraryArray]);

	const value = useMemo(() => {
		return {
			genres,
			genresArray,
			library,
			libraryArray,
			liked,
			playlists,
			playlistsArray,
			randomLibraryArray,
			settings,
			setSettings,
		};
	}, [
		genres,
		genresArray,
		library,
		libraryArray,
		liked,
		playlists,
		playlistsArray,
		randomLibraryArray,
		settings,
		setSettings,
	]);

	return (
		<GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
	);
}

export const useGlobalContext = () => {
	const context = useContext(GlobalContext);

	if (context === undefined)
		throw new Error('useGlobalContext must be used within a GlobalContext');

	return context;
};
