import { globalShortcut } from 'electron';

type ShortcutType = {
	init: () => void;

	// Inherited from globalShortcut
	// isRegistered: (shortcut: string) => boolean;
	// register: (shortcut: string, callback: () => void) => void;
	// registerAll: (accelerators: string[], callback: () => void) => void;
	// unregister: (shortcut: string) => void;
	// unregisterAll: () => void;
};

const shortcuts: ShortcutType = {
	init: () => {
		// globalShortcut.register('CommandOrControl+Shift+I', () => {
		// 	console.log('CommandOrControl+Shift+I is pressed');
		// });
	},
	...globalShortcut,
};

export default shortcuts;
