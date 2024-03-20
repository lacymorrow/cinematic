import { CustomAcceleratorsType } from '@/types/keyboard';

export type ThemeType = 'system' | 'light' | 'dark';
export type ThumbnailSizeType = 'small' | 'medium' | 'large';
export type ViewModeType = 'grid' | 'list';

export type NotificationType = 'system' | 'app' | 'all';

export interface SettingsType {
	allowAnalytics: boolean;
	allowSounds: boolean;
	allowAutoUpdate: boolean;
	allowNotifications: boolean;
	notifcationType: NotificationType;
	showDockIcon: boolean; // macOS only
	showTrayIcon: boolean;
	startMinimized: boolean;
	quitOnWindowClose: boolean;

	paths: string[];
	thumbnailSize: ThumbnailSizeType;
	theme: ThemeType;

	viewMode: ViewModeType;
	// vibrancy: 'none' | 'sidebar' | 'full';
	// autoplayVideos: boolean;
	// zoomFactor: number;
	// menuBarMode: boolean;
	sidebarCollapsed: boolean;
	sidebarLayout: number[];

	showSidebar: boolean;
	visibleSidebarElements: string[];
	// alwaysOnTop: boolean;
	// showAlwaysOnTopPrompt: boolean;
	// autoHideMenuBar: boolean;
	// notificationsMuted: boolean;
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
	paths: [],

	allowAnalytics: true,
	allowAutoUpdate: true,
	allowSounds: true,
	allowNotifications: true,
	notifcationType: 'all',
	showDockIcon: true,
	showTrayIcon: true,
	startMinimized: false,
	quitOnWindowClose: false,

	sidebarCollapsed: false,
	sidebarLayout: [20, 80],

	showSidebar: true,

	visibleSidebarElements: ['watch', 'liked', 'genres', 'playlists', 'history'],

	thumbnailSize: 'large',

	viewMode: 'grid',
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
