import { MediaType } from '../types/file';

const DEFAULT_OMDB_KEY = 'e0341ca3';
const DEFAULT_TMDB_KEY = '9d2bff12ed955c7f1f74b83187f188ae';

export const TMDB_KEY = process.env.TMDB_KEY
	? process.env.TMDB_KEY
	: DEFAULT_TMDB_KEY; // http://docs.themoviedb.apiary.io/ config
export const OMDB_KEY = process.env.OMDB_KEY
	? process.env.OMDB_KEY
	: DEFAULT_OMDB_KEY; // Omdb api key

// Constants
export const APP_WIDTH = 1024;
export const APP_HEIGHT = 720;
export const APP_FRAME = false;
export const PROTOCOL = 'electronapp'; // Custom app protocol handler for Electron, e.g. `app://`

// Limit the file types that can be selected using the file input dialog
export const VALID_FILETYPES = [
	'avi',
	'flv',
	'mp4',
	'm4v',
	'mov',
	'ogg',
	'ogv',
	'vob',
	'wmv',
	'mkv',
];
export const CACHE_TIMEOUT = 3600; // Seconds; 604800 = 7 days; 0 === no caching

type PlotLengthType = 'short' | 'full';
export const PLOT_LENGTH: PlotLengthType = 'full'; // Plot Summary length: "short", "full" - from omdb

/* URLs */
// export const TMDB_ENDPOINT = 'https://image.tmdb.org/t/p/';
// export const GENRE_ENDPOINT = 'http://api.themoviedb.org/3/genre/movie/list';
// export const BACKDROP_SIZE = 'w1280'; // "w300", "w780", "w1280", "original"
// export const POSTER_SIZE = 'w780'; // "w92", "w154", "w185", "w342", "w500", "w780", "original",

/* app-specific */
// -- affects how app is run and may affect performance
export const FILE_SCAN_DEPTH = 1; // How many directory levels to recursively search. 0 is a flat directory search. Higher is further down the rabbit hole === more processing time
export const THROTTLE_DELAY = 1000; // Milli-seconds delay; todo
// export const RETRY_DELAY = 4000; // Milli-seconds delay of retrying failed api requests to alieviate thousands of simultaneous requests;
export const DIRECTORY_IGNORE_PATTERN = ['private']; // A lowercase list of movie titles to ignore; ex: sample.avi
export const FILE_IGNORE_PATTERN = ['sample', 'etrg']; // A lowercase list of movie titles to ignore; ex: sample.avi
export const DEFAULT_FILE_META: Partial<MediaType> = {};

type ParseMethodType = 'regex' | 'parse';
export const PARSE_METHOD: ParseMethodType = 'parse'; // Filename parsing options: "regex", "parse"; regex is best for well-organized files lile This[2004].avi
