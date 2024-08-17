// todo: list view of media (vs grid view)
// todo: no items placeholder
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ViewModeType } from '@/config/settings';
import { $media, $ui } from '@/config/strings';
import { MediaArtwork } from '@/renderer/components/media/MediaArtwork';
import { MediaEmptyPlaceholder } from '@/renderer/components/media/MediaEmptyPlaceholder';
import { ButtonAddMedia } from '@/renderer/components/ui/ButtonAddMedia';
import { ScrollContainer } from '@/renderer/components/ui/ScrollContainer';
import { SectionHeader } from '@/renderer/components/ui/SectionHeader';
import { GridIcon, ListIcon } from '@/renderer/config/icons';
import { useGlobalContext } from '@/renderer/context/global-context';
import { MediaType } from '@/types/file';
import { getUUID } from '@/utils/getUUID';

import { BookmarkIcon } from '@radix-ui/react-icons';
import React from 'react';

type Props = {
	items: MediaType[];
	title: string;
	tagline?: string;
	addMediaButton?: boolean;
	NotFound?: React.FC;
};

export function MediaBrowser({
	items,
	title,
	tagline,
	addMediaButton = true,
	NotFound = MediaEmptyPlaceholder,
}: Props) {
	const { settings, setSettings } = useGlobalContext();

	const handleViewChange = (value: string) => {
		setSettings({
			viewMode: value as ViewModeType,
		});
	};
	return (
		<ScrollContainer>
			{items?.length === 0 ? (
				<>
					<SectionHeader
						title={title}
						tagline={tagline}
						className="flex items-start flex-col-reverse md:flex-row md:items-start justify-between gap-4"
					>
						{addMediaButton && <ButtonAddMedia />}
					</SectionHeader>
					<NotFound />
				</>
			) : (
				<Tabs
					defaultValue={settings.viewMode}
					className="space-y-6 h-full min-h-0 flex flex-col"
					onValueChange={handleViewChange}
				>
					<div className="flex items-start flex-col-reverse md:flex-row md:items-start justify-between gap-4 select-none">
						<TabsList className="grow-0">
							<TabsTrigger value="grid" className="relative flex gap-2">
								<GridIcon /> {$ui.view.grid}
							</TabsTrigger>
							<TabsTrigger value="list" className="flex gap-2">
								<ListIcon />
								{$ui.view.list}
							</TabsTrigger>
						</TabsList>
						<div className="group">
							<ButtonAddMedia />
						</div>
					</div>
					<SectionHeader title={title} tagline={tagline} />

					<TabsContent value="grid" className="border-none p-0 outline-none">
						<div className="flex gap-6 pb-6 flex-wrap">
							{items?.map((media: MediaType) => (
								<MediaArtwork
									key={getUUID()}
									media={media}
									className="w-[250px]"
									aspectRatio="portrait"
									width={250}
									height={375}
								/>
							))}
						</div>
					</TabsContent>
					<TabsContent
						value="list"
						className="h-full flex-col border-none p-0 data-[state=active]:flex"
					>
						<Table>
							<TableCaption>{tagline}</TableCaption>
							<TableHeader>
								<TableRow>
									<TableHead className="">{$media.title}</TableHead>
									<TableHead>{$media.released}</TableHead>
									<TableHead>{$media.runtime}</TableHead>
									<TableHead className="text-right">
										{$ui.liked.liked}
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{items?.map((media: MediaType) => (
									<TableRow key={media.id}>
										<TableCell className="font-medium">{media.title}</TableCell>
										<TableCell>{media.year}</TableCell>
										<TableCell>{media.runtime}</TableCell>
										<TableCell>
											<BookmarkIcon className="ml-auto" />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TabsContent>
				</Tabs>
			)}
		</ScrollContainer>
	);
}
