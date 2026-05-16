import {
	TableCell,
	TableHead,
	TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ViewModeType } from '@/config/settings';
import { $media, $ui } from '@/config/strings';
import { DEBOUNCE_DELAY } from '@/renderer/config/config';
import { MediaArtwork } from '@/renderer/components/media/MediaArtwork';
import { MediaEmptyPlaceholder } from '@/renderer/components/media/MediaEmptyPlaceholder';
import { ButtonAddMedia } from '@/renderer/components/ui/ButtonAddMedia';
import { SectionHeader } from '@/renderer/components/ui/SectionHeader';
import { GridIcon, ListIcon } from '@/renderer/config/icons';
import { useGlobalContext } from '@/renderer/context/global-context';
import { MediaType } from '@/types/file';

import { BookmarkIcon, MagnifyingGlassIcon, Cross2Icon } from '@radix-ui/react-icons';
import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { VirtuosoGrid, TableVirtuoso } from 'react-virtuoso';

type Props = {
	items: MediaType[];
	title: string;
	tagline?: string;
	addMediaButton?: boolean;
	NotFound?: React.FC;
};

const CARD_WIDTH = 250;
const CARD_HEIGHT = 430; // poster (375) + text (~55)
const GRID_GAP = 24;

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
	const [searchInput, setSearchInput] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			setSearchQuery(searchInput);
		}, DEBOUNCE_DELAY);
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [searchInput]);

	const filteredItems = useMemo(() => {
		if (!searchQuery.trim()) return items;
		const q = searchQuery.toLowerCase();
		return items.filter(
			(m) =>
				m.title?.toLowerCase().includes(q) ||
				m.year?.toLowerCase().includes(q) ||
				m.plot?.toLowerCase().includes(q),
		);
	}, [items, searchQuery]);

	const handleViewChange = (value: string) => {
		setSettings({
			viewMode: value as ViewModeType,
		});
	};

	const renderGridItem = useCallback(
		(index: number) => {
			const media = filteredItems[index];
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
		[filteredItems],
	);

	// Memoize grid components to prevent re-creation
	const gridComponents = useMemo(
		() => ({
			List: GridList,
			Item: GridItem,
		}),
		[],
	);

	const isSearching = searchQuery.trim().length > 0;
	const showNoResults = isSearching && filteredItems.length === 0;

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
						<div className="relative flex items-center">
							<MagnifyingGlassIcon className="absolute left-2.5 text-muted-foreground h-4 w-4 pointer-events-none" />
							<Input
								className="pl-8 pr-8 h-9 w-48 md:w-64"
								placeholder={$ui.search.placeholder}
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
							/>
							{searchInput && (
								<button
									className="absolute right-2 text-muted-foreground hover:text-foreground"
									onClick={() => setSearchInput('')}
									aria-label="Clear search"
								>
									<Cross2Icon className="h-4 w-4" />
								</button>
							)}
						</div>
						{addMediaButton && <ButtonAddMedia />}
					</div>
					{isSearching && (
						<p className="text-sm text-muted-foreground -mt-4">
							{$ui.search.resultsCount(filteredItems.length, items.length)}
						</p>
					)}
					<SectionHeader title={title} tagline={tagline} />

					<TabsContent
						value="grid"
						className="border-none p-0 outline-none flex-1 min-h-0"
					>
						{showNoResults ? (
							<p className="text-center text-muted-foreground py-12">
								{$ui.search.noResults}
							</p>
						) : (
							<VirtuosoGrid
								totalCount={filteredItems.length}
								components={gridComponents}
								itemContent={renderGridItem}
								overscan={600}
								style={{ height: '100%' }}
							/>
						)}
					</TabsContent>
					<TabsContent
						value="list"
						className="h-full flex-col border-none p-0 data-[state=active]:flex flex-1 min-h-0"
					>
						{showNoResults ? (
							<p className="text-center text-muted-foreground py-12">
								{$ui.search.noResults}
							</p>
						) : (
							<TableVirtuoso
								data={filteredItems}
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
											<BookmarkIcon className="ml-auto" />
										</TableCell>
									</>
								)}
							/>
						)}
					</TabsContent>
				</Tabs>
			)}
		</div>
	);
}
