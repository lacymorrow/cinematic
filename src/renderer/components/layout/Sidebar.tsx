import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { nav } from '@/renderer/config/nav';
import { BookmarkIcon, MixerHorizontalIcon } from '@radix-ui/react-icons';
import { GlobalContext } from '../../context/global-context';
import Icons from '../images/Icons';
import { DialogDeletePlaylist } from '../dialog/DialogDeletePlaylist';

const linkProps = {
  draggable: false,
};

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  // genres: string[];
}

export function Sidebar({ className }: SidebarProps) {
  const { pathname } = useLocation();
  const { genresArray, liked, playlistsArray } =
    React.useContext(GlobalContext);

  return (
    <ScrollArea className={cn('container-sidebar select-none', className)}>
      <div className="h-full space-y-4 p-4 flex flex-col justify-between">
        <div>
          <div className="py-2">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
              Library
            </h2>

            <div className="space-y-1">
              {nav.map((item) => {
                if (item.name === 'Settings' || item.name === 'Liked') {
                  return null;
                }
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    {...linkProps}
                    className={cn(
                      buttonVariants({
                        variant: pathname === item.path ? 'secondary' : 'ghost',
                      }),
                      'w-full justify-start',
                    )}
                  >
                    {item.icon && item.icon}
                    {item.name}
                  </Link>
                );
              })}

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
            </div>
          </div>
          {genresArray.length > 0 && (
            <div className="py-2">
              <h2 className="relative px-2 text-lg font-semibold tracking-tight">
                Genres
              </h2>
              <ScrollArea className="max-h-[300px]">
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
                        {Icons.stacksIcon}
                        {value.name}
                      </Link>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {playlistsArray.length > 0 && (
            <div className="py-2">
              <h2 className="relative px-2 text-lg font-semibold tracking-tight">
                Playlists
              </h2>
              <ScrollArea className="max-h-[300px]">
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
                          {Icons.stacksIcon}
                          {playlist.name}
                        </div>
                        {/* todo: if you mess with a dialog on another page, then click delete, it navigates instead */}
                        <DialogDeletePlaylist playlist={playlist} />
                      </Link>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <div>
          <Link to="/settings" {...linkProps}>
            <Button
              variant={pathname === '/settings/*' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <MixerHorizontalIcon className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>
    </ScrollArea>
  );
}