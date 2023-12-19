import { SettingsType } from '@/main/store';

const settings: SettingsType = {
	paths: [],

	autoUpdate: true,
	quitOnWindowClose: false,

	showSidebar: true,
	showDockIcon: true,
	showTrayIcon: true,

	theme: 'light',
	thumbnailSize: 'large',

	viewMode: 'grid',
};
export default settings;
