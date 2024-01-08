import { app } from 'electron';
import Logger from 'electron-log';
import { VALID_FILETYPES } from '../config/config';
import { $dialog } from '../config/strings';
import { scanMedia } from './file';

const { dialog } = require('electron');

export const openMediaPathDialog = () => {
	return (
		dialog
			.showOpenDialog({
				title: $dialog.add.title,
				buttonLabel: $dialog.add.buttonLabel,
				defaultPath: app.getPath('videos'),
				properties: [
					'dontAddToRecent',
					'openFile',
					'openDirectory',
					'multiSelections',
				],
				filters: [
					{
						name: 'Media',
						extensions: VALID_FILETYPES,
					},
					{ name: 'All Files', extensions: ['*'] },
				],
			})
			.then((response) => {
				if (!response.canceled) {
					response.filePaths.forEach((path: string) => {
						scanMedia(path);
					});
				}
				return [];
			})
			// todo: handle error
			.catch(Logger.error)
	);
};
