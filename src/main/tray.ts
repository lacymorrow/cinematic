import { app, Tray as ElectronTray, Menu } from 'electron';
import Logger from 'electron-log';
import path from 'node:path';
import { aboutMenuItem, quitMenuItem } from './menu-items';
import { __static } from './paths';
import { is } from './util';

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

export default class SystemTray {
	constructor() {
		this.tray = new ElectronTray(getIconPath());

		const contextMenu = Menu.buildFromTemplate([aboutMenuItem, quitMenuItem]);
		this.tray.setToolTip(`${app.name}`);
		this.tray.setContextMenu(contextMenu);
	}

	getTray() {
		return this.tray;
	}

	private tray: ElectronTray; // Add the 'tray' property

	setIcon() {
		const icon = getIconPath();
		this.tray.setImage(icon);
		Logger.info(`Setting tray icon: ${icon}`);
	}
}
