export const $app = {
	name: 'Cinematic',
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

export const $actions = {
	addMedia: 'Add Media',
	rotatePoster: 'Click to rotate poster',
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
	main: 'Main> ',
	blockedNavigation: 'Blocked navigation to: ',
	invalidChannel: 'Invalid IPC channel',
};

export const $messages = {
	// Timing messages
	init: 'Initializing...',
	ready: 'App Ready',
	idle: 'Idle',
	started: 'Started',
	reset_store: 'Reset App',
	auto_update: 'Checking for updates...',
	synchronize_library: 'Synchronizing library',
	synchronize_settings: 'Synchronizing settings',
	mainIdle: 'Main process is now idle',
	synchronize: 'Synchronizing state...',
	update_available: 'Update Available',
	update_available_body: 'Click to download',

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
