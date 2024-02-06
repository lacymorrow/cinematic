import { SettingsJson } from '@/renderer/components/pages/settings/SettingsJson';
import { SettingsAbout } from '@/renderer/components/pages/settings/about/SettingsAbout';
import { SettingsAppearance } from '@/renderer/components/pages/settings/appearance/SettingsAppearance';
import {
	BellIcon,
	BlendingModeIcon,
	GearIcon,
	IdCardIcon,
	ImageIcon,
	KeyboardIcon,
} from '@radix-ui/react-icons';

import { SettingsNotifications } from '@/renderer/components/pages/settings/notifications/SettingsNotifications';
import { SettingsKeyboard } from '@/renderer/components/pages/settings/keyboard/SettingsKeyboard';
import { SettingsApplication } from '@/renderer/components/pages/settings/general/SettingsApplication';

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
		title: 'General',
		href: 'general',
		element: <SettingsApplication />,
		icon: GearIcon,
	},
	{
		title: 'Appearance',
		href: 'appearance',
		element: <SettingsAppearance />,
		icon: BlendingModeIcon,
	},

	{
		title: 'Notifications',
		href: 'notifications',
		element: <SettingsNotifications />,
		icon: BellIcon,
	},
	{
		title: 'Display',
		href: 'display',
		element: <SettingsJson />,
		icon: ImageIcon,
	},
	{
		title: 'Keyboard',
		href: 'keyboard',
		element: <SettingsKeyboard />,
		icon: KeyboardIcon,
	},
	{
		title: 'About',
		href: 'about',
		element: <SettingsAbout />,
		icon: IdCardIcon,
	},
];
