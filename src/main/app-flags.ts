import { app } from 'electron';

const initialize = () => {
	if (!app.requestSingleInstanceLock()) {
		app.quit();
	}
};

export default { initialize };
