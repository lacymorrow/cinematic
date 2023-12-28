import { app } from 'electron';
import { VALID_FILETYPES } from '../config/config';
import { $dialog } from '../config/strings';
import { scanMedia } from './file';

const { dialog } = require('electron');

export const openMediaPathDialog = () => {
	return (
		dialog
			.showOpenDialog({
				title: $dialog.title,
				buttonLabel: $dialog.buttonLabel,
				defaultPath: app.getPath('videos'),
				properties: [
					'dontAddToRecent',
					'openFile',
					'openDirectory',
					'multiSelections',
				],
				filters: [
					{
						name: 'Movies',
						extensions: VALID_FILETYPES,
					},
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
			.catch((err) => console.log(err))
	);
};
