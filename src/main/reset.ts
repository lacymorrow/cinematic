import { app } from 'electron';
import Logger from 'electron-log';
import { $init } from '../config/strings';
import { notification } from './notifications';
import sounds from './sounds';
import { resetStore, resetStoreSettings } from './store-actions';

export const restartApp = () => {
	app.relaunch(); // ONLY CALL THIS FUNCTION ONCE, or else it will cause multiple instances of the app to run
	app.quit(); // maybe the application will be closed; maybe not
};

export const resetSettings = () => {
	Logger.status($init.refreshSettings);

	// Sonic announcement
	sounds.play('RESET');

	// Notification
	notification({
		title: $init.refreshSettings,
	});

	resetStoreSettings();
};

export const resetApp = () => {
	// Sonic announcement
	sounds.play('RESET');

	// Notification
	notification({
		title: $init.resetApp,
	});

	resetStore();
};
