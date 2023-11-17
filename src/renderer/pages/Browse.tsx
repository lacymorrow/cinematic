import React from 'react';
import { GlobalContext } from '../context/global-context';
import { MediaBrowser } from '../components/media/MediaBrowser';

type Props = {};

export function Browse(_props: Props) {
  const { libraryArray } = React.useContext(GlobalContext);

  const mediaArray = [...libraryArray, ...libraryArray, ...libraryArray];

  return (
    <MediaBrowser
      items={mediaArray}
      title="Browse"
      tagline="Viewing all media files in your library."
    />
  );
}
