// Custom app protocol handler for Electron
// https://www.electronjs.org/docs/latest/api/protocol
// https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app

import { protocol } from 'electron';
import { PROTOCOL } from '../config/config';

const initialize = () =>
	protocol.handle(PROTOCOL, (request: any) => {
		// UNFSAFE: allows access to the entire file system
		// return net.fetch(`file://${request.url.slice(`${PROTOCOL}://`.length)}`);
	});

export default { initialize };
