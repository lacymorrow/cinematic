import { CustomAcceleratorsType } from '@/types/keyboard';
import { globalShortcut } from 'electron';
import Logger from 'electron-log';
import { keyboardShortcuts } from './keyboard-shortcuts';
import store from './store';
import windows, { forEachWindow } from './windows';

// eslint-disable-next-line no-undef
interface ShortcutType extends Electron.GlobalShortcut {
	setKeybind: (
		keybinds: keyof CustomAcceleratorsType,
		accelerator: string,
	) => void;
	setKeybinds: (keybinds: Partial<CustomAcceleratorsType>) => void;
	registerKeyboardShortcuts: () => void;
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
	registerKeyboardShortcuts,

	setKeybind: (keybind: keyof CustomAcceleratorsType, accelerator: string) => {
		const keybinds = store.get('keybinds');

		// Invalid keybind
		if (!(keybind in keybinds)) {
			return;
		}

		const shortcut = keyboardShortcuts.find((s) => s.action === keybind);

		// No accelerator, remove keybind if allowed
		if (!accelerator && !shortcut?.allowUnbind) {
			return;
		}

		keybinds[keybind] = accelerator;
		store.set('keybinds', keybinds);
		registerKeyboardShortcuts();
		// Sync with renderer
		windows.mainWindow?.webContents.send('app-updated'); // TODO: ipcChannels.APP_UPDATED, we hard-coded this to prevent circular imports
	},

	setKeybinds: (keybinds: Partial<CustomAcceleratorsType>) => {
		const currentKeybinds = store.get('keybinds');
		store.set('keybinds', {
			...currentKeybinds,
			...keybinds,
		});
		registerKeyboardShortcuts();

		// Sync with renderer
		windows.mainWindow?.webContents.send('app-updated'); // TODO: ipcChannels.APP_UPDATED, we hard-coded this to prevent circular imports
	},

	// Inherit all methods from Electron's globalShortcut
	...globalShortcut,
};

export default kb;
