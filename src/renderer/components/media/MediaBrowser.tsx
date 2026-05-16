import {
	TableCell,
	TableHead,
	TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Toggle } from '@/renderer/components/ui/toggle';
import { ViewModeType } from '@/config/settings';
import { $media, $ui } from '@/config/strings';
import { MediaArtwork } from '@/renderer/components/media/MediaArtwork';
import { MediaEmptyPlaceholder } from '@/renderer/components/media/MediaEmptyPlaceholder';
import { ButtonAddMedia } from '@/renderer/components/ui/ButtonAddMedia';
import { SectionHeader } from '@/renderer/components/ui/SectionHeader';
import { GridIcon, ListIcon } from '@/renderer/config/icons';
import { useGlobalContext } from '@/renderer/context/global-context';
import { MediaType } from '@/types/file';

import { BookmarkFilledIcon, BookmarkIcon } from '@radix-ui/react-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { VirtuosoGrid, TableVirtuoso } from 'react-virtuoso';

type SortKey =
	| 'title-asc'
	| 'title-desc'
	| 'year-desc'
	| 'year-asc'
	| 'runtime-desc'
	| 'runtime-asc'
	| 'date-added-desc'
	| 'date-added-asc';

type Props = {
	items: MediaType[];
	title: string;
	tagline?: string;
	addMediaButton?: boolean;
	NotFound?: React.FC;
};

const CARD_WIDTH = 250;
const GRID_GAP = 24;

const parseRuntime = (runtime: string | undefined): number => {
	if (!runtime) return 0;
	const match = runtime.match(/(\d+)/);
	return match ? parseInt(match[1], 10) : 0;
};

const parseYear = (year: string | undefined): number => {
	if (!year) return 0;
	const match = year.match(/(\d{4})/);
	return match ? parseInt(match[1], 10) : 0;
};

function sortItems(items: MediaType[], sortKey: SortKey): MediaType[] {
	return [...items].sort((a, b) => {
		switch (sortKey) {
			case 'title-asc':
				return (a.title ?? '').localeCompare(b.title ?? '');
			case 'title-desc':
				return (b.title ?? '').localeCompare(a.title ?? '');
			case 'year-desc':
				return parseYear(b.year) - parseYear(a.year);
			case 'year-asc':
				return parseYear(a.year) - parseYear(b.year);
			case 'runtime-desc':
				return parseRuntime(b.runtime) - parseRuntime(a.runtime);
			case 'runtime-asc':
				return parseRuntime(a.runtime) - parseRuntime(b.runtime);
			case 'date-added-desc':
				return (b.dateAdded ?? 0) - (a.dateAdded ?? 0);
			case 'date-added-asc':
				return (a.dateAdded ?? 0) - (b.dateAdded ?? 0);
			default:
				return 0;
		}
	});
}

// Custom grid components for VirtuosoGrid
const GridList = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ children, style, ...props }, ref) => (
	<div
		ref={ref}
		{...props}
		style={{
			...style,
			display: 'flex',
			flexWrap: 'wrap',
			gap: GRID_GAP,
			paddingBottom: GRID_GAP,
		}}
	/>
));
GridList.displayName = 'GridList';

const GridItem: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
	children,
	...props
}) => (
	<div {...props} style={{ width: CARD_WIDTH }}>
		{children}
	</div>
);

export function MediaBrowser({
	items,
	title,
	tagline,
	addMediaButton = true,
	NotFound = MediaEmptyPlaceholder,
}: Props) {
	const { settings, setSettings } = useGlobalContext();
	const [sortKey, setSortKey] = useState<SortKey>('title-asc');
	const [likedOnly, setLikedOnly] = useState(false);

	const handleViewChange = (value: string) => {
		setSettings({
			viewMode: value as ViewModeType,
		});
	};

	const processedItems = useMemo(() => {
		const filtered = likedOnly ? items.filter((m) => m.liked) : items;
		return sortItems(filtered, sortKey);
	}, [items, sortKey, likedOnly]);

	const renderGridItem = useCallback(
		(index: number) => {
			const media = processedItems[index];
			if (!media) return null;
			return (
				<MediaArtwork
					media={media}
					className="w-[250px]"
					aspectRatio="portrait"
					width={250}
					height={375}
				/>
			);
		},
		[processedItems],
	);

	// Memoize grid components to prevent re-creation
	const gridComponents = useMemo(
		() => ({
			List: GridList,
			Item: GridItem,
		}),
		[],
	);

	return (
		<div className="h-full flex flex-col p-6">
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
					<div className="flex items-center flex-col-reverse md:flex-row justify-between gap-4 select-none flex-wrap">
						<TabsList className="grow-0">
							<TabsTrigger value="grid" className="relative flex gap-2">
								<GridIcon /> {$ui.view.grid}
							</TabsTrigger>
							<TabsTrigger value="list" className="flex gap-2">
								<ListIcon />
								{$ui.view.list}
							</TabsTrigger>
						</TabsList>
						<div className="flex items-center gap-2 ml-auto">
							<Toggle
								size="sm"
								pressed={likedOnly}
								onPressedChange={setLikedOnly}
								aria-label={$ui.filter.likedOnly}
								title={$ui.filter.likedOnly}
							>
								{likedOnly ? (
									<BookmarkFilledIcon className="h-4 w-4" />
								) : (
									<BookmarkIcon className="h-4 w-4" />
								)}
							</Toggle>
							<Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
								<SelectTrigger className="h-9 w-44 text-sm">
									<SelectValue placeholder={$ui.sort.label} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="title-asc">{$ui.sort.titleAsc}</SelectItem>
									<SelectItem value="title-desc">{$ui.sort.titleDesc}</SelectItem>
									<SelectItem value="year-desc">{$ui.sort.yearDesc}</SelectItem>
									<SelectItem value="year-asc">{$ui.sort.yearAsc}</SelectItem>
									<SelectItem value="runtime-desc">{$ui.sort.runtimeDesc}</SelectItem>
									<SelectItem value="runtime-asc">{$ui.sort.runtimeAsc}</SelectItem>
									<SelectItem value="date-added-desc">{$ui.sort.dateAddedDesc}</SelectItem>
									<SelectItem value="date-added-asc">{$ui.sort.dateAddedAsc}</SelectItem>
								</SelectContent>
							</Select>
							{addMediaButton && <ButtonAddMedia />}
						</div>
					</div>
					<SectionHeader title={title} tagline={tagline} />

					<TabsContent
						value="grid"
						className="border-none p-0 outline-none flex-1 min-h-0"
					>
						<VirtuosoGrid
							totalCount={processedItems.length}
							components={gridComponents}
							itemContent={renderGridItem}
							overscan={600}
							style={{ height: '100%' }}
						/>
					</TabsContent>
					<TabsContent
						value="list"
						className="h-full flex-col border-none p-0 data-[state=active]:flex flex-1 min-h-0"
					>
						<TableVirtuoso
							data={processedItems}
							style={{ height: '100%' }}
							overscan={200}
							fixedHeaderContent={() => (
								<TableRow>
									<TableHead className="">{$media.title}</TableHead>
									<TableHead>{$media.released}</TableHead>
									<TableHead>{$media.runtime}</TableHead>
									<TableHead className="text-right">
										{$ui.liked.liked}
									</TableHead>
								</TableRow>
							)}
							itemContent={(_index, media) => (
								<>
									<TableCell className="font-medium">{media.title}</TableCell>
									<TableCell>{media.year}</TableCell>
									<TableCell>{media.runtime}</TableCell>
									<TableCell>
										{media.liked ? (
											<BookmarkFilledIcon className="ml-auto" />
										) : (
											<BookmarkIcon className="ml-auto" />
										)}
									</TableCell>
								</>
							)}
						/>
					</TabsContent>
				</Tabs>
			)}
		</div>
	);
}
