import { ipcChannels } from '@/config/ipc-channels';
import { CollectionStoreType, LibraryStoreType } from '@/main/store';
import { RANDOM_LIBRARY_DELAY } from '@/renderer/config/config';
import { CollectionType, LibraryType } from '@/types/media';
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
	selectedMediaIds: Set<string>;
	toggleMediaSelection: (id: string, ids?: string[]) => void;
	clearSelection: () => void;
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
	selectedMediaIds: new Set(),
	toggleMediaSelection: () => {},
	clearSelection: () => {},
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
	const [shouldShuffle, setShouldShuffle] = useState(false);
	const [selectedMediaIds, setSelectedMediaIds] = useState<Set<string>>(
		new Set(),
	);

	const libraryArray = useMemo(() => Object.values(library), [library]);
	const playlistsArray = useMemo(() => Object.values(playlists), [playlists]);
	const genresArray = useMemo(() => Object.values(genres), [genres]);
	const liked = useMemo(
		() => libraryArray.filter((media) => media.liked),
		[libraryArray],
	);

	useEffect(() => {
		let isMounted = true;

		const synchronizeLibrary = async () => {
			const [nextLibrary, nextGenres, nextPlaylists] = await Promise.all([
				window.electron.getLibrary(),
				window.electron.getGenres(),
				window.electron.getPlaylists(),
			]);
			if (!isMounted) return;
			setLibrary(nextLibrary);
			setGenres(nextGenres);
			setPlaylists(nextPlaylists);
		};

		// Listen for library updates from the main process
		window.electron.ipcRenderer.on(ipcChannels.LIBRARY_UPDATED, async () => {
			await synchronizeLibrary();
		});

		// Fetch initial library data
		synchronizeLibrary();

		return () => {
			isMounted = false;
			window.electron.ipcRenderer.removeAllListeners(
				ipcChannels.LIBRARY_UPDATED,
			);
		};
	}, []);

	// Only reshuffle when the library size changes (new items added/removed),
	// not on every metadata update to the same items.
	const librarySize = libraryArray.length;

	const shuffleLibraryArray = useCallback(() => {
		const shuffled = [...libraryArray];
		// Fisher-Yates shuffle for unbiased randomization
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		setRandomLibraryArray(shuffled);
	}, [libraryArray]);

	useEffect(() => {
		setShouldShuffle(true);
	}, [librarySize]); // only when count changes

	useEffect(() => {
		if (shouldShuffle) {
			const timer = setTimeout(() => {
				shuffleLibraryArray();
				setShouldShuffle(false);
			}, RANDOM_LIBRARY_DELAY);

			return () => clearTimeout(timer);
		}
	}, [shouldShuffle, shuffleLibraryArray]);

	const toggleMediaSelection = useCallback(
		(id: string, rangeIds?: string[]) => {
			setSelectedMediaIds((prev) => {
				const next = new Set(prev);
				if (rangeIds) {
					// Shift+click range selection
					rangeIds.forEach((rid) => next.add(rid));
				} else if (next.has(id)) {
					next.delete(id);
				} else {
					next.add(id);
				}
				return next;
			});
		},
		[],
	);

	const clearSelection = useCallback(() => {
		setSelectedMediaIds(new Set());
	}, []);

	const contextValue = useMemo(
		() => ({
			library,
			libraryArray,
			randomLibraryArray:
				randomLibraryArray.length > 0 ? randomLibraryArray : libraryArray,
			genres,
			genresArray,
			playlists,
			playlistsArray,
			liked,
			selectedMediaIds,
			toggleMediaSelection,
			clearSelection,
		}),
		[
			library,
			libraryArray,
			randomLibraryArray,
			genres,
			genresArray,
			playlists,
			playlistsArray,
			liked,
			selectedMediaIds,
			toggleMediaSelection,
			clearSelection,
		],
	);

	return (
		<LibraryContext.Provider value={contextValue}>
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
