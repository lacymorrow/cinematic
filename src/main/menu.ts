import {
	BrowserWindow,
	Menu,
	MenuItemConstructorOptions,
	app,
	shell,
} from 'electron';
import { homepage } from '../../package.json';
import { is } from './util';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
	selector?: string;
	submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

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

export const triggerMenuItemById = (menu: Menu | null, id: string) => {
	if (!menu) return;
	menu.getMenuItemById(id)?.click();
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

	buildDarwinTemplate(): MenuItemConstructorOptions[] {
		const subMenuAbout: DarwinMenuItemConstructorOptions = {
			label: app.name,
			submenu: [
				{
					label: `About ${app.name}`,
					selector: 'orderFrontStandardAboutPanel:',
					id: 'about',
					accelerator: 'CommandOrControl+Z',
				},
				{ type: 'separator' },
				{
					label: 'Services',
					submenu: [
						{ label: 'Item1', type: 'radio', id: 'item1' },
						{ label: 'Item2', type: 'radio', id: 'item2' },
						{ label: 'Item3', type: 'radio', checked: true, id: 'item3' },
						{
							label: 'Item4',
							type: 'radio',
							checked: false,
							id: 'item4',
						},
					],
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
				{
					label: 'Toggle Developer Tools',
					accelerator: 'Alt+Command+I',
					click: () => {
						this.mainWindow.webContents.toggleDevTools();
					},
					id: 'toggleDevTools',
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
		const subMenuHelp: MenuItemConstructorOptions = {
			label: 'Help',
			submenu: [
				{
					label: 'Learn More',
					click() {
						shell.openExternal(homepage);
					},
					id: 'learnMore',
				},
				{
					label: 'Documentation',
					click() {
						shell.openExternal(
							'https://github.com/electron/electron/tree/main/docs#readme',
						);
					},
					id: 'documentation',
				},
				{
					label: 'Community Discussions',
					click() {
						shell.openExternal('https://www.electronjs.org/community');
					},
					id: 'communityDiscussions',
				},
				{
					label: 'Search Issues',
					click() {
						shell.openExternal('https://github.com/electron/electron/issues');
					},
					id: 'searchIssues',
				},
			],
		};

		const subMenuView =
			process.env.NODE_ENV === 'development' ||
			process.env.DEBUG_PROD === 'true'
				? subMenuViewDev
				: subMenuViewProd;

		return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
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
			{
				label: 'Help',
				submenu: [
					{
						label: 'Learn More',
						click() {
							shell.openExternal(homepage);
						},
						id: 'learnMore',
					},
					{
						label: 'Documentation',
						click() {
							shell.openExternal(
								'https://github.com/electron/electron/tree/main/docs#readme',
							);
						},
						id: 'documentation',
					},
					{
						label: 'Community Discussions',
						click() {
							shell.openExternal('https://www.electronjs.org/community');
						},
						id: 'communityDiscussions',
					},
					{
						label: 'Search Issues',
						click() {
							shell.openExternal('https://github.com/electron/electron/issues');
						},
						id: 'searchIssues',
					},
				],
			},
		];

		return templateDefault;
	}
}
