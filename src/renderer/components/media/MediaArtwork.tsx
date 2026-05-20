// todo: strings
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { DialogContentNewPlaylist } from '@/renderer/components/dialog/DialogContentNewPlaylist';
import { MoviePlaceholder } from '@/renderer/components/images/Placeholder';
import { ExternalLink } from '@/renderer/components/ui/ExternalLink';
import {
	AddIcon,
	DislikedIcon,
	ExternalLinkIcon,
	LikedIcon,
	OpenIcon,
	PlayIcon,
	PlaylistIcon,
} from '@/renderer/config/icons';
import { useLibraryContext } from '@/renderer/context/library-context';
import { MediaType } from '@/types/file';
import { CheckIcon } from '@radix-ui/react-icons';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

interface MediaArtworkProps extends React.HTMLAttributes<HTMLDivElement> {
	media: MediaType;
	aspectRatio?: 'portrait' | 'square';
	width?: number;
	height?: number;
	isSelected?: boolean;
	onMediaSelect?: (id: string, event: React.MouseEvent) => void;
}

export function MediaArtwork({
	media,
	aspectRatio = 'portrait',
	width,
	height,
	className,
	isSelected,
	onMediaSelect,
	...props
}: MediaArtworkProps) {
	const { playlistsArray } = useLibraryContext();

	const url = useMemo(() => `/media/${media.id}`, [media.id]);

	const handleLike = () => {
		window.electron.setMediaLike(media.id, !media.liked);
	};

	const handleOpenFile = () => {
		window.electron.openPath(media.filepath);
	};

	const handleClick = (e: React.MouseEvent) => {
		if ((e.ctrlKey || e.metaKey || e.shiftKey) && onMediaSelect) {
			e.preventDefault();
			onMediaSelect(media.id, e);
		}
	};

	const handleCheckboxClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (onMediaSelect) onMediaSelect(media.id, e);
	};

	return (
		<div className={cn('relative group/artwork', className)} {...props} onClick={handleClick}>
			<Dialog>
				<ContextMenu>
					<ContextMenuTrigger>
						<Link to={url} className="group" draggable={false}>
							<div className="overflow-hidden rounded-md relative">
								{media.poster ? (
									<img
										draggable={false}
										loading="lazy"
										decoding="async"
										src={media.poster}
										alt={media.title}
										width={width}
										height={height}
										className={cn(
											'h-auto w-auto object-cover transition-all group-hover:scale-105',
											aspectRatio === 'portrait'
												? 'aspect-[3/4.5]'
												: 'aspect-square',
											isSelected && 'ring-2 ring-primary ring-offset-2',
										)}
									/>
								) : (
									<MoviePlaceholder
										className={cn(
											`w-[${width}px]`,
											aspectRatio === 'portrait' ? 'h-[375px]' : 'h-[150px]',
											isSelected && 'ring-2 ring-primary ring-offset-2',
										)}
									/>
								)}
								{/* Checkbox overlay */}
								{onMediaSelect && (
									<button
										type="button"
										onClick={handleCheckboxClick}
										className={cn(
											'absolute top-2 left-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
											'bg-background/80 border-muted-foreground',
											'opacity-0 group-hover/artwork:opacity-100',
											isSelected && 'opacity-100 bg-primary border-primary',
										)}
										aria-label={isSelected ? 'Deselect' : 'Select'}
									>
										{isSelected && <CheckIcon className="w-3 h-3 text-primary-foreground" />}
									</button>
								)}
							</div>
							<div className="space-y-1 text-sm pt-3">
								<h3 className="font-medium leading-none">
									{media.title || media.prettyFileName}
								</h3>
								<p className="text-xs text-muted-foreground">
									{media.year}&#xfeff;
								</p>
							</div>
						</Link>
					</ContextMenuTrigger>
					<ContextMenuContent className="w-40">
						<Link to={url} draggable={false}>
							<ContextMenuItem className="flex gap-2">
								<OpenIcon />
								Open
							</ContextMenuItem>
						</Link>
						<ContextMenuItem className="flex gap-2" onClick={handleOpenFile}>
							<PlayIcon />
							Play file
						</ContextMenuItem>
						<ContextMenuItem onClick={handleLike} className="flex gap-2">
							{media.liked ? <LikedIcon /> : <DislikedIcon />}
							Like
						</ContextMenuItem>
						<ContextMenuSub>
							<ContextMenuSubTrigger>Add to Playlist</ContextMenuSubTrigger>
							<ContextMenuSubContent className="w-48">
								<DialogTrigger asChild>
									<ContextMenuItem className="flex gap-2">
										<AddIcon className="h-4 w-4" />
										New Playlist
									</ContextMenuItem>
								</DialogTrigger>
								{playlistsArray?.length > 0 && (
									<>
										<ContextMenuSeparator />
										{playlistsArray.map((playlist) => (
											<ContextMenuItem key={playlist.id} className="flex gap-2">
												<PlaylistIcon />
												{playlist.name}
											</ContextMenuItem>
										))}
									</>
								)}
							</ContextMenuSubContent>
						</ContextMenuSub>
						<ContextMenuSeparator />

						<ContextMenuItem>
							<ExternalLink
								href={`https://www.google.com/search?q=${encodeURIComponent(
									`${media.title} ${media.year ? media.year : ''}`,
								)}`}
							>
								Open in Google <ExternalLinkIcon />
							</ExternalLink>
						</ContextMenuItem>

						{media.omdb?.imdbid && (
							<ContextMenuItem>
								<ExternalLink
									href={`https://www.imdb.com/title/${media.omdb.imdbid}/`}
								>
									Open in IMDB <ExternalLinkIcon />
								</ExternalLink>
							</ContextMenuItem>
						)}
					</ContextMenuContent>
				</ContextMenu>
				<DialogContentNewPlaylist mediaId={media.id} />
			</Dialog>
		</div>
	);
}
