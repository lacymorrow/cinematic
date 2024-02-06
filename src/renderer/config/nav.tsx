import { SettingsJson } from '@/renderer/windows/main/pages/settings/SettingsJson';
import { SettingsAbout } from '@/renderer/windows/main/pages/settings/about/SettingsAbout';
import { SettingsAppearance } from '@/renderer/windows/main/pages/settings/appearance/SettingsAppearance';
import {
	BellIcon,
	BlendingModeIcon,
	GearIcon,
	IdCardIcon,
	ImageIcon,
	KeyboardIcon,
} from '@radix-ui/react-icons';
import { SettingsGeneral } from '../windows/main/pages/settings/general/SettingsGeneral';
import { SettingsNotifications } from '../windows/main/pages/settings/notifications/SettingsNotifications';
import { SettingsKeyboard } from '../windows/main/pages/settings/keyboard/SettingsKeyboard';

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
		element: <SettingsGeneral />,
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
