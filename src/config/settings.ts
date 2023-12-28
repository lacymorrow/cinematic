import { SettingsType } from '@/main/store';

const settings: SettingsType = {
	paths: [],

	autoUpdate: true,
	quitOnWindowClose: false,

	showSidebar: true,
	showDockIcon: true,
	showTrayIcon: true,

	visibleSidebarElements: ['watch', 'liked', 'genres', 'playlists', 'history'],

	theme: 'light',
	thumbnailSize: 'large',

	viewMode: 'grid',
};
export default settings;
