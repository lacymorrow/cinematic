import { app } from 'electron';
import sound from './sounds';
import { resetStore } from './store-actions';

export const restartApp = () => {
	app.relaunch(); // ONLY CALL THIS FUNCTION ONCE, or else it will cause multiple instances of the app to run
	app.quit(); // maybe the application will be closed; maybe not
};

export const resetApp = () => {
	// Sonic announcement
	sound.play('RESET');
	resetStore();
};
