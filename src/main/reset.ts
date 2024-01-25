import sound from './sounds';
import { resetStore } from './store-actions';

export const resetApp = () => {
	// Sonic announcement
	sound.play('RESET');
	resetStore();
};
