// DATA SHOULD ONLY FLOW DOWNWARDS
// We pass data from the main process to the renderer process using IPC
// We also use IPC to update data

// todo: add os here

import { ipcChannels } from '@/config/ipc-channels';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';

import {
	DEFAULT_KEYBINDS,
	DEFAULT_SETTINGS,
	SettingsType,
} from '@/config/settings';
import { $messages } from '@/config/strings';
import { MenuItemConstructorOptions } from 'electron/renderer';
import { toast } from 'sonner';
import { CustomAcceleratorsType } from '@/types/keyboard';
import { AppInfoType } from '@/types/app';
import { play, preload } from '../lib/sounds';

interface GlobalContextType {
	app: Partial<AppInfoType>;
	appMenu: MenuItemConstructorOptions[];
	keybinds: CustomAcceleratorsType;
	message: string;
	messages: string[];
	settings: SettingsType;
	setSettings: (newSettings: Partial<SettingsType>) => void;
}

export const GlobalContext = React.createContext<GlobalContextType>({
	app: {},
	appMenu: [],
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

	const [keybinds, setCurrentKeybinds] =
		React.useState<CustomAcceleratorsType>(DEFAULT_KEYBINDS);

	useEffect(() => {
		// Create handler for receiving asynchronous messages from the main process
		const synchronizeAppState = async () => {
			console.log($messages.synchronize);

			// Get app menu
			window.electron.ipcRenderer
				.invoke(ipcChannels.GET_APP_MENU)
				.then(setAppMenu)
				.catch(console.error);

			// Get settings
			window.electron.ipcRenderer
				.invoke(ipcChannels.GET_SETTINGS)
				.then(setCurrentSettings)
				.catch(console.error);

			// Get keybinds
			window.electron.ipcRenderer
				.invoke(ipcChannels.GET_KEYBINDS)
				.then(setCurrentKeybinds)
				.catch(console.error);

			// Get Status messages
			window.electron.ipcRenderer
				.invoke(ipcChannels.GET_MESSAGES)
				.then(setMessages)
				.catch(console.error);
		};

		// Listen for messages from the main process
		window.electron.ipcRenderer.on(ipcChannels.APP_UPDATED, async (_event) => {
			await synchronizeAppState();
		});

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
				console.dir(info);
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
		synchronizeAppState();

		// Let the main process know that the renderer is ready
		window.electron.ipcRenderer.send(ipcChannels.RENDERER_READY);

		return () => {
			// Clean up listeners when the component unmounts
			window.electron.ipcRenderer.removeAllListeners(ipcChannels.APP_UPDATED);
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

	const value = useMemo(() => {
		return {
			app: appInfo,
			appMenu,
			keybinds,
			settings,
			setSettings,
			messages,
			message: messages[messages.length - 1] ?? '',
		};
	}, [appInfo, appMenu, keybinds, settings, setSettings, messages]);

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
