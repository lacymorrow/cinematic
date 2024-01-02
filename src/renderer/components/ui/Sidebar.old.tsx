import { Button, buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { pathSettings } from '@/config/nav';
import { cn } from '@/lib/utils';
import { DialogDeletePlaylist } from '@/renderer/components/dialog/DialogDeletePlaylist';
import Icons from '@/renderer/components/images/Icons';
import { nav } from '@/renderer/config/nav';
import { useGlobalContext } from '@/renderer/context/global-context';
import { BookmarkIcon, MixerHorizontalIcon } from '@radix-ui/react-icons';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import styles from '@/renderer/styles/Sidebar.module.scss';

const linkProps = {
	draggable: false,
};

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
	className?: string;
}

export function Sidebar({ className }: SidebarProps) {
	const { pathname } = useLocation();
	const { genresArray, liked, playlistsArray, settings } = useGlobalContext();

	return (
		<div className="flex flex-col select-none">
			<ScrollArea
				className={cn('container-sidebar grow', styles.masked, className)}
			>
				<div className="h-full space-y-4 p-4 flex flex-col justify-between">
					<div>
						<div className="py-2">
							<h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
								Library
							</h2>

							<div className="space-y-1">
								{nav.map((item) => {
									if (
										item.name === 'Settings' ||
										item.id === 'liked' ||
										(item.id === 'watch' &&
											!settings.visibleSidebarElements?.includes(item.id))
									) {
										return null;
									}
									return (
										<Link
											key={item.name}
											to={item.path}
											{...linkProps}
											className={cn(
												buttonVariants({
													variant:
														pathname === item.path ? 'secondary' : 'ghost',
												}),
												'w-full justify-start',
											)}
										>
											{item.icon && item.icon}
											{item.name}
										</Link>
									);
								})}

								{settings.visibleSidebarElements?.includes('liked') && (
									<Link to="/liked" {...linkProps}>
										<Button
											variant={pathname === '/liked' ? 'secondary' : 'ghost'}
											className={cn(
												'w-full justify-start',
												liked.length < 1 && 'font-normal',
											)}
										>
											<BookmarkIcon className="mr-2" />
											Liked {liked.length > 0 && <>({liked.length})</>}
										</Button>
									</Link>
								)}
							</div>
						</div>

						{settings.visibleSidebarElements?.includes('genres') &&
							genresArray.length > 0 && (
								<>
									<h2 className="relative p-2 text-lg font-semibold tracking-tight">
										Genres
									</h2>
									<div className="space-y-1">
										{genresArray.map((value) => {
											const genrePath = `/genres/${value.id}`;
											return (
												<Link
													key={value.id}
													to={genrePath}
													{...linkProps}
													className={cn(
														buttonVariants({
															variant:
																pathname === genrePath ? 'secondary' : 'ghost',
														}),
														'w-full justify-start font-normal',
													)}
												>
													<Icons.stacksIcon className="mr-2 h-4 w-4" />
													{value.name}
												</Link>
											);
										})}
									</div>
								</>
							)}

						{settings.visibleSidebarElements?.includes('playlists') &&
							playlistsArray.length > 0 && (
								<>
									<h2 className="relative p-2 text-lg font-semibold tracking-tight">
										Playlists
									</h2>
									<div className="space-y-1">
										{playlistsArray.map((playlist) => {
											const itemPath = `/playlists/${playlist.id}`;
											return (
												<Link
													key={playlist.id}
													to={itemPath}
													{...linkProps}
													className={cn(
														buttonVariants({
															variant:
																pathname === itemPath ? 'secondary' : 'ghost',
														}),
														'group w-full justify-between font-normal',
													)}
												>
													<div className="flex">
														<Icons.stacksIcon className="mr-2 h-4 w-4" />
														{playlist.name}
													</div>
													{/* todo: if you mess with a dialog on another page, then click delete, it navigates instead */}
													<DialogDeletePlaylist playlist={playlist} />
												</Link>
											);
										})}
									</div>
								</>
							)}
					</div>
				</div>
			</ScrollArea>
			<div className="p-2 shrink-0">
				<Link to={pathSettings} {...linkProps}>
					{/* todo? */}
					<Button
						variant={pathname === `${pathSettings}/*` ? 'secondary' : 'ghost'}
						className="w-full justify-start"
					>
						<MixerHorizontalIcon className="mr-2 h-4 w-4" />
						Settings
					</Button>
				</Link>
			</div>
		</div>
	);
}
