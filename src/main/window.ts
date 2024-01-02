import { BrowserWindow, app, shell } from 'electron';
import path from 'path';
import { $errors } from '../config/strings';
import { AutoUpdate } from './auto-update';
import MenuBuilder from './menu';
import shortcuts from './shortcuts';
import { resolveHtmlPath } from './util';

interface Window {
	createWindow: () => void;
	mainWindow: BrowserWindow | null;
}

// Prevent window from being garbage collected
const win: Window = {
	mainWindow: null,

	createWindow: async () => {
		const RESOURCES_PATH = app.isPackaged
			? path.join(process.resourcesPath, 'assets')
			: path.join(__dirname, '../../assets');

		const getAssetPath = (...paths: string[]): string => {
			return path.join(RESOURCES_PATH, ...paths);
		};

		win.mainWindow = new BrowserWindow({
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

		win.mainWindow.loadURL(resolveHtmlPath('index.html'));

		win.mainWindow.on('ready-to-show', () => {
			if (!win.mainWindow) {
				throw new Error($errors.mainWindow);
			}
			if (process.env.START_MINIMIZED) {
				win.mainWindow.minimize();
			} else {
				win.mainWindow.show();
			}
		});

		win.mainWindow.on('closed', () => {
			win.mainWindow = null;
		});

		const menuBuilder = new MenuBuilder(win.mainWindow);
		menuBuilder.buildMenu();

		// Open urls in the user's browser
		win.mainWindow.webContents.setWindowOpenHandler((edata) => {
			shell.openExternal(edata.url);
			return { action: 'deny' };
		});

		// Remove this if your app does not use auto updates
		// eslint-disable-next-line no-new
		new AutoUpdate();

		// Register shortcuts
		shortcuts.init();
	},
};

export default win;
