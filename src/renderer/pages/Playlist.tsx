import { MediaType } from '@/types/file';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { MediaBrowser } from '../components/media/MediaBrowser';
import { useGlobalContext } from '../context/global-context';

type Props = {};

export function Playlist(_props: Props) {
	const { id }: { id?: string } = useParams();
	const { playlists, libraryArray } = useGlobalContext();

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
