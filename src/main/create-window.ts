/* eslint-disable no-param-reassign */
import { BrowserWindow, app, shell } from 'electron';
import path from 'path';
import { $errors } from '../config/strings';
import { AutoUpdate } from './auto-update';
import MenuBuilder from './menu';
import { getSetting } from './store';
import { is, resolveHtmlPath } from './util';

export const createMainWindow = async (mainWindow: BrowserWindow | null) => {
	const RESOURCES_PATH = app.isPackaged
		? path.join(process.resourcesPath, 'assets')
		: path.join(__dirname, '../../assets');

	const getAssetPath = (...paths: string[]): string => {
		return path.join(RESOURCES_PATH, ...paths);
	};

	mainWindow = new BrowserWindow({
		show: false,
		width: 1024,
		minWidth: 550,
		height: 728,
		minHeight: 420,
		icon: getAssetPath('icon.png'), // todo: set icon
		webPreferences: {
			preload: app.isPackaged
				? path.join(__dirname, 'preload.js')
				: path.join(__dirname, '../../.erb/dll/preload.js'),
		},
	});

	mainWindow.loadURL(resolveHtmlPath('index.html'));

	const menuBuilder = new MenuBuilder(mainWindow);
	menuBuilder.buildMenu();

	mainWindow.on('ready-to-show', () => {
		if (!mainWindow) {
			throw new Error($errors.main_window);
		}

		// Setting: Start minimized
		if (process.env.START_MINIMIZED || getSetting('startMinimized')) {
			mainWindow.minimize();
		} else {
			mainWindow.show();
		}

		// Setting: Show dock icon
		if (is.macos && !getSetting('showDockIcon')) {
			app.dock.hide();
		}
	});

	// Clean
	mainWindow.on('closed', () => {
		mainWindow = null;
	});

	// Open urls in the user's browser
	mainWindow.webContents.setWindowOpenHandler((data) => {
		shell.openExternal(data.url);
		return { action: 'deny' };
	});

	// Remove this if your app does not use auto updates
	if (getSetting('autoUpdate')) {
		// eslint-disable-next-line no-new
		new AutoUpdate();
	}

	return mainWindow;
};
