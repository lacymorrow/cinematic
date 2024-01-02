import { BrowserWindow, app } from 'electron';
import path from 'path';
import { resolveHtmlPath } from './util';

export const createMainWindow = async () => {
	let mainWindow: BrowserWindow | null = null;
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

	return mainWindow;
};
