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

export const $actions = {
	addMedia: 'Add Media',
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

	mainWindow: '"mainWindow" is not defined',

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
};

export const $messages = {
	// Timing messages
	init: 'Initializing...',
	ready: 'App Ready',
	idle: 'Idle',
	window_created: 'Window created',

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
