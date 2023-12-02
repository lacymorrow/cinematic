import movieInfo from 'movie-info';
import movieTrailer from 'movie-trailer';
import OmdbApi from 'omdbapi';
import { OMDB_KEY, PLOT_LENGTH } from '../config/config';
import { $errors } from '../config/strings';
import { SearchMetaType } from '../types/file';
import { OmdbType, TmdbType } from '../types/meta';

const omdb = new OmdbApi(OMDB_KEY);

export const fetchOMDB = async (meta: SearchMetaType): Promise<OmdbType> => {
  const response = await omdb
    .get({
      // id: 'tt0944947', // optional imdbid
      title: meta.title, // optional (requires imdbid or title)
      plot: PLOT_LENGTH, // optional (defaults to 'short')
      tomatoes: true, // optional (get rotten tomatoes ratings)
      ...(meta.year ? { year: meta.year } : {}), // optional
    })
    .catch((error: Error) => {
      console.error(`omdbapi: ${error} ${meta.title} ${meta.year}`);
    });
  return response;
};

export const fetchTMDB = async (meta: SearchMetaType): Promise<TmdbType> => {
  const response = await movieInfo(meta.title, meta.year)
    .then((data: TmdbType) => {
      if (!data) {
        throw new Error($errors.tmdb_api);
      }
      if (data?.message) {
        throw new Error(data.message);
      }
      return data;
    })
    .catch((error: Error) => {
      console.error(`movie-info: ${error} ${meta.title} ${meta.year}`);
    });

  return response;
};

export const fetchTrailer = async (meta: SearchMetaType): Promise<string[]> => {
  const response = await movieTrailer(meta.title, {
    id: true,
    multi: true,
    ...(meta.year ? { year: meta.year } : {}),
  })
    .then((data: string[]) => {
      if (!data) {
        throw new Error($errors.trailers_api);
      }
      return data;
    })
    .catch((error: Error) => {
      console.error(`movie-trailer: ${error} ${meta.title} ${meta.year}`);
    });
  return response;
};
