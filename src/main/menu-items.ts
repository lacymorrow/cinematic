import { app } from 'electron';
import { notification } from './notifications';
import sounds from './sounds';
import { getSetting } from './store';

// Menu items for the main process menu, dock menu, tray menu, and context menu
export const quitMenuItem: any = { role: 'quit' };

export const aboutMenuItem: any = {
	label: `About ${app.name}`,
	selector: 'orderFrontStandardAboutPanel:',
	id: 'about',
	accelerator: 'CommandOrControl+Z',
};

export const autoUpdateMenuItem: any = {
	label: 'Auto Update',
	type: 'checkbox',
	id: 'autoUpdate',
	enabled: false,
	checked: !!getSetting('autoUpdate'),
};

export const testNotificationMenuItem: any = {
	label: 'Test Notification',
	id: 'testNotification',
	click: () => {
		notification({
			title: 'Test Notification',
			body: 'This is a test notification',
		});
	},
};

export const testSoundMenuItem: any = {
	label: 'Test Sound',
	id: 'testSound',
	click: () => {
		sounds.play('UPDATE');
	},
};
