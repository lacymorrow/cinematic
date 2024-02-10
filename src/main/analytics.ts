import { initialize as aptabase, trackEvent } from '@aptabase/electron/main';
import Logger from 'electron-log';
import { $init } from '../config/strings';
import { getSetting } from './store-actions';

const initialize = () => {
	if (!getSetting('allowAnalytics')) {
		return;
	}

	Logger.status($init.logger);

	aptabase('A-US-6138101850'); // 👈 this is where you enter your App Key
};

const track = (event: string, data?: any) => {
	if (!getSetting('allowAnalytics')) {
		return;
	}
	trackEvent(event, data);
};

export default {
	initialize,
	track,
};
