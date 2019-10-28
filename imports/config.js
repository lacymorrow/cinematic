'use strict'

const DEFAULT_OMDB_KEY = 'e0341ca3'
const DEFAULT_TMDB_KEY = '9d2bff12ed955c7f1f74b83187f188ae'

export const config = {
	TMDB_KEY: process.env.TMDB_KEY ? process.env.TMDB_KEY : DEFAULT_TMDB_KEY, // http://docs.themoviedb.apiary.io/ config
	OMDB_KEY: process.env.OMDB_KEY ? process.env.OMDB_KEY : DEFAULT_OMDB_KEY, // Omdb api key

	VALID_TYPES: [
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
	SORT_TYPES: [
		'Alphabetical',
		'Popularity',
		'Release Date',
		'Runtime',
		'Random' /* , "Ratings" */
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
	MAX_CONNECTIONS: 3, // Max number of simultaneous, more is faster but more api hits at once; 5 is okay...
	PARSE_METHOD: 'parse', // Filename parsing options: "regex", "parse"; regex is best for well-organized files lile This[2004].avi
	RATING_DELAY: 6000, // Milli-seconds of rating rotate interval; 5000 = 5 seconds
	RETRY_DELAY: 4000, // Milli-seconds delay of retrying failed api requests to alieviate thousands of simultaneous requests;
	SCAN_DEPTH: 2, // How many directory levels to recursively search. 0 is a flat directory search. Higher is further down the rabbit hole === more processing time
	IGNORE_PATTERN: ['sample', 'etrg'] // A lowercase list of movie titles to ignore; ex: sample.avi
}
