export default {
	// Renderer
	app: {
		title: 'Cinematic'
	},
	sidebar: {
		label: 'Browse',
		main: 'Movies'
	},
	movie: {
		actor: 'Cast',
		award: 'Awards',
		director: 'Directors',
		writer: 'Writers',

		imdbLink: 'IMDB',
		trailer: 'Preview',

		noMovies: 'No movies found, select a directory above.'
	},

	// Main process
	background: {
		dev: 'Development mode'
	},

	// Worker
	ipc: {
		invalid: 'Invalid worker ipc message received'
	},
	q: {
		start: 'Starting queue',
		finish: 'API queue completed',
		error: 'Queue error',
		timeout: 'Queue job timeout'
	},

	// Component-specific
	button: {
		init: 'Button'
	},
	directory: {
		init: '',
		button: 'Choose Directory',
		placeholder: 'Directory of movie files...'
	},
	messagebox: {
		init: 'Initializing...',
		loadFromCache: 'Reloading previous cache',
		setPath: 'Starting scan of',
		scanDir: 'Scanning directory',
		scanFile: 'Adding file',
		openExternal: 'Opening',
		openExternalError: 'Error trying to open',
		queue: 'Gathering meta',
		genreCache: 'Caching genre list',
		genreCacheError: 'Error retrieving genre list'
	},
	resetBtn: {
		click: 'Resetting state...',
		tooltip: 'Reset Cinematic'
	},

	// Console
	log: {
		firstRun: 'Starting Cinematic...',
		fetchGenreCache: 'Fetching genre list.',
		reset: 'Resetting server...'
	},
	warn: {
		cacheInvalid: 'No valid cache found. Starting fresh.',
		cacheValid: 'Loading from cache...',
		file: 'File not valid',
		filecache: 'Loading cached movie'
	},
	error: {
		chooseDir: 'There was a problem while choosing a directory, please try again.',
		ipc: 'Invalid ipc message received',
		scanDir: 'Error scanning directory',
		scanPath: 'Error: Path is not a directory.',

		genres: 'Error fetching genre metadata',
		omdb: 'Error fetching OMDB data',
		tmdb: 'Error fetching TMDB data',
		trailer: 'Error fetching movie trailer data'

	}
}
