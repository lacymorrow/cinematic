// MacOS only
import { app } from 'electron';
import { getSetting } from './store-actions';
import { is } from './util';

// Sets the badge on the dock icon
const setBadge = (text: string) => {
	if (!is.macos) return;
	app.dock.setBadge(String(text));
};

// Hides the app from the dock and CMD+Tab, necessary for staying on top macOS fullscreen windows
const setVisible = (visible: boolean) => {
	if (is.macos) {
		if (visible) {
			app.dock.show();
		} else {
			app.dock.hide();
		}
	}
};

const initialize = () => {
	if (is.macos) {
		setVisible(!!getSetting('showDockIcon'));
	}
};

export default {
	initialize,
	setBadge,
	setVisible,
};
