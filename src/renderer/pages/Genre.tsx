import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { MediaType } from '@/types/file';
import { GlobalContext } from '../context/global-context';
import { MediaBrowser } from '../components/media/MediaBrowser';

type Props = {};

export function Genre(_props: Props) {
	const { id }: { id?: string } = useParams();
	const { genres, libraryArray } = React.useContext(GlobalContext);

	const [mediaArray, title] = useMemo(() => {
		// todo: something else
		if (!id) {
			return [[], 'Genre'];
		}
		return [
			libraryArray.filter((e: MediaType) => genres[id].values.includes(e.id)),
			genres[id].name,
		];
	}, [id, genres, libraryArray]);

	return (
		<MediaBrowser
			items={mediaArray}
			title={title}
			tagline={`Showing all media tagged ${title}.`}
			addMediaButton={false}
		/>
	);
}
