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
};

export const $messages = {
	// Timing messages
	init: 'Initializing...',
	ready: 'App Ready',
	started: 'Started',
	idle: 'Idle',
	reset_store: 'Reset App',
	auto_update: 'Checking for updates...',
	synchronize: 'Synchronizing state...',

	// Network messages
	online: 'Connected',
	offline: 'Disconnected - Cannot fetch metadata',
};
