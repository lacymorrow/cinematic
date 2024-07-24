import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { MediaArtwork } from '@/renderer/components/media/MediaArtwork';
import { MediaEmptyPlaceholder } from '@/renderer/components/media/MediaEmptyPlaceholder';
import { ButtonAddMedia } from '@/renderer/components/ui/ButtonAddMedia';
import { ScrollContainer } from '@/renderer/components/ui/ScrollContainer';
import { SectionHeader } from '@/renderer/components/ui/SectionHeader';
import { useLibraryContext } from '@/renderer/context/library-context';
import { MediaType } from '@/types/file';

type Props = {};

export function Library(_props: Props) {
	const { libraryArray, randomLibraryArray } = useLibraryContext();

	const mostRecent = libraryArray.filter((media) => media.dateUpdated);
	return (
		<ScrollContainer>
			<SectionHeader
				title="Watch Now"
				tagline="Jump right into something new, chosen at random."
				className="flex-col-reverse md:flex-row md:items-start justify-between gap-4"
			>
				<ButtonAddMedia />
			</SectionHeader>
			{libraryArray.length === 0 ? (
				<MediaEmptyPlaceholder />
			) : (
				<div className="">
					<div className="relative mb-4 select-none">
						<ScrollArea>
							<div className="flex space-x-4 pb-4">
								{libraryArray.map((media: MediaType) => (
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
					<div className="relative select-none">
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
