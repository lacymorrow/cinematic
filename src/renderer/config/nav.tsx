import { Library } from '@/renderer/pages/Library';
import { Browse } from '@/renderer/pages/Browse';
import { BookmarkIcon, TokensIcon, VideoIcon } from '@radix-ui/react-icons';
import { Liked } from '../pages/Liked';

export const nav = [
	{
		name: 'Watch Now',
		path: '/',
		// icon: Icons.playIcon,
		icon: <VideoIcon className="mr-2" />,
		element: <Library />,
	},
	{
		name: 'Browse',
		path: '/browse',
		icon: <TokensIcon className="mr-2" />,
		element: <Browse />,
	},
	{
		name: 'Liked',
		path: '/liked',
		icon: <BookmarkIcon className="mr-2" />,
		element: <Liked />,
	},
];
