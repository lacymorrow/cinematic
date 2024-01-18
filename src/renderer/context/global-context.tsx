// DATA SHOULD ONLY FLOW DOWNWARDS
// We pass data from the main process to the renderer process using IPC
// We also use IPC to update data

import { ipcChannels } from '@/config/ipc-channels';
import { CollectionStoreType, LibraryStoreType } from '@/main/store';
import { CollectionType, LibraryType } from '@/types/media';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';

import { DEFAULT_SETTINGS, SettingsType } from '@/config/settings';
import { $messages } from '@/config/strings';
import { play, preload } from '@/renderer/lib/sounds';
import Logger from 'electron-log';
import { MenuItemConstructorOptions } from 'electron/renderer';
import { toast } from 'sonner';

interface GlobalContextType {
	appName: string;
	appMenu: MenuItemConstructorOptions[];
	appPaths: any;
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
	appPaths: {},
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
	const [appPaths, setAppPaths] = React.useState<any>({});

	const [settings, setCurrentSettings] =
		React.useState<SettingsType>(DEFAULT_SETTINGS);

	const [genres, setGenres] = React.useState<CollectionStoreType>({});
	const [library, setLibrary] = React.useState<LibraryStoreType>({});
	const [playlists, setPlaylists] = React.useState<CollectionStoreType>({});

	useEffect(() => {
		// Create handler for receiving asynchronous messages from the main process
		const synchronize = async () => {
			Logger.log($messages.synchronize_library);

			setLibrary(await window.electron.getLibrary());
			setGenres(await window.electron.getGenres());
			setPlaylists(await window.electron.getPlaylists());
		};

		const synchronizeSettings = async () => {
			Logger.log($messages.synchronize_settings);
			// Get settings
			window.electron.ipcRenderer
				.invoke(ipcChannels.GET_SETTINGS)
				.then(setCurrentSettings)
				.catch(Logger.error);

			// Get app menu
			window.electron.ipcRenderer
				.invoke(ipcChannels.GET_APP_MENU)
				.then(setAppMenu)
				.catch(Logger.error);
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

		// Create notifications using the renderer
		window.electron.ipcRenderer.on(
			ipcChannels.APP_NOTIFICATION,
			({ title, body, action }: any) => {
				toast(title, {
					...(body ? { description: body } : {}),
					...(action ? { action } : {}),
					// action: {
					// 	label: 'Ok',
					// 	onClick: () => {},
					// },
				});

				// Renderer Web Notifications
				// new Notification(title, {
				// 	body,
				// });
			},
		);

		// SOUNDS
		window.electron.ipcRenderer
			.invoke(ipcChannels.GET_APP_PATHS)
			.then((paths) => {
				setAppPaths(paths);
				return paths;
			})
			.then((paths) => {
				// Preload sounds
				preload(paths.sounds);

				// Setup listener to play sounds
				window.electron.ipcRenderer.on(ipcChannels.PLAY_SOUND, (sound: any) => {
					play({ name: sound, path: paths.sounds });
				});
			})
			.catch(Logger.error);

		// Get app name
		window.electron.ipcRenderer
			.invoke(ipcChannels.GET_APP_NAME)
			.then(setAppName)
			.catch(Logger.error);

		// Request initial data when the app loads
		synchronize();
		synchronizeSettings();

		// Let the main process know that the renderer is ready
		window.electron.ipcRenderer.send(ipcChannels.RENDERER_READY);

		return () => {
			// Clean up listeners when the component unmounts
			window.electron.ipcRenderer.removeAllListeners(
				ipcChannels.LIBRARY_UPDATED,
			);
			window.electron.ipcRenderer.removeAllListeners(
				ipcChannels.SETTINGS_UPDATED,
			);
			window.electron.ipcRenderer.removeAllListeners(ipcChannels.PLAY_SOUND);
			window.electron.ipcRenderer.removeAllListeners(
				ipcChannels.APP_NOTIFICATION,
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
			appPaths,
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
		appPaths,
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
