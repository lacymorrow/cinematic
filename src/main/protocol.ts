// Custom app protocol handler for Electron
// https://www.electronjs.org/docs/latest/api/protocol
// https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app

import { net, protocol } from 'electron';
import { PROTOCOL } from '../config/config';
import { notification } from './notifications';

const initialize = () =>
	protocol.handle(PROTOCOL, (request: any) => {
		const file = `file://${request.url.slice(`${PROTOCOL}://`.length)}`;
		notification({
			title: 'Protocol',
			body: `Request: ${request.url}; File: ${file}`,
		});
		return net.fetch(file);
	});

export default { initialize };
