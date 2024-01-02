import { LikedEmptyPlaceholder } from '../components/media/LikedEmptyPlaceholder';
import { MediaBrowser } from '../components/media/MediaBrowser';
import { useGlobalContext } from '../context/global-context';

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
