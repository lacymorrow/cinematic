export const $app = {
	name: 'Cinematic',
};

export const $settings = {
	title: 'Settings',
	description: 'Manage your account settings and application preferences',
	app: {
		githubUrl: 'https://github.com/lacymorrow/cinematic',
		repo: 'lacymorrow/cinematic',
		description: 'A boilerplate for Electron applications',
	},
	appearance: {
		themeLabel: 'Theme',
		themeDescription: 'Select the theme for the application',
		light: 'Light',
		dark: 'Dark',
		system: 'System',
	},
	theme: {
		themeLabel: 'Theme',
		themeDescription: 'Select the theme for the application',
		light: 'Light',
		dark: 'Dark',
		system: 'System',
	},
};

export const $actions = {
	addMedia: 'Add Media',
	rotatePoster: 'Click to rotate poster',
};

export const $dialog = {
	error: {
		title: 'An error occurred',
		ignore: 'Ignore',
		report: 'Report',
		quit: 'Quit',
	},
};

export const $errors = {
	noDefaultPath: 'Could not get default media path: ',
	inaccessiblePath: 'Inaccessible path: ',
	invalidPath: 'Invalid path',
	invalidFile: 'Invalid file',
	invalidFiletype: 'Invalid filetype',
	invalidFolder: 'Invalid folder',
	invalidMedia: 'Invalid media',
	invalidMeta: 'Invalid meta',

	tmdb_api: 'Unable to find tmdb metadata',
	trailers_api: 'No trailers for this media',

	queue: 'Queue error',
	prefix: 'Main> ',
	blockedNavigation: 'Blocked navigation to: ',
	invalidChannel: 'Invalid IPC channel',
	github: 'Failed to fetch GitHub data',
};

export const $messages = {
	// Timing messages
	init: 'Initializing...',
	ready: 'App Ready',
	idle: 'Idle',
	started: 'Started',

	auto_update: 'Checking for updates...',
	synchronize_library: 'Synchronizing library',
	synchronize_settings: 'Synchronizing settings',
	mainIdle: 'Main process is now idle',
	synchronize: 'Synchronizing state...',
	update_available: 'Update Available',
	update_available_body: 'Click to download',
	resetStore: 'Reset App',

	// Network messages
	online: 'Connected',
	offline: 'Disconnected - Cannot fetch metadata',

	// Cinematic messages
	addFile: 'Scanning file',
	addFolder: 'Scanning path',
	ignoreFile: 'Ignoring file',
	ignoreFolder: 'Ignoring folder',
	cache_expire: 'Cache expired',
	cache_miss: 'Cache miss',
	cache_hit: 'Cache hit',

	// Function messages
	scanMedia: 'Begin scanning media path: ',

	// Metadata messages
	fetching_omdb: 'Fetching OMDB metadata',
	fetching_tmdb: 'Fetching TBDB metadata',
	fetching_trailers: 'Fetching trailers',
};

export const $ui = {
	liked: {
		liked: 'Liked',
		disliked: 'Disliked',
	},
	view: {
		grid: 'Grid',
		list: 'List',
	},
};

export const $media = {
	title: 'Title',
	year: 'Year',
	released: 'Release Date',
	runtime: 'Runtime',
	rating: 'Rating',
	genres: 'Genres',
	actors: 'Actors',
	directors: 'Directors',
	plot: 'Plot',
	awards: 'Awards',
	production: 'Production',
	website: 'Website',
};

export const $placeholders = {
	media: {
		title: 'No media added',
		description:
			'You have not added any media directories or files. Select a directory to scan for media files.',
		button: 'Add Media',
	},
	liked: {
		title: 'No liked media',
		description:
			'You have not added any media directories or files. Select a directory to scan for media files.',
		button: 'Back to Library',
	},
};

export const $autoUpdate = {
	autoUpdate: 'Checking for updates...',
	updateAvailable: 'Update Available',
	updateAvailableBody: 'Click to download',
};

export const $init = {
	// Timing messages
	app: 'Initializing...',
	startup: 'Starting...',
	started: 'Started',
	ready: 'App Ready',
	logger: 'Initializing logger...',
	analytics: 'Initializing analytics...',
	errorHandling: 'Initializing error handling...',
	debugging: 'Initializing debugging...',
	commandLineFlags: 'Initializing command line flags...',
	refreshSettings: 'Refreshing settings...',
	resetApp: 'Resetting app...',
	appFlags: 'Registering app flags...',
	appListeners: 'Registering app listeners...',
	mainIdle: 'Main process is now idle',
	idle: 'Idle',
};
