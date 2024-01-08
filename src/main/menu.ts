import {
	BrowserWindow,
	Menu,
	MenuItemConstructorOptions,
	app,
	shell,
} from 'electron';
import { bugs, homepage } from '../../package.json';
import notification from './notification';
import sound from './sound';
import { getSetting, setSettings } from './store';
import { is } from './util';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
	selector?: string;
	submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

// MAGIC!
// Create a menu for the renderer process, based on the main process menu
// This creates a serializable version of the menu so that we can render an HTML version of it
// This is necessary because Electron's Menu class is not serializable
export const serializeMenu = (
	menu: Menu | null,
): MenuItemConstructorOptions[] => {
	if (!menu) return [];
	return menu.items.map((item) => {
		// MenuItem properties that are passed to the renderer process
		const serialized: MenuItemConstructorOptions = {
			label: item.label,
			id: item.id,
			type: item.type,
			accelerator: item.accelerator,
			// icon: item.icon,
			sublabel: item.sublabel,
			enabled: item.enabled,
			visible: item.visible,
			checked: item.checked,
		};

		if (item.submenu) {
			serialized.submenu = serializeMenu(item.submenu);
		}

		return serialized;
	});
};

// Allow the renderer process to trigger a menu item by ID, so that the click events are triggered
export const triggerMenuItemById = (menu: Menu | null, id: string) => {
	if (!menu) return;
	menu.getMenuItemById(id)?.click();
};

// Menu items
export const aboutMenuItem: any = {
	label: `About ${app.name}`,
	selector: 'orderFrontStandardAboutPanel:',
	id: 'about',
	accelerator: 'CommandOrControl+Z',
};

export const testNotificationMenuItem: any = {
	label: 'Test Notification',
	id: 'testNotification',
	click: () => {
		notification({
			title: 'Test Notification',
			description: 'This is a test notification',
		});
	},
};

export const testSoundMenuItem: any = {
	label: 'Test Sound',
	id: 'testSound',
	click: () => {
		sound.play('UPDATE');
	},
};

export default class MenuBuilder {
	mainWindow: BrowserWindow;

	constructor(mainWindow: BrowserWindow) {
		this.mainWindow = mainWindow;
	}

	buildMenu(): Menu {
		if (
			process.env.NODE_ENV === 'development' ||
			process.env.DEBUG_PROD === 'true'
		) {
			this.setupDevelopmentEnvironment();
		}

		const template = is.macos
			? this.buildDarwinTemplate()
			: this.buildDefaultTemplate();

		const menu = Menu.buildFromTemplate(template);
		Menu.setApplicationMenu(menu);

		return menu;
	}

	// Add the "Inspect Element" menu item to the context menu
	// This is only available in development mode
	setupDevelopmentEnvironment(): void {
		this.mainWindow.webContents.on('context-menu', (_, props) => {
			const { x, y } = props;

			Menu.buildFromTemplate([
				{
					label: 'Inspect element',
					click: () => {
						this.mainWindow.webContents.inspectElement(x, y);
					},
				},
			]).popup({ window: this.mainWindow });
		});
	}

	subMenuDev: MenuItemConstructorOptions = {
		label: 'Development',
		submenu: [
			{
				label: 'Reload',
				accelerator: 'Command+R',
				click: () => {
					this.mainWindow.webContents.reload();
				},
				id: 'reload',
			},
			{
				label: 'Toggle Developer Tools',
				accelerator: 'Alt+Command+I',
				click: () => {
					this.mainWindow.webContents.toggleDevTools();
				},
				id: 'toggleDevTools',
			},
			testNotificationMenuItem,
			testSoundMenuItem,
		],
	};

	subMenuSettings: MenuItemConstructorOptions = {
		label: 'Settings',
		submenu: [
			{
				label: 'Auto Update',
				type: 'checkbox',
				id: 'autoUpdate',
				enabled: false,
				checked: !!getSetting('autoUpdate'),
			},
			{
				label: 'Show Dock Icon',
				type: 'checkbox',
				id: 'showDockIcon',
				checked: !!getSetting('showDockIcon'),
				click: () => {
					setSettings({ showDockIcon: !getSetting('showDockIcon') });
				},
			},
			{
				label: 'Quit on Close',
				type: 'checkbox',
				id: 'quitOnWindowClose',
				checked: !!getSetting('quitOnWindowClose'),
				click: () => {
					setSettings({
						quitOnWindowClose: !getSetting('quitOnWindowClose'),
					});
				},
			},
		],
	};

	subMenuHelp: MenuItemConstructorOptions = {
		label: 'Help',
		submenu: [
			...(!is.macos ? [aboutMenuItem] : []),
			{
				label: 'Learn More',
				click() {
					shell.openExternal(homepage);
				},
				id: 'learnMore',
			},
			{
				label: 'Report an Issue...',
				click() {
					shell.openExternal(bugs.url);
				},
				id: 'documentation',
			},
		],
	};

	buildDarwinTemplate(): MenuItemConstructorOptions[] {
		const subMenuAbout: DarwinMenuItemConstructorOptions = {
			label: app.name,
			submenu: [
				aboutMenuItem,
				{ type: 'separator' },
				{
					label: 'Services',
				},
				{ type: 'separator' },
				{
					label: `Hide ${app.name}`,
					accelerator: 'Command+H',
					selector: 'hide:',
				},
				{
					label: 'Hide Others',
					accelerator: 'Command+Shift+H',
					selector: 'hideOtherApplications:',
				},
				{
					id: 'showAll',
					label: 'Show All',
					selector: 'unhideAllApplications:',
				},
				{ type: 'separator' },
				{
					id: 'quit',
					label: `Quit ${app.name}`,
					accelerator: 'Command+Q',
					click: () => {
						app.quit();
					},
				},
			],
		};
		const subMenuEdit: DarwinMenuItemConstructorOptions = {
			label: 'Edit',
			submenu: [
				{
					label: 'Undo',
					accelerator: 'Command+Z',
					selector: 'undo:',
					id: 'undo',
				},
				{
					label: 'Redo',
					accelerator: 'Shift+Command+Z',
					selector: 'redo:',
					id: 'redo',
				},
				{ type: 'separator' },
				{ label: 'Cut', accelerator: 'Command+X', selector: 'cut:', id: 'cut' },
				{
					label: 'Copy',
					accelerator: 'Command+C',
					selector: 'copy:',
					id: 'copy',
				},
				{
					label: 'Paste',
					accelerator: 'Command+V',
					selector: 'paste:',
					id: 'paste',
				},
				{
					label: 'Select All',
					accelerator: 'Command+A',
					selector: 'selectAll:',
					id: 'selectAll',
				},
			],
		};
		const subMenuViewDev: MenuItemConstructorOptions = {
			label: 'View',
			submenu: [
				{
					label: 'Reload',
					accelerator: 'Command+R',
					click: () => {
						this.mainWindow.webContents.reload();
					},
					id: 'reload',
				},
				{
					label: 'Toggle Full Screen',
					accelerator: 'Ctrl+Command+F',
					click: () => {
						this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
					},
					id: 'toggleFullScreen',
				},
			],
		};
		const subMenuViewProd: MenuItemConstructorOptions = {
			label: 'View',
			submenu: [
				{
					label: 'Toggle Full Screen',
					accelerator: 'Ctrl+Command+F',
					click: () => {
						this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
					},
					id: 'toggleFullScreen',
				},
			],
		};
		const subMenuWindow: DarwinMenuItemConstructorOptions = {
			label: 'Window',
			submenu: [
				{
					label: 'Minimize',
					accelerator: 'Command+M',
					selector: 'performMiniaturize:',
					id: 'minimize',
				},
				{
					label: 'Close',
					accelerator: 'Command+W',
					selector: 'performClose:',
					id: 'close',
				},
				{ type: 'separator' },
				{
					label: 'Bring All to Front',
					selector: 'arrangeInFront:',
					id: 'bringToFront',
				},
			],
		};

		const subMenuView =
			process.env.NODE_ENV === 'development' ||
			process.env.DEBUG_PROD === 'true'
				? subMenuViewDev
				: subMenuViewProd;

		return [
			subMenuAbout,
			subMenuEdit,
			subMenuView,
			subMenuWindow,
			this.subMenuSettings,
			this.subMenuHelp,
			...(is.debug ? [this.subMenuDev] : []),
		];
	}

	buildDefaultTemplate() {
		const templateDefault = [
			{
				label: '&File',
				submenu: [
					{
						label: '&Open',
						accelerator: 'Ctrl+O',
						id: 'open',
					},
					{
						label: '&Close',
						accelerator: 'Ctrl+W',
						click: () => {
							this.mainWindow.close();
						},
						id: 'close',
					},
				],
			},
			{
				label: '&View',
				submenu:
					process.env.NODE_ENV === 'development' ||
					process.env.DEBUG_PROD === 'true'
						? [
								{
									label: '&Reload',
									accelerator: 'Ctrl+R',
									click: () => {
										this.mainWindow.webContents.reload();
									},
									id: 'reload',
								},
								{
									label: 'Toggle &Full Screen',
									accelerator: 'F11',
									click: () => {
										this.mainWindow.setFullScreen(
											!this.mainWindow.isFullScreen(),
										);
									},
									id: 'toggleFullScreen',
								},
								{
									label: 'Toggle &Developer Tools',
									accelerator: 'Alt+Ctrl+I',
									click: () => {
										this.mainWindow.webContents.toggleDevTools();
									},
									id: 'toggleDevTools',
								},
								testNotificationMenuItem,
							]
						: [
								{
									label: 'Toggle &Full Screen',
									accelerator: 'F11',
									click: () => {
										this.mainWindow.setFullScreen(
											!this.mainWindow.isFullScreen(),
										);
									},
									id: 'toggleFullScreen',
								},
							],
			},
			this.subMenuSettings,
			this.subMenuHelp,
			...(is.debug ? [this.subMenuDev] : []),
		];

		return templateDefault;
	}
}
