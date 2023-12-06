import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ScrollContainer } from '@/renderer/components/layout/ScrollContainer';
import { SectionHeader } from '@/renderer/components/layout/SectionHeader';
import { ButtonAddMedia } from '@/renderer/components/media/ButtonAddMedia';
import { MediaArtwork } from '@/renderer/components/media/MediaArtwork';
import { MediaEmptyPlaceholder } from '@/renderer/components/media/MediaEmptyPlaceholder';
import { GlobalContext } from '@/renderer/context/global-context';
import { MediaType } from '@/types/file';
import React from 'react';

type Props = {};

export function Library(_props: Props) {
	const { libraryArray, randomLibraryArray } = React.useContext(GlobalContext);

	const mostRecent = libraryArray.filter((media) => media.dateUpdated);
	return (
		<ScrollContainer>
			<SectionHeader
				title="Watch Now"
				tagline="Jump right into something new, chosen at random."
			>
				<div className="ml-auto mr-4 group">
					<ButtonAddMedia />
				</div>
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
						tagline="Start up the latest files you've added."
					/>
					<div className="relative">
						<ScrollArea>
							<div className="flex space-x-4 pb-4">
								{mostRecent.map((media) => (
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
