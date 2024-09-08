import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';

// Component for the main window of the Electron Hotplate demo
const MainApp: React.FC = () => {
	const [message, setMessage] = useState<string>('');

	useEffect(() => {
		// Listen for messages from child windows
		ipcRenderer.on('child-window-message', (_, data) => {
			setMessage(data);
		});

		// Cleanup listener on component unmount
		return () => {
			ipcRenderer.removeAllListeners('child-window-message');
		};
	}, []);

	// Handler to open a new child window
	const openChildWindow = () => {
		ipcRenderer.send('open-child-window');
	};

	return (
		<div className="min-h-screen p-8 bg-gray-100 text-black">
			<h1 className="text-4xl font-bold mb-6">Electron Hotplate Demo</h1>
			<div className="space-y-4">
				<button
					onClick={openChildWindow}
					className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
					type="button"
				>
					Open Child Window
				</button>
				<p>Latest Message: {message}</p>
			</div>
		</div>
	);
};

export default MainApp;
