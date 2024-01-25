import { KeyboardShortcut } from '@/types/keyboard';
import { app } from 'electron';
import { resetApp } from './reset';

export const keyboardShortcuts: KeyboardShortcut[] = [
	/* Default accelerators */

	// Quit
	{
		action: 'quit',
		fn() {
			app.quit();
		},
	},

	// Reset App
	{
		action: 'reset',
		fn() {
			resetApp();
		},
	},
];
