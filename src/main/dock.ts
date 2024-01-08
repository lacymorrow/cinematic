const { app } = require('electron');
const { is } = require('./util');

// MacOS only, dock badge
const setBadge = (text: string) => app?.dock?.setBadge(String(text));

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

export default {
	setBadge,
	setVisible,
};
