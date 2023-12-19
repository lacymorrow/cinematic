import { OmdbType, TmdbType } from './meta';

export type FilePathType = string;

export interface FileType {
	filename: string;
	filepath: string;
	ext: string;
}

export interface MediaMeta {
	omdb: OmdbType;
	tmdb: TmdbType;
	trailers: string[];
	ratings: any;

	title: string;
	year: string;

	language: string;

	rating: string;
	runtime: string;
	plot: string;
	poster: string;
	backdrop: string;
	trailer: string;
	releaseDate: string;
	// genres: string[];
	// imdbId: string;
	// torrents: ITorrent[];
	// imdb: string;
	// tmdb: string;
	// releaseDate: string;
	// certification: string;
	// language: string;
	// country: string;
	// cast: ICast[];
	// director: string;
	// writer: string;
	// production: string;
	// website: string;
	// type: string;
	// _id: string;
	// cached_at: number;
	// info: {
	//   genre_ids: string[];
	// };
}

export interface MediaType extends Partial<MediaMeta> {
	id: string;
	title: string;
	filepath: FilePathType; // Used as the key in the library
	filename: string;
	ext: string;
	prettyFileName: string;
	liked: boolean;
	dateAdded: number;
	dateUpdated?: number;
	dateViewed?: number;
	dateWatched?: number;
}

export interface SearchMetaType {
	title: string;
	year?: string;
}
