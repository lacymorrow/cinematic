import { LikedEmptyPlaceholder } from '@/renderer/components/media/LikedEmptyPlaceholder';
import { MediaBrowser } from '@/renderer/components/media/MediaBrowser';
import { useGlobalContext } from '@/renderer/context/global-context';

type Props = {};

export function Liked(_props: Props) {
	const { liked } = useGlobalContext();

	return (
		<MediaBrowser
			items={liked}
			title="Liked Media"
			tagline="Showing the best of the best, the things you liked most."
			NotFound={LikedEmptyPlaceholder}
			addMediaButton={false}
		/>
	);
}
