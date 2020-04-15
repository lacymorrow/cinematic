'use strict'

const DEFAULT_OMDB_KEY = 'e0341ca3'
const DEFAULT_TMDB_KEY = '9d2bff12ed955c7f1f74b83187f188ae'

const config = {
	TMDB_KEY: process.env.TMDB_KEY ? process.env.TMDB_KEY : DEFAULT_TMDB_KEY, // http://docs.themoviedb.apiary.io/ config
	OMDB_KEY: process.env.OMDB_KEY ? process.env.OMDB_KEY : DEFAULT_OMDB_KEY, // Omdb api key

	VALID_FILETYPES: [
		'.avi',
		'.flv',
		'.mp4',
		'.m4v',
		'.mov',
		'.ogg',
		'.ogv',
		'.vob',
		'.wmv',
		'.mkv'
	],
	CACHE_TIMEOUT: 3600, // Seconds; 604800 = 7 days; 0 === no caching
	PLOT_LENGTH: 'full', // Plot Summary length: "short", "full" - from omdb

	/* URLs */
	IMDB_ENDPOINT: 'https://image.tmdb.org/t/p/',
	GENRE_ENDPOINT: 'http://api.themoviedb.org/3/genre/movie/list',
	BACKDROP_SIZE: 'w1280', // "w300", "w780", "w1280", "original"
	POSTER_SIZE: 'w780', // "w92", "w154", "w185", "w342", "w500", "w780", "original",

	/* app-specific */
	// -- affects how app is run and may affect performance
	DEFAULT_MEDIA_PATH: '~/', // Path only used if OS path fails
	MAX_CONNECTIONS: 3, // Max number of simultaneous, more is faster but more api hits at once; 5 is okay...
	PARSE_METHOD: 'parse', // Filename parsing options: "regex", "parse"; regex is best for well-organized files lile This[2004].avi
	RATING_DELAY: 5000, // Ms of rating rotate interval; 5000 = 5 seconds
	RETRY_DELAY: 4000, // Ms delay of retrying failed api requests to alieviate thousands of simultaneous requests;
	REFLOW_DELAY: 600, // Ms of time between updates to the renderer to limit repaints
	SCAN_DEPTH: 1, // How many directory levels to recursively search. 0 is a flat directory search. Higher is further down the rabbit hole === more processing time
	TIMEOUT: 5000, // Ms for queue to wait while processing each file before stopping.
	IGNORE_PATTERN: [ 'sample', 'etrg' ], // A lowercase list of movie titles to ignore; ex: sample.avi
	FILTERS: [
		{ key: 'alphabetical', value: 'Alphabetical' },
		{ key: 'popularity', value: 'Popularity' },
		{ key: 'ratings', value: 'Ratings' },
		{ key: 'release', value: 'Release Date' },
		{ key: 'runtime', value: 'Runtime' },
		{ key: 'shuffled', value: 'Shuffled' }
	],
	DEFAULT_STATE: {
		cwd: process.env.PWD, // Electron.remote.app.getPath()
		dirpath: '~/',
		loading: 0,
		queueTotal: 0,
		activeMovie: -1,
		currentPage: 'movies',
		isShuffling: false,
		message: 'initializing...'
	}
}

export default config
