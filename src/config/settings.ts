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
	showTrayIcon: boolean;
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

	allowNotifications: true,
	allowSounds: true,
	autoUpdate: true,
	showDockIcon: true,
	startMinimized: false,
	quitOnWindowClose: false,

	sidebarCollapsed: false,
	sidebarLayout: [20, 80],

	showSidebar: true,
	showTrayIcon: true,

	visibleSidebarElements: ['watch', 'liked', 'genres', 'playlists', 'history'],

	theme: 'light',
	thumbnailSize: 'large',

	viewMode: 'grid',
};
