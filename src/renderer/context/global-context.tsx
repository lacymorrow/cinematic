// DATA SHOULD ONLY FLOW DOWNWARDS
// Do not use this context to update data, only to read it
// Use IPC to update data

import { SETTINGS_UPDATED } from '@/config/ipc-channels';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';

import { DEFAULT_SETTINGS, SettingsType } from '@/config/settings';
import { $messages } from '@/config/strings';
import Logger from 'electron-log';

interface GlobalContextType {
	settings: SettingsType;
	setSettings: (newSettings: Partial<SettingsType>) => void;
}

export const GlobalContext = React.createContext<GlobalContextType>({
	settings: DEFAULT_SETTINGS,
	setSettings: () => {},
});

export function GlobalContextProvider({
	children,
}: {
	children?: React.ReactNode;
}) {
	const [settings, setCurrentSettings] =
		React.useState<SettingsType>(DEFAULT_SETTINGS);

	useEffect(() => {
		// Create handler for receiving asynchronous messages from the main process
		const synchronizeSettings = async () => {
			Logger.log($messages.synchronize_settings);
			setCurrentSettings(await window.electron.getSettings());
		};

		// Listen for messages from the main process
		window.electron.ipcRenderer.on(SETTINGS_UPDATED, async (_event) => {
			await synchronizeSettings();
		});

		// Request initial data when the app loads
		synchronizeSettings();

		return () => {
			// Clean up listeners when the component unmounts
			window.electron.ipcRenderer.removeAllListeners(SETTINGS_UPDATED);
		};
	}, []);

	// Electron API functions
	const setSettings = useCallback((newSettings: Partial<SettingsType>) => {
		window.electron.setSettings(newSettings);
	}, []);

	const value = useMemo(() => {
		return {
			settings,
			setSettings,
		};
	}, [settings, setSettings]);

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
