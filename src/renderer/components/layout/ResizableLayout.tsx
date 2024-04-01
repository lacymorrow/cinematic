import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Nav, NavLinkProps } from '@/renderer/components/ui/Nav';
import {
	DislikedIcon,
	GenresIcon,
	LikedIcon,
	PlaylistIcon,
	SettingsIcon,
} from '@/renderer/config/icons';
import { useGlobalContext } from '@/renderer/context/global-context';
import { TokensIcon, VideoIcon } from '@radix-ui/react-icons';
import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { $ui } from '@/config/strings';
import { DialogDeletePlaylist } from '@/renderer/components/dialog/DialogDeletePlaylist';
import { DEBOUNCE_DELAY } from '@/renderer/config/config';
import { pathSettings } from '@/renderer/config/nav';
import styles from '@/renderer/styles/Sidebar.module.scss';
import { debounce } from '@/utils/debounce';
import Logger from 'electron-log/renderer';

function Header({ text }: { text: string }) {
	return <h2 className="p-2 text-lg font-semibold tracking-tight">{text}</h2>;
}

interface Props {
	children: React.ReactNode;
	defaultLayout?: number[] | undefined;
	navCollapsedSize?: number;
}

export function ResizableLayout({
	children,
	defaultLayout = [20, 80],
	navCollapsedSize = 4,
}: Props) {
	const { pathname } = useLocation();
	const { genresArray, liked, playlistsArray, settings, setSettings } =
		useGlobalContext();

	const [isCollapsed, setIsCollapsed] = React.useState(
		settings.sidebarCollapsed,
	);

	const handleLayoutChange = debounce((layout: number[]) => {
		Logger.status('Save layout', layout);
		setSettings({
			sidebarLayout: [40, 60],
		});
	}, DEBOUNCE_DELAY);

	const handleCollapseExpand = useCallback(
		(collapsed: boolean) => {
			setIsCollapsed(collapsed);
			setSettings({
				sidebarCollapsed: collapsed,
			});
		},
		[setSettings],
	);

	const nav: NavLinkProps[] = [
		{
			title: 'Watch Now',
			icon: VideoIcon,
			href: '/',
			...(pathname === '/' ? { variant: 'default' } : {}),
		},
		{
			title: 'Browse',
			icon: TokensIcon,
			href: '/browse',
			...(pathname === '/browse' ? { variant: 'default' } : {}),
		},
	];

	if (settings.visibleSidebarElements?.includes('liked')) {
		nav.push({
			title: $ui.liked.liked,
			icon: liked.length < 1 ? DislikedIcon : LikedIcon,
			label: liked.length < 1 ? '' : liked.length.toString(),
			href: '/liked',
			...(pathname === '/liked' ? { variant: 'default' } : {}),
		});
	}

	return (
		<TooltipProvider delayDuration={0}>
			<ResizablePanelGroup
				direction="horizontal"
				onLayout={handleLayoutChange}
				className="h-full items-stretch"
			>
				<ResizablePanel
					defaultSize={settings.sidebarLayout[0] || defaultLayout[0]}
					collapsedSize={navCollapsedSize}
					collapsible
					minSize={18}
					maxSize={40}
					onCollapse={() => handleCollapseExpand(true)}
					onExpand={() => handleCollapseExpand(false)}
					className={cn(
						isCollapsed &&
							'min-w-[50px] transition-all duration-300 ease-in-out !overflow-auto',
						'flex flex-col max-w-xs @container z-10',
					)}
				>
					{/* todo: fade out the sidebar */}
					<ScrollArea className={cn('grow', styles.faded)}>
						<div className={cn(!isCollapsed && 'p-2 lg:px-4')}>
							{!isCollapsed && <Header text="Library" />}
							<Nav isCollapsed={isCollapsed} links={nav} />

							{settings.visibleSidebarElements?.includes('genres') &&
								genresArray.length > 0 && (
									<>
										{isCollapsed ? <Separator /> : <Header text="Genres" />}

										<Nav
											isCollapsed={isCollapsed}
											links={genresArray.map((genre) => {
												const genrePath = `/genres/${genre.id}`;
												return {
													title: `${genre.name}`,
													icon: GenresIcon,
													href: genrePath,
													label: `${genre.values.length}`,
													...(pathname === genrePath
														? { variant: 'default' }
														: {}),
												};
											})}
										/>
									</>
								)}

							{settings.visibleSidebarElements?.includes('playlists') &&
								playlistsArray.length > 0 && (
									<>
										{isCollapsed ? <Separator /> : <Header text="Playlists" />}
										<Nav
											isCollapsed={isCollapsed}
											links={playlistsArray.map((playlist) => {
												const playlistPath = `/playlists/${playlist.id}`;
												return {
													title: playlist.name,
													icon: PlaylistIcon,
													href: playlistPath,
													label: (
														<div className="flex items-center gap-2">
															<span className="transition-transform translate-x-6 group-hover:translate-x-0 group-focus-within:translate-x-0">
																{playlist.values.length}
															</span>
															<DialogDeletePlaylist
																playlist={playlist}
																className="w-8 transition-all opacity-0 translate-x-6 group-hover:opacity-90 group-hover:translate-x-0 group-focus-within:opacity-90 group-focus-within:translate-x-0"
															/>
														</div>
													),
													...(pathname === playlistPath
														? { variant: 'default' }
														: {}),
												};
											})}
										/>
									</>
								)}
						</div>
					</ScrollArea>
					<div className="shrink-0">
						<Nav
							isCollapsed={isCollapsed}
							links={[
								{
									title: 'Settings',
									icon: SettingsIcon,
									href: `${pathSettings}/general`,
									...(pathname === pathSettings ? { variant: 'default' } : {}),
								},
							]}
						/>
					</div>
				</ResizablePanel>
				<ResizableHandle withHandle />
				<ResizablePanel
					defaultSize={settings.sidebarLayout[1] || defaultLayout[1]}
					minSize={30}
					className="flex flex-col"
				>
					<ScrollArea className={cn('grow')}>
						<div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
							{children}
						</div>
					</ScrollArea>
				</ResizablePanel>
			</ResizablePanelGroup>
		</TooltipProvider>
	);
}
