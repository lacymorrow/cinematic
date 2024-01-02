import { globalShortcut } from 'electron';

// eslint-disable-next-line no-undef
interface ShortcutType extends Electron.GlobalShortcut {
	init: () => void;
}

const shortcuts: ShortcutType = {
	init: () => {
		globalShortcut.register('CommandOrControl+Shift+I', () => {
			console.log('CommandOrControl+Shift+I is pressed');
		});
	},

	// Inherit all methods from Electron's globalShortcut
	...globalShortcut,
};

export default shortcuts;
