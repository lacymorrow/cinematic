/* eslint-disable global-require */
import debug from 'electron-debug';
import Logger from 'electron-log/main';
import { is } from './util';

const initialize = () => {
	// Enable source map support in production
	if (is.prod) {
		const sourceMapSupport = require('source-map-support');
		sourceMapSupport.install();
	}

	// Enable debug utilities in development
	if (is.debug) {
		debug({
			showDevTools: true,
			devToolsMode: 'undocked',
		});
	}
};

// Add debugging extensions like `react-devtools` and `redux-devtools`
const installExtensions = async () => {
	const installer = require('electron-devtools-installer');
	const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
	const extensions = ['REACT_DEVELOPER_TOOLS'];

	return installer
		.default(
			extensions.map((name) => installer[name]),
			forceDownload,
		)
		.catch(Logger.warn);
};

export default {
	initialize,
	installExtensions,
};
