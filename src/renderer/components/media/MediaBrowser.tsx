import {
	TableCell,
	TableHead,
	TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ViewModeType } from '@/config/settings';
import { $media, $ui } from '@/config/strings';
import { MediaArtwork } from '@/renderer/components/media/MediaArtwork';
import { MediaEmptyPlaceholder } from '@/renderer/components/media/MediaEmptyPlaceholder';
import { ButtonAddMedia } from '@/renderer/components/ui/ButtonAddMedia';
import { SectionHeader } from '@/renderer/components/ui/SectionHeader';
import { GridIcon, ListIcon } from '@/renderer/config/icons';
import { useGlobalContext } from '@/renderer/context/global-context';
import { useLibraryContext } from '@/renderer/context/library-context';
import { MediaType } from '@/types/file';

import { BookmarkIcon, CheckIcon, Cross2Icon } from '@radix-ui/react-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { DialogContentNewPlaylist } from '@/renderer/components/dialog/DialogContentNewPlaylist';
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
	const { selectedMediaIds, toggleMediaSelection, clearSelection } = useLibraryContext();
	const [playlistDialogMediaId, setPlaylistDialogMediaId] = useState<string | null>(null);
	const lastSelectedIndexRef = useRef<number>(-1);

	const handleViewChange = (value: string) => {
		setSettings({
			viewMode: value as ViewModeType,
		});
	};

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

	const handleSelect = useCallback(
		(id: string, event: React.MouseEvent) => {
			const index = items.findIndex((m) => m.id === id);
			if (event.shiftKey && lastSelectedIndexRef.current >= 0) {
				const start = Math.min(lastSelectedIndexRef.current, index);
				const end = Math.max(lastSelectedIndexRef.current, index);
				const rangeIds = items.slice(start, end + 1).map((m) => m.id);
				toggleMediaSelection(id, rangeIds);
			} else {
				toggleMediaSelection(id);
				lastSelectedIndexRef.current = index;
			}
		},
		[items, toggleMediaSelection],
	);

	const handleBatchLike = useCallback(() => {
		selectedMediaIds.forEach((id) => {
			const media = items.find((m) => m.id === id);
			if (media) window.electron.setMediaLike(id, !media.liked);
		});
	}, [selectedMediaIds, items]);

	const handleBatchAddToPlaylist = useCallback(() => {
		// Open playlist dialog for each selected item — use the first for dialog
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
			const media = items[index];
			if (!media) return null;
			return (
				<MediaArtwork
					media={media}
					className="w-[250px]"
					aspectRatio="portrait"
					width={250}
					height={375}
					isSelected={selectedMediaIds.has(media.id)}
					onMediaSelect={handleSelect}
				/>
			);
		},
		[items, selectedMediaIds, handleSelect],
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
						{addMediaButton && <ButtonAddMedia />}
					</div>
					<SectionHeader title={title} tagline={tagline} />

					<TabsContent
						value="grid"
						className="border-none p-0 outline-none flex-1 min-h-0"
					>
						<VirtuosoGrid
							totalCount={items.length}
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
							data={items}
							style={{ height: '100%' }}
							overscan={200}
							fixedHeaderContent={() => (
								<TableRow>
									<TableHead className="w-10" />
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
									<TableCell className="font-medium">{media.title}</TableCell>
									<TableCell>{media.year}</TableCell>
									<TableCell>{media.runtime}</TableCell>
									<TableCell>
										<BookmarkIcon className="ml-auto" />
									</TableCell>
								</>
							)}
						/>
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
