// DATA SHOULD ONLY FLOW DOWNWARDS
// Do not use this context to update data, only to read it
// Use IPC to update data

import { APP_STATUS_MESSAGE } from '@/config/ipc-channels';
import React, { useEffect, useMemo } from 'react';

interface AppContextType {
	message: string;
	messages: string[];
}

export const AppContext = React.createContext<AppContextType>({
	message: '',
	messages: [],
});

export function AppContextProvider({
	children,
}: {
	children?: React.ReactNode;
}) {
	const [messages, setMessages] = React.useState<string[]>([]);

	useEffect(() => {
		// save messages to a log, and surface the last one
		const synchronizeMessages = async () => {
			setMessages(await window.electron.getMessages());
		};

		window.electron.ipcRenderer.on(APP_STATUS_MESSAGE, async (_event) => {
			synchronizeMessages();
		});

		synchronizeMessages();

		return () => {
			window.electron.ipcRenderer.removeAllListeners(APP_STATUS_MESSAGE);
		};
	}, []);

	const value = useMemo(() => {
		return {
			messages,
			message: messages[messages.length - 1] ?? '',
		};
	}, [messages]);

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
