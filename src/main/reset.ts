import { app } from 'electron';
import sounds from './sounds';
import { resetStore, resetStoreSettings } from './store-actions';

export const restartApp = () => {
	app.relaunch(); // ONLY CALL THIS FUNCTION ONCE, or else it will cause multiple instances of the app to run
	app.quit(); // maybe the application will be closed; maybe not
};

export const resetSettings = () => {
	// Sonic announcement
	sounds.play('RESET');
	resetStoreSettings();
};

export const resetApp = () => {
	// Sonic announcement
	sounds.play('RESET');
	resetStore();
};
