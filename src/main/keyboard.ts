import { CustomAcceleratorsType } from '@/types/keyboard';
import { globalShortcut } from 'electron';
import Logger from 'electron-log';
import { keyboardShortcuts } from './keyboard-shortcuts';
import store from './store';

// eslint-disable-next-line no-undef
interface ShortcutType extends Electron.GlobalShortcut {
	initialize: () => void;
	setKeybinds: (keybinds: Partial<CustomAcceleratorsType>) => void;
}

const registerKeyboardShortcuts = () => {
	globalShortcut.unregisterAll();

	// Register all shortcuts
	const keybinds = store.get('keybinds');
	keyboardShortcuts.forEach((shortcut) => {
		const { action, fn } = shortcut;
		const keybind = keybinds[action];

		// Custom shortcuts
		if (!action || !fn || !keybind) {
			// Disable shortcut
			Logger.info(`No keybind for ${action}`);
			return;
		}

		// If a keybinds shortcut exists for this action
		Logger.info(`Keybind for ${action} is ${keybind}`);
		globalShortcut.register(keybind, () => {
			// Do the thing
			fn();
		});
	});
};

const kb: ShortcutType = {
	initialize: () => {
		registerKeyboardShortcuts();
	},

	setKeybinds: (keybinds: Partial<CustomAcceleratorsType>) => {
		const currentKeybinds = store.get('keybinds');
		store.set('keybinds', {
			...currentKeybinds,
			...keybinds,
		});
		registerKeyboardShortcuts();
	},

	// Inherit all methods from Electron's globalShortcut
	...globalShortcut,
};

export default kb;
