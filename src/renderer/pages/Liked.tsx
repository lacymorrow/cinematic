import React from 'react';
import { GlobalContext } from '../context/global-context';
import { MediaBrowser } from '../components/media/MediaBrowser';
import { LikedEmptyPlaceholder } from '../components/media/LikedEmptyPlaceholder';

type Props = {};

export function Liked(_props: Props) {
  const { liked } = React.useContext(GlobalContext);

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
