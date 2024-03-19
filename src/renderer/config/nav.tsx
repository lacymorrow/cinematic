import { SettingsJson } from '@/renderer/components/pages/settings/SettingsJson';
import { SettingsAbout } from '@/renderer/components/pages/settings/about/SettingsAbout';
import { SettingsAppearance } from '@/renderer/components/pages/settings/appearance/SettingsAppearance';
import {
	BellIcon,
	BlendingModeIcon,
	BookmarkIcon,
	GearIcon,
	IdCardIcon,
	ImageIcon,
	KeyboardIcon,
	TokensIcon,
	VideoIcon,
} from '@radix-ui/react-icons';

import { SettingsApplication } from '@/renderer/components/pages/settings/general/SettingsApplication';
import { SettingsKeyboard } from '@/renderer/components/pages/settings/keyboard/SettingsKeyboard';
import { SettingsNotifications } from '@/renderer/components/pages/settings/notifications/SettingsNotifications';

import { Browse } from '@/renderer/windows/main/pages/Browse';
import { Library } from '@/renderer/windows/main/pages/Library';
import { Liked } from '@/renderer/windows/main/pages/Liked';

export const pathMedia = '/media';
export const pathPlaylists = '/playlists';
export const pathGenres = '/genres';
export const pathSettings = '/settings';

export const nav = [
	{
		id: 'watch',
		name: 'Watch Now',
		path: '/',
		icon: <VideoIcon className="mr-2" />,
		element: <Library />,
		index: true,
	},
	{
		id: 'browse',
		name: 'Browse',
		path: 'browse',
		icon: <TokensIcon className="mr-2" />,
		element: <Browse />,
	},
	{
		id: 'liked',
		name: 'Liked',
		path: 'liked',
		icon: <BookmarkIcon className="mr-2" />,
		element: <Liked />,
	},
];

export const settingsNavItems = [
	{
		title: 'General',
		href: 'general',
		element: <SettingsApplication />,
		icon: GearIcon,
		index: true,
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
