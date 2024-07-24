import { MediaBrowser } from '@/renderer/components/media/MediaBrowser';
import { useLibraryContext } from '@/renderer/context/library-context';

type Props = {};

export function Browse(_props: Props) {
	const { libraryArray } = useLibraryContext();

	return (
		<MediaBrowser
			items={libraryArray}
			title="Browse"
			tagline="Viewing all media files in your library."
		/>
	);
}
