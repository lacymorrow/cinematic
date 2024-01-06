export type ViewModeType = 'grid' | 'list';

export type ThemeType = 'system' | 'light' | 'dark';

export type ThumbnailSizeType = 'small' | 'medium' | 'large';

export interface SettingsType {
	allowNotifications: boolean;
	allowSounds: boolean;
	autoUpdate: boolean;
	showDockIcon: boolean;
	startMinimized: boolean;
	quitOnWindowClose: boolean;

	theme: ThemeType;

	// vibrancy: 'none' | 'sidebar' | 'full';
	// autoplayVideos: boolean;
	// zoomFactor: number;
	// menuBarMode: boolean;
	// showTrayIcon: boolean;
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
	allowNotifications: true,
	allowSounds: true,
	autoUpdate: true,
	showDockIcon: true,
	startMinimized: false,
	quitOnWindowClose: false,

	theme: 'light',
};
