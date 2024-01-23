// DATA SHOULD ONLY FLOW DOWNWARDS
// Do not use this context to update data, only to read it
// Use IPC to update data

import { ipcChannels } from '@/config/ipc-channels';
import React, { useEffect, useMemo } from 'react';

interface StatusMessageContextType {
	message: string;
	messages: string[];
}

export const StatusMessageContext =
	React.createContext<StatusMessageContextType>({
		message: '',
		messages: [],
	});

export function StatusMessageContextProvider({
	children,
}: {
	children?: React.ReactNode;
}) {
	const [messages, setMessages] = React.useState<string[]>([]);

	useEffect(() => {
		// save messages to a log, and surface the last one
		const synchronizeMessages = async () => {
			// setMessages(await window.electron.getMessages());
			window.electron.ipcRenderer
				.invoke(ipcChannels.GET_MESSAGES)
				.then(setMessages)
				.catch(console.error);
		};

		window.electron.ipcRenderer.on(
			ipcChannels.APP_STATUS_MESSAGE,
			async (_event) => {
				synchronizeMessages();
			},
		);

		synchronizeMessages();

		return () => {
			window.electron.ipcRenderer.removeAllListeners(
				ipcChannels.APP_STATUS_MESSAGE,
			);
		};
	}, []);

	const value = useMemo(() => {
		return {
			messages,
			message: messages[messages.length - 1] ?? '',
		};
	}, [messages]);

	return (
		<StatusMessageContext.Provider value={value}>
			{children}
		</StatusMessageContext.Provider>
	);
}
