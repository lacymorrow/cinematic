import { globalShortcut } from 'electron';

type ShortcutType = {
	init: () => void;
	// eslint-disable-next-line no-undef
} & Electron.GlobalShortcut;

const shortcuts: ShortcutType = {
	init: () => {
		// globalShortcut.register('CommandOrControl+Shift+I', () => {
		// 	console.log('CommandOrControl+Shift+I is pressed');
		// });
	},

	// Inherit all methods from Electron's globalShortcut
	...globalShortcut,
};

export default shortcuts;
