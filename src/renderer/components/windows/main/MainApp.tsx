import React, { useEffect, useState } from 'react';

// Component for the main window of the Electron Hotplate demo
export default function MainApp() {
	const [message, setMessage] = useState<string>('');

	useEffect(() => {
		// Listen for messages from child windows
		window.electron.ipcRenderer.on('child-window-message', (_, data) => {
			setMessage(String(data));
		});

		// Cleanup listener on component unmount
		return () => {
			window.electron.ipcRenderer.removeAllListeners('child-window-message');
		};
	}, []);

	// Handler to open a new child window
	const openChildWindow = () => {
		window.electron.ipcRenderer.send('open-child-window');
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
}
