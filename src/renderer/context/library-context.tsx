import { ipcChannels } from '@/config/ipc-channels';
import { CollectionStoreType, LibraryStoreType } from '@/main/store';
import { RANDOM_LIBRARY_DELAY } from '@/renderer/config/config';
import { CollectionType, LibraryType } from '@/types/media';
import { debounce } from '@/utils/debounce';
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';

interface LibraryContextType {
	library: LibraryStoreType;
	libraryArray: LibraryType;
	randomLibraryArray: LibraryType;
	genres: CollectionStoreType;
	genresArray: CollectionType;
	playlists: CollectionStoreType;
	playlistsArray: CollectionType;
	liked: LibraryType;
}

export const LibraryContext = createContext<LibraryContextType>({
	library: {},
	libraryArray: [],
	randomLibraryArray: [],
	genres: {},
	genresArray: [],
	playlists: {},
	playlistsArray: [],
	liked: [],
});

export function LibraryContextProvider({
	children,
}: {
	children?: React.ReactNode;
}) {
	const [library, setLibrary] = useState<LibraryStoreType>({});
	const [genres, setGenres] = useState<CollectionStoreType>({});
	const [playlists, setPlaylists] = useState<CollectionStoreType>({});
	const [randomLibraryArray, setRandomLibraryArray] = useState<LibraryType>([]);

	const libraryArray = useMemo(() => Object.values(library), [library]);
	const playlistsArray = useMemo(() => Object.values(playlists), [playlists]);
	const genresArray = useMemo(() => Object.values(genres), [genres]);
	const liked = useMemo(
		() => libraryArray.filter((media) => media.liked),
		[libraryArray],
	);

	useEffect(() => {
		const synchronizeLibrary = async () => {
			setLibrary(await window.electron.getLibrary());
			setGenres(await window.electron.getGenres());
			setPlaylists(await window.electron.getPlaylists());
		};

		// Listen for library updates from the main process
		window.electron.ipcRenderer.on(ipcChannels.LIBRARY_UPDATED, async () => {
			await synchronizeLibrary();
		});

		// Fetch initial library data
		synchronizeLibrary();

		return () => {
			window.electron.ipcRenderer.removeAllListeners(
				ipcChannels.LIBRARY_UPDATED,
			);
		};
	}, []);

	const shuffleLibraryArray = () => {
		const shuffled = [...libraryArray];
		setRandomLibraryArray(shuffled.sort(() => 0.5 - Math.random()));
	};

	const debouncedShuffleLibraryArray = useCallback(
		debounce(shuffleLibraryArray, RANDOM_LIBRARY_DELAY),
		[libraryArray],
	);

	useEffect(() => {
		debouncedShuffleLibraryArray();
	}, [libraryArray, debouncedShuffleLibraryArray]);

	return (
		<LibraryContext.Provider
			value={{
				library,
				libraryArray,
				randomLibraryArray:
					randomLibraryArray.length > 0 ? randomLibraryArray : libraryArray,
				genres,
				genresArray,
				playlists,
				playlistsArray,
				liked,
			}}
		>
			{children}
		</LibraryContext.Provider>
	);
}

export const useLibraryContext = () => {
	const context = useContext(LibraryContext);
	if (context === undefined)
		throw new Error(
			'useLibraryContext must be used within a LibraryContextProvider',
		);
	return context;
};
