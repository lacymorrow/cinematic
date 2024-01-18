export type ViewModeType = 'grid' | 'list';

export type ThemeType = 'system' | 'light' | 'dark';

export type ThumbnailSizeType = 'small' | 'medium' | 'large';

export interface SettingsType {
	allowSounds: boolean;
	autoUpdate: boolean;
	allowNotifications: boolean;
	notifcationType: 'default' | 'system' | 'all';
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

	autoUpdate: true,
	allowSounds: true,
	allowNotifications: true,
	notifcationType: 'all',
	showDockIcon: true,
	startMinimized: false,
	quitOnWindowClose: false,

	sidebarCollapsed: false,
	sidebarLayout: [20, 80],

	showSidebar: true,
	showTrayIcon: true,

	visibleSidebarElements: ['watch', 'liked', 'genres', 'playlists', 'history'],

	thumbnailSize: 'large',

	viewMode: 'grid',
	theme: 'system',
};
