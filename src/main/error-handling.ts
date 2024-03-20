import Logger from 'electron-log';
import { $init } from '../config/strings';
import logger from './logger';
import { debugInfo } from './util';

const reportBody = (error: any) => `
	<!-- Please succinctly describe your issue and steps to reproduce it. Screenshots are worth a hundred bug reports! -->


	---
	${
		error &&
		`
	${error}:
	${error.stack}

	---`
	}

	${debugInfo()}`;

const initialize = async () => {
	Logger.status($init.errorHandling);

	// unhandledRejection : This will catch any thrown errors, or non fatal errors you have successfully handled via throw.
	// uncaughtException : This only catches fatal errors or errors that would crash your node instance

	return logger.catchErrors();

	// Report unhandled errors using electron-unhandled
	// await unhandled({
	// 	showDialog: false, // default: only in production
	// 	logger: Logger.warn,
	// 	reportButton(error: any) {
	// 		openNewGitHubIssue({
	// 			user: 'lacymorrow',
	// 			repo: 'crossover',
	// 			body: reportBody(error),
	// 		});
	// 	},
	// });
};

export default { initialize, reportBody };
