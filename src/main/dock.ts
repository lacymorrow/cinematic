// MacOS only
import { Menu } from 'electron/main';
import { aboutMenuItem, quitMenuItem } from './menu';

const { app } = require('electron');
const { is } = require('./util');

const setupDockMenu = () => {
	if (!is.macos) return;
	const dockMenu = Menu.buildFromTemplate([aboutMenuItem, quitMenuItem]);
	app.dock.setMenu(dockMenu);
};

// Sets the badge on the dock icon
const setBadge = (text: string) => app.dock.setBadge(String(text));

// Hides the app from the dock and CMD+Tab, necessary for staying on top macOS fullscreen windows
const setVisible = (visible: boolean) => {
	if (is.macos) {
		if (visible) {
			app.dock.show();
		} else {
			app.dock.hide();
		}
	}
};

export default {
	setBadge,
	setupDockMenu,
	setVisible,
};
