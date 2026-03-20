// Custom app protocol handler for Electron
// https://www.electronjs.org/docs/latest/api/protocol
// https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app

import { net, protocol } from 'electron';
import Logger from 'electron-log/main';
import path from 'path';
import { PROTOCOL } from '../config/config';
import { __assets } from './paths';

const register = () => {
	Logger.status(`Registering file protocol: ${PROTOCOL}`);
	protocol.registerSchemesAsPrivileged([
		{
			scheme: PROTOCOL,
			privileges: {
				stream: true, // Important for playing audio
				// allowServiceWorkers: true,
				// secure: true,
				// standard: true,
				// supportFetchAPI: true,
				// bypassCSP: true,
			},
		},
	]);
};

const initialize = () => {
	if (!protocol?.handle) {
		// Old versions of Electron don't have protocol.handle
		return null;
	}

	// By default, we serve files from the assets folder
	protocol.handle(PROTOCOL, (request: any) => {
		// list all files in the directory
		const filepath = path
			.join(__assets, request.url.slice(`${PROTOCOL}://`.length))
			.replace(/\/$/, ''); // remove trailing slash
		const file = `file://${filepath}`;
		Logger.info(`Protocol request: ${request.url}; File: ${file}`);
		return net.fetch(file);
	});
};

export default { initialize, register };
