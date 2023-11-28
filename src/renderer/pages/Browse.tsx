import React from 'react';
import { MediaBrowser } from '../components/media/MediaBrowser';
import { GlobalContext } from '../context/global-context';

type Props = {};

export function Browse(_props: Props) {
  const { libraryArray } = React.useContext(GlobalContext);

  const mediaArray = [...libraryArray, ...libraryArray, ...libraryArray];

  return (
    <MediaBrowser
      items={libraryArray}
      title="Browse"
      tagline="Viewing all media files in your library."
    />
  );
}
