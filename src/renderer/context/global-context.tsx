// DATA SHOULD ONLY FLOW DOWNWARDS
// We pass data from the main process to the renderer process using IPC
// We also use IPC to update data

// todo: add os here

import { ipcChannels } from '@/config/ipc-channels';
import { CollectionStoreType, LibraryStoreType } from '@/main/store';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';

import {
	DEFAULT_KEYBINDS,
	DEFAULT_SETTINGS,
	SettingsType,
} from '@/config/settings';
import { $messages } from '@/config/strings';
import { play, preload } from '@/renderer/lib/sounds';
import { AppInfoType } from '@/types/app';
import { CustomAcceleratorsType } from '@/types/keyboard';
import { CollectionType, LibraryType } from '@/types/media';
import Logger from 'electron-log';
import { MenuItemConstructorOptions } from 'electron/renderer';
import { toast } from 'sonner';

interface GlobalContextType {
	app: Partial<AppInfoType>;
	appMenu: MenuItemConstructorOptions[];
	genres: CollectionStoreType;
	genresArray: CollectionType;
	library: LibraryStoreType;
	libraryArray: LibraryType;
	liked: LibraryType;
	playlists: CollectionStoreType;
	playlistsArray: CollectionType;
	randomLibraryArray: LibraryType;
	keybinds: CustomAcceleratorsType;
	message: string;
	messages: string[];
	settings: SettingsType;
	setSettings: (newSettings: Partial<SettingsType>) => void;
}

export const GlobalContext = React.createContext<GlobalContextType>({
	app: {},
	appMenu: [],
	genres: {},
	genresArray: [],
	library: {},
	libraryArray: [],
	liked: [],
	playlists: {},
	playlistsArray: [],
	randomLibraryArray: [],
	keybinds: DEFAULT_KEYBINDS,
	message: '',
	messages: [],
	settings: DEFAULT_SETTINGS,
	setSettings: () => {},
});

export function GlobalContextProvider({
	children,
}: {
	children?: React.ReactNode;
}) {
	const [appInfo, setAppInfo] = React.useState<Partial<AppInfoType>>({});
	const [appMenu, setAppMenu] = React.useState<MenuItemConstructorOptions[]>(
		[],
	);
	const [messages, setMessages] = React.useState<string[]>([]);

	const [settings, setCurrentSettings] =
		React.useState<SettingsType>(DEFAULT_SETTINGS);

	const [genres, setGenres] = React.useState<CollectionStoreType>({});
	const [library, setLibrary] = React.useState<LibraryStoreType>({});
	const [playlists, setPlaylists] = React.useState<CollectionStoreType>({});
	const [keybinds, setCurrentKeybinds] =
		React.useState<CustomAcceleratorsType>(DEFAULT_KEYBINDS);

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

			window.electron.ipcRenderer
				.invoke(ipcChannels.GET_RENDERER_SYNC)
				.then((res) => {
					const { settings: s, keybinds: k, messages: m, appMenu: menu } = res;
					setCurrentSettings(s);
					setCurrentKeybinds(k);
					setMessages(m);
					setAppMenu(menu);
				})
				.catch(console.error);
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

		// Get app info: name, version, paths, os - DOES NOT CHANGE
		window.electron.ipcRenderer
			.invoke(ipcChannels.GET_APP_INFO)
			.then((info) => {
				setAppInfo(info);
				return info;
			})
			.then(({ paths }) => {
				// SOUNDS
				preload(paths.sounds);

				// Setup listener to play sounds
				window.electron.ipcRenderer.on(ipcChannels.PLAY_SOUND, (sound: any) => {
					play({ name: sound, path: paths.sounds });
				});
			})
			.catch(console.error);

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
			app: appInfo,
			appMenu,
			genres,
			genresArray,
			library,
			libraryArray,
			liked,
			playlists,
			playlistsArray,
			randomLibraryArray,
			keybinds,
			settings,
			setSettings,
			messages,
			message: messages[messages.length - 1] ?? '',
		};
	}, [
		appInfo,
		appMenu,
		genres,
		genresArray,
		library,
		libraryArray,
		liked,
		playlists,
		playlistsArray,
		randomLibraryArray,
		keybinds,
		settings,
		setSettings,
		messages,
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
