import { MediaBrowser } from '../components/media/MediaBrowser';
import { useGlobalContext } from '../context/global-context';

type Props = {};

export function Browse(_props: Props) {
	const { libraryArray } = useGlobalContext();

	return (
		<MediaBrowser
			items={libraryArray}
			title="Browse"
			tagline="Viewing all media files in your library."
		/>
	);
}
