import { app, dialog } from 'electron';
import Logger from 'electron-log';
import path from 'path';
import { $dialog } from '../config/strings';
import { addAppMessage } from './store';

const { bugs } = require('../../package.json');

// Catch errors in the main process
const catchErrors = () => {
	// Catch uncaught errors
	// todo: better message
	return Logger.errorHandler.startCatching({
		showDialog: false,
		onError({ createIssue, error, processType, versions }) {
			if (processType === 'renderer') {
				Logger.error(error);
				return;
			}

			dialog
				.showMessageBox({
					title: $dialog.error.title,
					message: error.message,
					detail: error.stack,
					type: 'error',
					buttons: [
						$dialog.error.ignore,
						$dialog.error.report,
						$dialog.error.quit,
					],
				})
				.then((result) => {
					if (result.response === 1) {
						// Use the package.json bugs url to create the "New Issue" url
						const issueUrl = new URL(bugs.url);
						const createIssueUrl = new URL(
							path.join(issueUrl.pathname, '/new'),
							issueUrl.origin,
						);

						// Open a new window with the "New Issue" url
						createIssue(createIssueUrl.href, {
							title: `Error report for ${versions.app}`,
							body: `Error:\n\`\`\`${error.stack}\n\`\`\`\n OS: ${versions.os}\n\`\`\`\n ELECTRON: ${versions.electron}`,
						});
						return;
					}

					if (result.response === 2) {
						app.quit();
					}
					return null;
				})
				.catch((err: Error) => {
					Logger.error(err);
				});
		},
	});
};

// Initialize logger and error handler
const initialize = () => {
	// Add custom log level to display app status messages
	Logger.addLevel('status', 0);

	// Hook into logger to add messages to app status
	Logger.hooks.push((message, _transport) => {
		// @ts-ignore
		if (message.level === 'status' || message.level === 'error') {
			addAppMessage(message.data.join(' '));
		}
		return message;
	});
};

export default { initialize, catchErrors };
