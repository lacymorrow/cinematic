export const $settings = {
	theme: {
		themeLabel: 'Theme',
		themeDescription: 'Select the theme for the application',
		light: 'Light',
		dark: 'Dark',
		system: 'System',
		action: 'Change Theme',
	},
};

export const $dialog = {
	add: {
		title: 'Add Media',
		buttonLabel: 'Add',
	},
	error: {
		title: 'An error occurred',
		ignore: 'Ignore',
		report: 'Report',
		quit: 'Quit',
	},
};

export const $errors = {
	prefix_main: 'Main> ',
	main_window: '"mainWindow" is not defined',
	blocked_navigation: 'Blocked navigation to: ',
	invalid_channel: 'Invalid IPC channel',
};

export const $messages = {
	// Timing messages
	init: 'Initializing...',
	ready: 'App Ready',
	started: 'Started',
	idle: 'Idle',
	reset_store: 'Reset App',
	synchronize: 'Synchronizing state...',
	auto_update: 'Checking for updates...',
	update_available: 'Update Available',
	update_available_body: 'Click to download',

	// Network messages
	online: 'Connected',
	offline: 'Disconnected - Cannot fetch metadata',
};
