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
import { Input } from '@/components/ui/input';
import { Toggle } from '@/renderer/components/ui/toggle';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { DialogContentNewPlaylist } from '@/renderer/components/dialog/DialogContentNewPlaylist';
import { POSTER_SIZES, ViewModeType } from '@/config/settings';
import { $media, $ui } from '@/config/strings';
import { DEBOUNCE_DELAY } from '@/renderer/config/config';
import { MediaArtwork } from '@/renderer/components/media/MediaArtwork';
import { MediaEmptyPlaceholder } from '@/renderer/components/media/MediaEmptyPlaceholder';
import { ButtonAddMedia } from '@/renderer/components/ui/ButtonAddMedia';
import { SectionHeader } from '@/renderer/components/ui/SectionHeader';
import { GridIcon, LikedIcon, ListIcon } from '@/renderer/config/icons';
import { useGlobalContext } from '@/renderer/context/global-context';
import { useLibraryContext } from '@/renderer/context/library-context';
import { MediaType } from '@/types/file';

import { BookmarkFilledIcon, BookmarkIcon, CheckIcon, Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export function MediaBrowser({
	items,
	title,
	tagline,
	addMediaButton = true,
	NotFound = MediaEmptyPlaceholder,
}: Props) {
	const { settings, setSettings } = useGlobalContext();
	const { selectedMediaIds, toggleMediaSelection, clearSelection } = useLibraryContext();
	const navigate = useNavigate();
	const posterSize = POSTER_SIZES[settings.thumbnailSize] ?? POSTER_SIZES.large;
	const [sortKey, setSortKey] = useState<SortKey>('title-asc');
	const [likedOnly, setLikedOnly] = useState(false);
	const [searchInput, setSearchInput] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [playlistDialogMediaId, setPlaylistDialogMediaId] = useState<string | null>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastSelectedIndexRef = useRef<number>(-1);

	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			setSearchQuery(searchInput);
		}, DEBOUNCE_DELAY);
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [searchInput]);

	// Clear selection on Escape
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && selectedMediaIds.size > 0) {
				clearSelection();
			}
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [selectedMediaIds.size, clearSelection]);

	const handleViewChange = (value: string) => {
		setSettings({
			viewMode: value as ViewModeType,
		});
	};

	// Search → liked filter → sort pipeline
	const processedItems = useMemo(() => {
		let result = items;
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			result = result.filter(
				(m) =>
					m.title?.toLowerCase().includes(q) ||
					m.year?.toLowerCase().includes(q) ||
					m.plot?.toLowerCase().includes(q),
			);
		}
		if (likedOnly) {
			result = result.filter((m) => m.liked);
		}
		return sortItems(result, sortKey);
	}, [items, searchQuery, likedOnly, sortKey]);

	const handleSelect = useCallback(
		(id: string, event: React.MouseEvent) => {
			const index = processedItems.findIndex((m) => m.id === id);
			if (event.shiftKey && lastSelectedIndexRef.current >= 0) {
				const start = Math.min(lastSelectedIndexRef.current, index);
				const end = Math.max(lastSelectedIndexRef.current, index);
				const rangeIds = processedItems.slice(start, end + 1).map((m) => m.id);
				toggleMediaSelection(id, rangeIds);
			} else {
				toggleMediaSelection(id);
				lastSelectedIndexRef.current = index;
			}
		},
		[processedItems, toggleMediaSelection],
	);

	const handleBatchLike = useCallback(() => {
		selectedMediaIds.forEach((id) => {
			const media = items.find((m) => m.id === id);
			if (media) window.electron.setMediaLike(id, !media.liked);
		});
	}, [selectedMediaIds, items]);

	const handleBatchAddToPlaylist = useCallback(() => {
		const firstId = Array.from(selectedMediaIds)[0];
		if (firstId) setPlaylistDialogMediaId(firstId);
	}, [selectedMediaIds]);

	const handleBatchRemove = useCallback(() => {
		selectedMediaIds.forEach((id) => {
			window.electron.removeFromLibrary(id);
		});
		clearSelection();
	}, [selectedMediaIds, clearSelection]);

	const handleBatchOpen = useCallback(() => {
		selectedMediaIds.forEach((id) => {
			const media = items.find((m) => m.id === id);
			if (media?.filepath) window.electron.openPath(media.filepath);
		});
	}, [selectedMediaIds, items]);

	const handleBatchPlaylistConfirm = useCallback(
		(playlistName: string) => {
			selectedMediaIds.forEach((id) => {
				window.electron.addToPlaylist(id, playlistName);
			});
			setPlaylistDialogMediaId(null);
		},
		[selectedMediaIds],
	);

	const renderGridItem = useCallback(
		(index: number) => {
			const media = processedItems[index];
			if (!media) return null;
			return (
				<MediaArtwork
					media={media}
					aspectRatio="portrait"
					width={posterSize.width}
					height={posterSize.height}
					isSelected={selectedMediaIds.has(media.id)}
					onMediaSelect={handleSelect}
				/>
			);
		},
		[processedItems, selectedMediaIds, handleSelect, posterSize],
	);

	const GridItem = useMemo(
		() =>
			function GridItemInner({
				children,
				...props
			}: React.HTMLAttributes<HTMLDivElement>) {
				return (
					<div {...props} style={{ width: posterSize.width }}>
						{children}
					</div>
				);
			},
		[posterSize.width],
	);

	// Memoize grid components to prevent re-creation
	const gridComponents = useMemo(
		() => ({
			List: GridList,
			Item: GridItem,
		}),
		[GridItem],
	);

	// Clickable row component for the list view
	const listTableRow = useMemo(() => {
		const Row = ({
			item,
			...props
		}: {
			item?: MediaType;
			[key: string]: unknown;
		}) => (
			<TableRow
				{...(props as React.HTMLAttributes<HTMLTableRowElement>)}
				className="cursor-pointer"
				onClick={() => item && navigate(`/media/${item.id}`)}
			/>
		);
		Row.displayName = 'ListTableRow';
		return Row;
	}, [navigate]);

	const isSearching = searchQuery.trim().length > 0;
	const showNoResults = processedItems.length === 0 && (isSearching || likedOnly);

	return (
		<div className="h-full flex flex-col p-6 relative">
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
										type="button"
										className="absolute right-2 text-muted-foreground hover:text-foreground"
										onClick={() => setSearchInput('')}
										aria-label="Clear search"
									>
										<Cross2Icon className="h-4 w-4" />
									</button>
								)}
							</div>
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
					{isSearching && (
						<p className="text-sm text-muted-foreground -mt-4">
							{$ui.search.resultsCount(processedItems.length, items.length)}
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
								totalCount={processedItems.length}
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
								data={processedItems}
								style={{ height: '100%' }}
								overscan={200}
								components={{
									TableRow: listTableRow as React.ComponentType<any>,
								}}
								fixedHeaderContent={() => (
									<TableRow>
										<TableHead className="w-10" />
										<TableHead className="w-16"></TableHead>
										<TableHead>{$media.title}</TableHead>
										<TableHead>{$media.released}</TableHead>
										<TableHead>{$media.runtime}</TableHead>
										<TableHead>{$media.rating}</TableHead>
										<TableHead className="w-16 text-right">
											{$ui.liked.liked}
										</TableHead>
									</TableRow>
								)}
								itemContent={(_index, media) => (
									<>
										<TableCell className="w-10">
											<button
												type="button"
												onClick={(e) => handleSelect(media.id, e)}
												className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
													selectedMediaIds.has(media.id)
														? 'bg-primary border-primary'
														: 'border-muted-foreground hover:border-foreground'
												}`}
												aria-label={selectedMediaIds.has(media.id) ? 'Deselect' : 'Select'}
											>
												{selectedMediaIds.has(media.id) && (
													<CheckIcon className="w-3 h-3 text-primary-foreground" />
												)}
											</button>
										</TableCell>
										<TableCell className="w-16 p-1 pl-4">
											{media.poster ? (
												<img
													src={media.poster}
													alt={media.title}
													width={36}
													height={54}
													loading="lazy"
													decoding="async"
													className="rounded object-cover w-9 h-[54px]"
												/>
											) : (
												<div className="w-9 h-[54px] rounded bg-muted" />
											)}
										</TableCell>
										<TableCell className="font-medium">
											{media.title || media.prettyFileName}
										</TableCell>
										<TableCell>{media.year}</TableCell>
										<TableCell>{media.runtime}</TableCell>
										<TableCell>{media.rating}</TableCell>
										<TableCell className="text-right">
											{media.liked && <LikedIcon className="ml-auto" />}
										</TableCell>
									</>
								)}
							/>
						)}
					</TabsContent>
				</Tabs>
			)}

			{/* Floating selection toolbar */}
			{selectedMediaIds.size > 0 && (
				<div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-popover border shadow-lg text-sm font-medium">
					<span className="text-muted-foreground pr-2">
						{selectedMediaIds.size} selected
					</span>
					<button
						type="button"
						onClick={handleBatchLike}
						className="px-3 py-1 rounded-full hover:bg-muted transition-colors"
					>
						Like
					</button>
					<Dialog
						open={playlistDialogMediaId !== null}
						onOpenChange={(open) => !open && setPlaylistDialogMediaId(null)}
					>
						<DialogTrigger asChild>
							<button
								type="button"
								onClick={handleBatchAddToPlaylist}
								className="px-3 py-1 rounded-full hover:bg-muted transition-colors"
							>
								Add to Playlist
							</button>
						</DialogTrigger>
						{playlistDialogMediaId && (
							<DialogContentNewPlaylist
								mediaId={playlistDialogMediaId}
								onConfirm={handleBatchPlaylistConfirm}
							/>
						)}
					</Dialog>
					<button
						type="button"
						onClick={handleBatchRemove}
						className="px-3 py-1 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
					>
						Remove
					</button>
					<button
						type="button"
						onClick={handleBatchOpen}
						className="px-3 py-1 rounded-full hover:bg-muted transition-colors"
					>
						Open All
					</button>
					<button
						type="button"
						onClick={clearSelection}
						className="ml-1 p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground"
						aria-label="Clear selection"
					>
						<Cross2Icon className="w-4 h-4" />
					</button>
				</div>
			)}
		</div>
	);
}
