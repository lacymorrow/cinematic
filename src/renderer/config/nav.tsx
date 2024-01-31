import { SettingsJson } from '@/renderer/windows/main/pages/settings/SettingsJson';
import { SettingsAbout } from '@/renderer/windows/main/pages/settings/about/SettingsAbout';
import { SettingsAppearance } from '@/renderer/windows/main/pages/settings/appearance/SettingsAppearance';
import { SettingsNotifications } from '../windows/main/pages/settings/notifications/SettingsNotifications';

export const nav = {
	home: {
		title: 'Home',
		href: '/',
	},
	settings: {
		title: 'Settings',
		href: '/settings',
	},
};

export const settingsNavItems = [
	{
		title: 'Appearance',
		href: 'appearance',
		element: <SettingsAppearance />,
	},
	{
		title: 'Notifications',
		href: 'notifications',
		element: <SettingsNotifications />,
	},
	{
		title: 'Display',
		href: 'display',
		element: <SettingsJson />,
	},
	{
		title: 'About',
		href: 'about',
		element: <SettingsAbout />,
	},
];
