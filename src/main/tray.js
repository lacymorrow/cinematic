import { app, Tray as ElectronTray, Menu } from 'electron';
import Logger from 'electron-log';
import path from 'path';
import { aboutMenuItem } from './menu';
import { __static } from './paths';
import { is } from './util';

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

		const contextMenu = Menu.buildFromTemplate([
			aboutMenuItem,
			{ role: 'quit' },
		]);
		this.tray.setToolTip(`${app.name}`);
		this.tray.setContextMenu(contextMenu);
	}

	getTray() {
		return this.tray;
	}

	setImage(icon) {
		this.tray.setImage(icon);
	}

	setToolTip(tooltip) {
		this.tray.setToolTip(tooltip);
	}

	setContextMenu(contextMenu) {
		this.tray.setContextMenu(contextMenu);
	}

	destroy() {
		this.tray.destroy();
	}

	// mac needs dark/light versions
	static systemIcon() {
		if (is.macos) {
			// icon needs to be in format 'xxxTemplate' to work with system theme on mac
			return 'tray-Template.png';
		}

		if (is.windows) {
			return 'icon.ico';
		}

		return 'icon.png';
	}

	setIcon() {
		const icon = this.getIconPath();
		this.setImage(icon);
		Logger.info(`Setting tray icon: ${icon}`);
	}
}

// // mac needs dark/light versions
// const systemIcon = () => {
// 	if (is.macos) {
// 		// icon needs to be in format 'xxxTemplate' to work with system theme on mac
// 		return 'tray-Template.png';
// 	}

// 	if (is.windows) {
// 		return 'icon.ico';
// 	}

// 	return 'icon.png';
// };

// const getIconPath = () => path.join(__static, 'icons', systemIcon());

// const init = () => {
// 	if (tray.instance) {
// 		return tray.instance;
// 	}

// 	tray.instance = new ElectronTray(getIconPath());

// 	const contextMenu = Menu.buildFromTemplate([
// 		aboutMenuItem(),
// 		showAppMenuItem,
// 		...preferencesMenuItems,
// 		openCustomImageMenuItem,
// 		resetMenuItem,
// 		{ role: 'quit' },
// 	]);
// 	tray.instance.setToolTip(`${productName} Control`);
// 	tray.instance.setContextMenu(contextMenu);

// 	return tray.instance;
// };

// const setIcon = () => {
// 	const icon = getIconPath();
// 	tray.setImage(icon);
// 	Logger.info(`Setting tray icon: ${icon}`);
// };

// const tray = {
// 	init,
// 	instance: null,
// 	setIcon,
// };
