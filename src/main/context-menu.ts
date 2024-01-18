import { BrowserWindow, Menu } from 'electron';

export const setupContextMenu = (window: BrowserWindow) => {
	window.webContents.on('context-menu', (_, props) => {
		const { x, y } = props;

		Menu.buildFromTemplate([
			{
				label: 'Inspect element',
				click: () => {
					window.webContents.inspectElement(x, y);
				},
			},
		]).popup({ window });
	});
};
