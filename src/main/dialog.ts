import { app, dialog as electronDialog, MessageBoxReturnValue } from 'electron';
import Logger from 'electron-log';
import path from 'path';
import { VALID_FILETYPES } from '../config/config';
import { $dialog } from '../config/strings';
import { scanMedia } from './file';
import { debugInfo, is } from './util';

const validButtonIndex = (result: MessageBoxReturnValue | number) =>
	typeof result === 'object' && typeof result.response === 'number'
		? result.response
		: (result as number);

export const openMediaPathDialog = () => {
	return (
		electronDialog
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
					response.filePaths.forEach((mediaPath: string) => {
						scanMedia(mediaPath);
					});
				}
				return [];
			})
			// todo: handle error
			.catch(Logger.error)
	);
};

interface AboutWindowOptions {
	icon?: string;
	copyright?: string;
	text?: string;
	website?: string;
}

const showAboutWindow = (options: AboutWindowOptions = {}) => {
	// TODO: When https://github.com/electron/electron/issues/18918 is fixed,
	// these defaults should not need to be set for Linux.
	// TODO: The defaults are standardized here, instead of being set in
	// Electron when https://github.com/electron/electron/issues/23851 is fixed.

	const appName = app.getName();
	const appVersion = app.getVersion();

	const aboutPanelOptions: Electron.AboutPanelOptionsOptions = {
		applicationName: appName,
		applicationVersion: appVersion,
	};

	if (options.icon) {
		aboutPanelOptions.iconPath = options.icon;
	}

	if (options.copyright || options.text) {
		aboutPanelOptions.copyright = [options.copyright, options.text]
			.filter(Boolean)
			.join('\n\n');
	}

	if (options.website) {
		aboutPanelOptions.website = options.website;
	}

	app.setAboutPanelOptions(aboutPanelOptions);
	app.showAboutPanel();
};

const openAboutDialog = () => {
	showAboutWindow({
		icon: path.join(__dirname, 'static', 'icons', 'icon.png'),
		copyright: `🎯 CrossOver ${app.getVersion()} | Copyright © Lacy Morrow`,
		text: `A crosshair overlay for any screen. Feedback and bug reports welcome. Created by Lacy Morrow. Crosshairs thanks to /u/IrisFlame. ${
			is.development && ` | ${debugInfo()}`
		} GPU: ${app.getGPUFeatureStatus().gpu_compositing}`,
	});
};

// const openAlertDialog = async (message: string) => {
// 	await electronDialog
// 		.showMessageBox({
// 			type: 'info',
// 			title: 'CrossOver: Developer Update',
// 			message,
// 			buttons: ['Turn off alerts', 'Open in browser...', 'Dismiss'],
// 		})
// 		.then((result) => {
// 			const buttonIndex = validButtonIndex(result);

// 			if (buttonIndex === 0) {
// 				setSettings({ showAppDeveloperMessages: false })
// 			}

// 			if (buttonIndex === 1) {
// 				return shell.openExternal(HOMEPAGE_URL);
// 			}
// 		});
// };

const openUpdateDialog = async (action: Function) => {
	await electronDialog
		.showMessageBox({
			type: 'info',
			title: 'CrossOver Update Available',
			message: '',
			buttons: ['Update', 'Ignore'],
		})
		.then((result) => {
			const buttonIndex = validButtonIndex(result);
			if (buttonIndex === 0 && typeof action === 'function') {
				action();
			}
		});
};

export default {
	openMediaPathDialog,
	openAboutDialog,
	openUpdateDialog,
};
