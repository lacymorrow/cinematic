import { app, Tray as ElectronTray, Menu } from 'electron';
import path from 'path';
import { aboutMenuItem, quitMenuItem } from './menu-items';
import { __static } from './paths';
import { getSetting } from './store';
import { is } from './util';
import windows from './windows';

// mac needs dark/light versions
const systemIcon = () => {
	if (is.macos) {
		// icon needs to be in format 'xxxTemplate' to work with system theme on mac
		return 'tray-Template.png';
	}

	if (is.windows) {
		return 'icon.ico';
	}

	return 'icon.png';
};

const getIconPath = () => {
	return path.join(__static, 'icons', systemIcon());
};

const initialize = () => {
	if (getSetting('showTrayIcon')) {
		windows.tray = new ElectronTray(getIconPath());

		const contextMenu = Menu.buildFromTemplate([aboutMenuItem, quitMenuItem]);
		windows.tray.setToolTip(`${app.name}`);
		windows.tray.setContextMenu(contextMenu);
	} else {
		windows.tray?.destroy();
		windows.tray = null;
	}
};

export default {
	initialize,
};
