import { CustomAcceleratorsType } from '@/types/keyboard';

export type ThemeType = 'system' | 'light' | 'dark';

export interface SettingsType {
	allowSounds: boolean;
	autoUpdate: boolean;
	allowNotifications: boolean;
	notifcationType: 'default' | 'system' | 'all';
	showDockIcon: boolean; // macOS only
	showTrayIcon: boolean;
	startMinimized: boolean;
	quitOnWindowClose: boolean;

	theme: ThemeType;

	// vibrancy: 'none' | 'sidebar' | 'full';
	// hardwareAcceleration: boolean;
	// lastWindowState: {
	// 	x: number;
	// 	y: number;
	// 	width: number;
	// 	height: number;
	// 	isMaximized: boolean;
	// };
}

// These are the default settings, imported by the store
export const DEFAULT_SETTINGS: SettingsType = {
	autoUpdate: true,
	allowSounds: true,
	allowNotifications: true,
	notifcationType: 'all',
	showDockIcon: true,
	showTrayIcon: true,
	startMinimized: false,
	quitOnWindowClose: false,

	theme: 'system',
};

// see src/main/keyboard-shortcuts.ts
// a shortcut must have an action, keybind, and fn
const accelerator = 'Control+Shift+Alt';

export const DEFAULT_KEYBINDS: CustomAcceleratorsType = {
	quit: `${accelerator}+Q`,
	reset: `${accelerator}+R`,
	// reset: '', // empty string or undefined disables a shortcut
};
