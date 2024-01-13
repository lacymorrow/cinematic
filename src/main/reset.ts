import sound from './sounds';
import { resetStore } from './store';

export const resetApp = () => {
	// Sonic announcement
	sound.play('RESET');
	resetStore();
};
