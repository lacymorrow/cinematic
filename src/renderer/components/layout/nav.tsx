import { Browse } from '@/renderer/windows/main/pages/Browse';
import { Library } from '@/renderer/windows/main/pages/Library';
import { Liked } from '@/renderer/windows/main/pages/Liked';
import { BookmarkIcon, TokensIcon, VideoIcon } from '@radix-ui/react-icons';

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
		path: '/browse',
		icon: <TokensIcon className="mr-2" />,
		element: <Browse />,
	},
	{
		id: 'liked',
		name: 'Liked',
		path: '/liked',
		icon: <BookmarkIcon className="mr-2" />,
		element: <Liked />,
	},
];
