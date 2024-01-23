/* eslint-disable no-param-reassign */
import {
    BrowserWindow,
    BrowserWindowConstructorOptions,
    IpcMainEvent,
    app,
    shell,
} from 'electron';
import Logger from 'electron-log/main';
import path from 'path';
import { APP_FRAME, APP_HEIGHT, APP_WIDTH } from '../config/config';
import { $errors } from '../config/strings';
import { setupContextMenu } from './context-menu';
import MenuBuilder from './menu';
import { __resources } from './paths';
import { getSetting } from './store';
import { is, resolveHtmlPath } from './util';

export const createMainWindow = async () => {
	let mainWindow: BrowserWindow | null;
	// Create the browser window.
	const getAssetPath = (...paths: string[]): string => {
		return path.join(__resources, ...paths);
	};

	const options: BrowserWindowConstructorOptions = {
		title: app.name,
		tabbingIdentifier: app.name,

		// acceptFirstMouse: true, // macOS: Whether clicking an inactive window will also click through to the web contents. Default is false

		// alwaysOnTop: true,
		// closable: false,
		frame: APP_FRAME,
		// fullscreen: true,
		// fullscreenable: false,
		// simpleFullscreen: true, // Pre-lion fullscreen support (stays in same space)
		// hasShadow: false,
		// maximizable: false,
		// minimizable: false,
		// movable: true,
		// resizable: false,
		show: false,
		// skipTaskbar: true, // Whether to show the window in taskbar. Default is false.
		titleBarStyle: 'hidden', // 'default', 'hidden', 'hiddenInset', 'customButtonsOnHover
		// titleBarOverlay: true, // https://developer.mozilla.org/en-US/docs/Web/API/Window_Controls_Overlay_API
		trafficLightPosition: { x: 10, y: 9 },

		transparent: true, // Makes the window transparent. Default is false. On Windows, does not work unless the window is frameless.
		// backgroundColor: '#00000000', // transparent hexadecimal or anything with transparency,
		vibrancy: 'under-window', // appearance-based, titlebar, selection, menu, popover, sidebar, header, sheet, window, hud, fullscreen-ui, tooltip, content, under-window, or under-page.
		useContentSize: true, // The width and height would be used as web page's size, which means the actual window's size will include window frame's size and be slightly larger. Default is false.

		width: APP_WIDTH,
		minWidth: 550,
		height: APP_HEIGHT,
		minHeight: 420,
		webPreferences: {
			webSecurity: !is.development,
			// Prevent throttling when the window is in the background:
			// backgroundThrottling: false,
			// Disable the `auxclick` feature so that `click` events are triggered in
			// response to a middle-click.
			// (Ref: https://github.com/atom/atom/pull/12696#issuecomment-290496960)
			disableBlinkFeatures: 'Auxclick',
			preload: app.isPackaged
				? path.join(__dirname, 'preload.js')
				: path.join(__dirname, '../../.erb/dll/preload.js'),
		},

		// Conditionally enable features based on the platform
		// https://www.electronjs.org/docs/api/browser-window#new-browserwindowoptions
		// ...(is.windows ? { type: 'toolbar' } : {}),

		// Don't set icon on Windows so the exe's ico will be used as window and
		// taskbar's icon. See https://github.com/atom/atom/issues/4811 for more.
		...(is.linux ? { icon: getAssetPath('icon.png') } : {}),
	};

	mainWindow = new BrowserWindow(options);

	mainWindow.on('unresponsive', (event: IpcMainEvent) => {
		Logger.error(`Window unresponsive: ${event.sender}`);
	});

	mainWindow.webContents.on('did-fail-load', (event: any) => {
		Logger.error(`Window failed load: ${event?.sender}`);
	});

	mainWindow.webContents.on('did-finish-load', () => {
		Logger.info('Window finished load');
	});

	mainWindow.on('ready-to-show', () => {
		if (!mainWindow) {
			throw new Error($errors.mainWindow);
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

	// Load the window
	mainWindow.loadURL(resolveHtmlPath('index.html'));

	// Create application menu
	const menuBuilder = new MenuBuilder(mainWindow);
	menuBuilder.buildMenu();

	// Context menu
	setupContextMenu(mainWindow);

	return mainWindow;
};
