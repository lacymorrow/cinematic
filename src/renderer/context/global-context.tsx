// DATA SHOULD ONLY FLOW DOWNWARDS
// Do not use this context to update data, only to read it
// Use IPC to update data

import React, { useEffect, useMemo } from 'react';
import { LIBRARY_UPDATED } from '@/config/ipc-channels';
import {
  CollectionStoreType,
  LibraryStoreType,
  SettingsType,
} from '@/main/store';
import { CollectionType, LibraryType } from '@/types/media';

import DEFAULT_SETTINGS from '@/config/settings';

interface GlobalContextType {
  genres: CollectionStoreType;
  genresArray: CollectionType;
  library: LibraryStoreType;
  libraryArray: LibraryType;
  liked: LibraryType;
  playlists: CollectionStoreType;
  playlistsArray: CollectionType;
  randomLibraryArray: LibraryType;
  settings: SettingsType;
}

export const GlobalContext = React.createContext<GlobalContextType>({
  genres: {},
  genresArray: [],
  library: {},
  libraryArray: [],
  liked: [],
  playlists: {},
  playlistsArray: [],
  randomLibraryArray: [],
  settings: DEFAULT_SETTINGS,
});

export function GlobalContextProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [genres, setGenres] = React.useState<CollectionStoreType>({});
  const [library, setLibrary] = React.useState<LibraryStoreType>({});
  const [playlists, setPlaylists] = React.useState<CollectionStoreType>({});
  const [settings, setSettings] =
    React.useState<SettingsType>(DEFAULT_SETTINGS);

  const syncronize = async () => {
    console.log('synchronize');

    setGenres(await window.electron.getGenres());
    setPlaylists(await window.electron.getPlaylists());
    setSettings(await window.electron.getSettings());
    setLibrary(await window.electron.getLibrary());
  };

  useEffect(() => {
    window.electron.ipcRenderer.on(LIBRARY_UPDATED, async (_event) => {
      await syncronize();
    });

    syncronize();
    return () => {
      window.electron.ipcRenderer.removeAllListeners(LIBRARY_UPDATED);
    };
  }, []);

  const libraryArray = useMemo(() => Object.values(library), [library]);
  const playlistsArray = useMemo(() => Object.values(playlists), [playlists]);
  const genresArray = useMemo(() => Object.values(genres), [genres]);
  const liked = useMemo(
    () => libraryArray.filter((media) => media.liked),
    [libraryArray],
  );
  const randomLibraryArray = useMemo(() => {
    const shuffled = [...libraryArray];
    return shuffled.sort(() => 0.5 - Math.random());
  }, [libraryArray]);

  const value = useMemo(() => {
    return {
      genres,
      genresArray,
      library,
      libraryArray,
      liked,
      playlists,
      playlistsArray,
      randomLibraryArray,
      settings,
    };
  }, [
    genres,
    genresArray,
    library,
    libraryArray,
    liked,
    playlists,
    playlistsArray,
    randomLibraryArray,
    settings,
  ]);

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
}