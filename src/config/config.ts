// Constants

// App width/height MUST BE EVEN for followMouse to work
// 16/10: 125x200 16/9: 126x224
export const APP_HEIGHT = 130;
export const APP_WIDTH = 208;
// 16/10: 220x352 16/9: 224x356

export const ALERT_URL =
	'https://raw.githubusercontent.com/lacymorrow/crossover/master/CROSSOVER_ALERT';
export const APP_ASPECT_RATIO = 16 / 10;
export const APP_BACKGROUND_OPACITY = 0.6;

export const PROTOCOL = 'electronapp'; // Custom app protocol handler for Electron, e.g. `app://`

export const VOLUME = 0.15; // System volume in percent

// Debounce delay in ms
export const DEBOUNCE_DELAY = 400;

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
