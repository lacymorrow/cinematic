export const $app = {
	name: 'Cinematic',
	link: 'https://github.com/lacymorrow/cinematic',
	github: 'https://github.com/lacymorrow/cinematic',
};

export const $settings = {
	appearance: {
		themeLabel: 'Theme',
		themeDescription: 'Select the theme for the application',
		light: 'Light',
		dark: 'Dark',
		system: 'System',
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
	queue: 'Queue error',
};

export const $messages = {
	// Timing messages
	init: 'Initializing...',
	ready: 'App Ready',
	idle: 'Idle',
	window_created: 'Window created',
	resetting_store: 'Resetting store',

	// Network messages
	online: 'Connected',
	offline: 'Disconnected - Cannot fetch metadata',
};
