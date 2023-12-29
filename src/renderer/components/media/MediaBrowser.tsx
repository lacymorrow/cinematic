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
import { ViewModeType } from '@/main/store';
import { MediaArtwork } from '@/renderer/components/media/MediaArtwork';
import { MediaEmptyPlaceholder } from '@/renderer/components/media/MediaEmptyPlaceholder';
import { useGlobalContext } from '@/renderer/context/global-context';
import { MediaType } from '@/types/file';
import {
	BookmarkIcon,
	DashboardIcon,
	ListBulletIcon,
} from '@radix-ui/react-icons';
import React from 'react';
import { ButtonAddMedia } from '../ui/ButtonAddMedia';
import { ScrollContainer } from '../ui/ScrollContainer';
import { SectionHeader } from '../ui/SectionHeader';

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
			{items.length === 0 ? (
				<>
					<SectionHeader
						title={title}
						tagline={tagline}
						className="flex items-start flex-col-reverse md:flex-row md:items-center justify-between gap-4"
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
					<div className="flex items-start flex-col-reverse md:flex-row md:items-center justify-between gap-4 select-none">
						<TabsList className="grow-0">
							<TabsTrigger value="grid" className="relative">
								<DashboardIcon className="mr-2" /> Grid
							</TabsTrigger>
							<TabsTrigger value="list">
								<ListBulletIcon className="mr-2" />
								List
							</TabsTrigger>
						</TabsList>
						<div className="group">
							<ButtonAddMedia />
						</div>
					</div>
					<SectionHeader title={title} tagline={tagline} />

					<TabsContent value="grid" className="border-none p-0 outline-none">
						<div className="flex gap-6 pb-6 flex-wrap">
							{items.map((media: MediaType) => (
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
					</TabsContent>
					<TabsContent
						value="list"
						className="h-full flex-col border-none p-0 data-[state=active]:flex"
					>
						<Table>
							<TableCaption>{tagline}</TableCaption>
							<TableHeader>
								<TableRow>
									<TableHead className="">Title</TableHead>
									<TableHead>Released</TableHead>
									<TableHead>Runtime</TableHead>
									<TableHead className="text-right">Amount</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{items.map((media: MediaType) => (
									<TableRow key={media.id}>
										<TableCell className="font-medium">{media.title}</TableCell>
										<TableCell>{media.year}</TableCell>
										<TableCell>{media.runtime}</TableCell>
										<TableCell className="text-right">
											<BookmarkIcon />
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
