import { VOLUME } from '@/renderer/config/config';
import Logger from 'electron-log/renderer';

/* Cache of Audio elements, for instant playback */
const cache: Record<string, HTMLAudioElement> = {};

const sounds: Record<string, { url: string; volume: number }> = {
	HERO: {
		url: 'hero_decorative-celebration-01.wav',
		volume: VOLUME,
	},
	NOTIFICATION: {
		url: 'notification_simple-02.wav',
		volume: VOLUME,
	},
	ERROR: {
		url: 'alert_error-03.wav',
		volume: VOLUME,
	},
	UPDATE: {
		url: 'alert_high-intensity.wav',
		volume: VOLUME,
	},
	LOCK: {
		url: 'ui_lock.wav',
		volume: VOLUME,
	},
	UNLOCK: {
		url: 'ui_unlock.wav',
		volume: VOLUME,
	},
	STARTUP: {
		url: 'notification_ambient.wav',
		volume: VOLUME,
	},
	DONE: {
		url: 'navigation_selection-complete-celebration.wav',
		volume: VOLUME,
	},
};

export const preload = (basepath = '') => {
	Logger.warn(`Preloading sounds from ${basepath}`);

	let audio: HTMLAudioElement | undefined;
	Object.keys(sounds).forEach((name) => {
		if (!cache[name]) {
			cache[name] = new window.Audio();

			const sound = sounds[name];
			audio = cache[name];
			audio.volume = sound.volume;
			audio.src = `file://${basepath}${sound.url}`; // this requires web security to be disabled
		}
	});

	return audio;
};

export const play = ({ name, path }: { name: string; path: string }) => {
	Logger.info(`Playing sound: ${name}, path: ${path}`);

	let audio: HTMLAudioElement | undefined = cache[name];
	if (!audio) {
		audio = preload(path);
	}

	if (audio) {
		audio.currentTime = 0;
		audio.play().catch((err) => {
			Logger.error(err);
		});
	}
};
