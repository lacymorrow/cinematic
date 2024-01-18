import { globalShortcut } from 'electron';

// eslint-disable-next-line no-undef
interface ShortcutType extends Electron.GlobalShortcut {
	init: () => void;
}

const kb: ShortcutType = {
	init: () => {
		// globalShortcut.register('CommandOrControl+Shift+I', () => {
		// ...
		// });
	},

	// Inherit all methods from Electron's globalShortcut
	...globalShortcut,
};

export default kb;
