import { VOLUME } from '@/config/config';

/* Cache of Audio elements, for instant playback */
const cache: Record<string, HTMLAudioElement> = {};

const sounds: Record<string, { url: string; volume: number }> = {
	HERO: {
		url: 'ui-sounds/heros/hero_decorative-celebration-01.wav',
		volume: VOLUME,
	},
	STARTUP: {
		url: 'ui-sounds/alerts/notification_ambient.wav',
		volume: VOLUME,
	},
	NOTIFICATION: {
		url: 'ui-sounds/alerts/notification_simple-02.wav',
		volume: VOLUME,
	},
	UPDATE: {
		url: 'ui-sounds/alerts/alert_high-intensity.wav',
		volume: VOLUME,
	},
	LOCK: {
		url: 'ui-sounds/primary-system/ui_lock.wav',
		volume: VOLUME,
	},
	UNLOCK: {
		url: 'ui-sounds/primary-system/ui_unlock.wav',
		volume: VOLUME,
	},
	DONE: {
		url: 'ui-sounds/primary-system/navigation_selection-complete-celebration.wav',
		volume: VOLUME,
	},
	ERROR: {
		url: 'ui-sounds/secondary-system/alert_error-03.wav',
		volume: VOLUME,
	},
};

export const preload = (basepath = '') => {
	console.warn(`Preloading sounds from ${basepath}`);

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
	const sound = name.toUpperCase();
	console.info(`Playing sound: ${name}, path: ${path}`);

	let audio: HTMLAudioElement | undefined = cache[sound];
	if (!audio) {
		preload(path);
		audio = cache[sound];
	}

	if (audio) {
		audio.currentTime = 0;
		audio.play().catch(console.error);
	}
};
