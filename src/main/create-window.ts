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
import { setupContextMenu } from './context-menu';
import MenuBuilder from './menu';
import { __resources } from './paths';
import { getSetting } from './store-actions';
import { is, resolveHtmlPath } from './util';
import windows from './windows';

const getAssetPath = (...paths: string[]): string => {
	return path.join(__resources, ...paths);
};

const createWindow = (opts?: BrowserWindowConstructorOptions) => {
	const options: BrowserWindowConstructorOptions = {
		title: app.name,
		tabbingIdentifier: app.name,
		frame: APP_FRAME,
		show: false,

		// closable: false,
		// fullscreen: true,
		// fullscreenable: false,
		// simpleFullscreen: true, // Pre-lion fullscreen support (stays in same space)
		// hasShadow: false,
		// maximizable: false,
		// minimizable: false,
		// movable: true,
		// resizable: false,

		backgroundColor: '#00000000', // transparent hexadecimal or anything with transparency,
		vibrancy: 'under-window', // appearance-based, titlebar, selection, menu, popover, sidebar, header, sheet, window, hud, fullscreen-ui, tooltip, content, under-window, or under-page.
		useContentSize: true, // The width and height would be used as web page's size, which means the actual window's size will include window frame's size and be slightly larger. Default is false.

		width: APP_WIDTH,
		minWidth: 550,
		height: APP_HEIGHT,
		minHeight: 420,

		// Conditionally enable features based on the platform
		// https://www.electronjs.org/docs/api/browser-window#new-browserwindowoptions
		// ...(is.windows ? { type: 'toolbar' } : {}),

		// Don't set icon on Windows so the exe's ico will be used as window and
		// taskbar's icon. See https://github.com/atom/atom/issues/4811 for more.
		...(is.linux ? { icon: getAssetPath('icon.png') } : {}),
		...opts,
	};

	options.webPreferences = {
		webSecurity: !is.development, // Required for loading sounds, comment out if not using sounds
		// Prevent throttling when the window is in the background:
		// backgroundThrottling: false,
		// Disable the `auxclick` feature so that `click` events are triggered in
		// response to a middle-click.
		// (Ref: https://github.com/atom/atom/pull/12696#issuecomment-290496960)
		disableBlinkFeatures: 'Auxclick',
		preload: app.isPackaged
			? path.join(__dirname, 'preload.js')
			: path.join(__dirname, '../../.erb/dll/preload.js'),
	};

	const browserWindow = new BrowserWindow(options);

	browserWindow.on('unresponsive', (event: IpcMainEvent) => {
		Logger.error(`Window unresponsive: ${event.sender}`);
	});

	browserWindow.webContents.on('did-fail-load', (event: any) => {
		Logger.error(`Window failed load: ${event?.sender}`);
	});

	browserWindow.webContents.on('did-finish-load', () => {
		Logger.info('Window finished load');
	});

	// Clean
	browserWindow.on('closed', () => {
		Logger.status('Window closed');
	});

	// Open urls in the user's browser
	browserWindow.webContents.setWindowOpenHandler((data) => {
		shell.openExternal(data.url);
		return { action: 'deny' };
	});

	// Create application menu
	const menuBuilder = new MenuBuilder(browserWindow);
	menuBuilder.buildMenu();

	// Context menu
	setupContextMenu(browserWindow);

	return browserWindow;
};

export const createMainWindow = async () => {
	const options: BrowserWindowConstructorOptions = {
		// acceptFirstMouse: true, // macOS: Whether clicking an inactive window will also click through to the web contents. Default is false
		// alwaysOnTop: true,
		show: false,
		// skipTaskbar: true, // Whether to show the window in taskbar. Default is false.
		titleBarStyle: 'hidden', // 'default', 'hidden', 'hiddenInset', 'customButtonsOnHover
		// titleBarOverlay: true, // https://developer.mozilla.org/en-US/docs/Web/API/Window_Controls_Overlay_API
		trafficLightPosition: { x: 10, y: 9 },

		transparent: true, // Makes the window transparent. Default is false. On Windows, does not work unless the window is frameless.
		// backgroundColor: '#00000000', // transparent hexadecimal or anything with transparency,
		vibrancy: 'under-window', // appearance-based, titlebar, selection, menu, popover, sidebar, header, sheet, window, hud, fullscreen-ui, tooltip, content, under-window, or under-page.

		width: APP_WIDTH,
		minWidth: 550,
		height: APP_HEIGHT,
		minHeight: 420,
	};

	if(is.windows){
		options.titleBarOverlay = {
			color: getSetting('theme') === 'dark' ? '#000000' : '#ffffff',
			symbolColor: String(getSetting('accentColor')) || '#000000',
			height: 34
		  }
	}

	const window = createWindow(options);

	window.on('ready-to-show', () => {
		// Setting: Start minimized
		if (process.env.START_MINIMIZED || getSetting('startMinimized')) {
			window.minimize();
		} else {
			window.show();
		}
	});

	// Load the window
	window.loadURL(resolveHtmlPath('index.html'));

	return window;
};

export const createChildWindow = async () => {
	const window = createWindow({ frame: true });

	window.on('ready-to-show', () => {
		window.show();
		windows.mainWindow?.focus();
	});

	// Load the window
	window.loadURL(resolveHtmlPath('child.html'));

	return window;
};
