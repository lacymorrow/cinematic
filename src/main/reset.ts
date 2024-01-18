import sounds from './sounds';
import { resetStore } from './store';

export const resetApp = () => {
	// Sonic announcement
	sounds.play('RESET');
	resetStore();
};
