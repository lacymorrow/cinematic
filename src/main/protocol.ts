// Custom app protocol handler for Electron
// https://www.electronjs.org/docs/latest/api/protocol

import { net, protocol } from 'electron';
import { PROTOCOL } from '../config/config';

const initialize = () =>
	protocol.handle(PROTOCOL, (request: any) => {
		return net.fetch(`file://${request.url.slice(`${PROTOCOL}://`.length)}`);
	});

export default { initialize };
