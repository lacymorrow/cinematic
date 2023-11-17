import React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { MediaArtwork } from '@/renderer/components/media/MediaArtwork';
import { MediaType } from '@/types/file';
import { GlobalContext } from '../context/global-context';
import { SectionHeader } from '../components/layout/SectionHeader';
import { ScrollContainer } from '../components/layout/ScrollContainer';
import { ButtonAddMedia } from '../components/media/ButtonAddMedia';
import { MediaEmptyPlaceholder } from '../components/media/MediaEmptyPlaceholder';

type Props = {};

export function Library(_props: Props) {
  const { libraryArray, randomLibraryArray } = React.useContext(GlobalContext);
  return (
    <ScrollContainer>
      <SectionHeader
        title="Watch Now"
        tagline="Jump right into something new, chosen at random."
      >
        <ButtonAddMedia />
      </SectionHeader>
      {libraryArray.length === 0 ? (
        <MediaEmptyPlaceholder />
      ) : (
        <div>
          <div className="relative">
            <ScrollArea>
              <div className="flex space-x-4 pb-4">
                {randomLibraryArray.map((media: MediaType) => (
                  <MediaArtwork
                    key={crypto.randomUUID()}
                    media={media}
                    className="w-[250px]"
                    aspectRatio="portrait"
                    width={250}
                    height={375}
                  />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
          <SectionHeader
            title="Recently Added"
            tagline="Pick up right where you left off."
          />
          <div className="relative">
            <ScrollArea>
              <div className="flex space-x-4 pb-4">
                {libraryArray.map((media) => (
                  <MediaArtwork
                    key={media.id}
                    media={media}
                    className="w-[150px]"
                    aspectRatio="square"
                    width={150}
                    height={150}
                  />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      )}
    </ScrollContainer>
  );
}
