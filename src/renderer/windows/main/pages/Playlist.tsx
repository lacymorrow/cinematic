import { MediaBrowser } from '@/renderer/components/media/MediaBrowser';
import { useLibraryContext } from '@/renderer/context/library-context';
import { MediaType } from '@/types/file';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

type Props = {};

export function Playlist(_props: Props) {
	const { id }: { id?: string } = useParams();
	const { playlists, libraryArray } = useLibraryContext();

	// I don't know why but i felt like using a spread array here
	const [mediaArray, title] = useMemo(() => {
		// todo: something else, this shouldn't happen, probably should check  playlists[id]
		if (!id) {
			return [[], 'Playlist'];
		}
		return [
			libraryArray.filter((e: MediaType) =>
				playlists[id].values.includes(e.id),
			),
			playlists[id].name,
		];
	}, [id, playlists, libraryArray]);

	return (
		<MediaBrowser
			items={mediaArray}
			title={title}
			tagline={`Showing all media in ${title}.`}
		/>
	);
}
