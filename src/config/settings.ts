export type ViewModeType = 'grid' | 'list';

export type ThemeType = 'system' | 'light' | 'dark';

export type ThumbnailSizeType = 'small' | 'medium' | 'large';

export interface SettingsType {
	autoUpdate: boolean;

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
	showDockIcon: boolean;
	showSidebar: boolean;
	showTrayIcon: boolean;
	visibleSidebarElements: string[];
	// alwaysOnTop: boolean;
	// showAlwaysOnTopPrompt: boolean;
	// autoHideMenuBar: boolean;
	// notificationsMuted: boolean;
	// hardwareAcceleration: boolean;
	quitOnWindowClose: boolean;
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
	quitOnWindowClose: false,

	sidebarCollapsed: false,
	sidebarLayout: [20, 80],

	showSidebar: true,
	showDockIcon: true,
	showTrayIcon: true,

	visibleSidebarElements: ['watch', 'liked', 'genres', 'playlists', 'history'],

	theme: 'light',
	thumbnailSize: 'large',

	viewMode: 'grid',
};
