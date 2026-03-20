import { app } from 'electron';

const initialize = () => {
	// Prevent multiple instances of the app
	if (!app.requestSingleInstanceLock()) {
		app.quit();
	}
};

export default { initialize };
