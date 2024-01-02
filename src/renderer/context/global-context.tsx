// DATA SHOULD ONLY FLOW DOWNWARDS
// Do not use this context to update data, only to read it
// Use IPC to update data

import { ipcChannels } from '@/config/ipc-channels';
import { CollectionStoreType, LibraryStoreType } from '@/main/store';
import { CollectionType, LibraryType } from '@/types/media';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';

import { DEFAULT_SETTINGS, SettingsType } from '@/config/settings';
import Logger from 'electron-log';
import { MenuItemConstructorOptions } from 'electron/renderer';
import { $messages } from '../../config/strings';

interface GlobalContextType {
	appName: string;
	appMenu: MenuItemConstructorOptions[];
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
	appName: '',
	appMenu: [],
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
	const [appName, setAppName] = React.useState<string>('');
	const [appMenu, setAppMenu] = React.useState<MenuItemConstructorOptions[]>(
		[],
	);
	const [settings, setCurrentSettings] =
		React.useState<SettingsType>(DEFAULT_SETTINGS);

	const [genres, setGenres] = React.useState<CollectionStoreType>({});
	const [library, setLibrary] = React.useState<LibraryStoreType>({});
	const [playlists, setPlaylists] = React.useState<CollectionStoreType>({});

	useEffect(() => {
		// Create handler for receiving asynchronous messages from the main process
		const synchronize = async () => {
			Logger.log('Synchronize Library');

			setLibrary(await window.electron.getLibrary());
			setGenres(await window.electron.getGenres());
			setPlaylists(await window.electron.getPlaylists());
		};

		const synchronizeSettings = async () => {
			Logger.log($messages.synchronize_settings);
			setCurrentSettings(await window.electron.getSettings());
		};

		// Listen for messages from the main process
		window.electron.ipcRenderer.on(
			ipcChannels.LIBRARY_UPDATED,
			async (_event) => {
				await synchronize();
			},
		);

		window.electron.ipcRenderer.on(
			ipcChannels.SETTINGS_UPDATED,
			async (_event) => {
				await synchronizeSettings();
			},
		);

		// Request initial data when the app loads
		synchronize();
		synchronizeSettings();

		// Get app name
		window.electron.getAppName().then(setAppName).catch(Logger.error);

		// Get app menu
		window.electron
			.getAppMenu()
			// .then(console.dir)
			.then(setAppMenu)
			.catch(Logger.error);

		return () => {
			// Clean up listeners when the component unmounts
			window.electron.ipcRenderer.removeAllListeners(
				ipcChannels.LIBRARY_UPDATED,
			);
			window.electron.ipcRenderer.removeAllListeners(
				ipcChannels.SETTINGS_UPDATED,
			);
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
			appName,
			appMenu,
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
		appName,
		appMenu,
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
