import path from 'path';
import { MediaType } from '../types/file';

// Last If statement wins, reverse to prefer TMDB or OMDB
export const reconcileMovieMeta = (media: MediaType) => {
  // todo, we assume these aren't empty
  const { tmdb, omdb, trailers } = media;

  media.ratings = [];

  // Set a single "main" trailer
  if (trailers && trailers.length > 0) {
    if (typeof trailers === 'string') {
      media.trailer = trailers;
    } else if (trailers.length > 0) {
      [media.trailer] = trailers;
    }
  }

  if (tmdb && Object.keys(tmdb).length > 0) {
    media.title = tmdb.title;
    media.plot = tmdb.overview;
    media.language = tmdb.original_language;

    const released = new Date(tmdb.release_date);
    if (!Number.isNaN(released)) {
      media.releaseDate = released.toDateString();
      media.year = String(released.getFullYear());
    }

    try {
      // Images
      const baseURL = new URL(tmdb.imageBase);

      media.backdrop = new URL(
        path.join(baseURL.pathname, tmdb.backdrop_path),
        baseURL.origin,
      ).href;

      media.poster = new URL(
        path.join(baseURL.pathname, tmdb.poster_path),
        baseURL.origin,
      ).href;
    } catch (error) {
      console.warn('No TMDB data');
    }

    // Ratings
    if (tmdb.vote_average) {
      const score = tmdb.vote_average;
      media.ratings.push({
        name: 'TMDB',
        score,
      });
    }
  }

  if (omdb && Object.keys(omdb).length > 0) {
    media.year = omdb.year;
    media.runtime = omdb.runtime;
    media.poster = omdb.poster;
    media.plot = omdb.plot;
    media.releaseDate = new Date(omdb.released).toDateString();
    media.title = omdb.title;

    if (omdb.metascore) {
      const score = parseFloat(omdb.metascore);
      media.ratings.push({
        name: 'Metascore',
        score,
      });
    }

    if (omdb.imdbrating) {
      const score = parseFloat(omdb.imdbrating);
      media.ratings.push({
        name: 'IMDB',
        score,
      });
    }
  }

  return media;

  // // Add movie genres
  // for (const genre of response.genres) {
  //   indexMovieGenre(genre.id, mid);
  // }
};

// Queue Success: {
//   id: 'titanic',
//   name: 'titanic',
//   filename: 'titanic',
//   tmdb: {
//     adult: false,
//     backdrop_path: '/rzdPqYx7Um4FUZeD8wpXqjAUcEm.jpg',
//     genre_ids: [ 18, 10749 ],
//     id: 597,
//     original_language: 'en',
//     original_title: 'Titanic',
//     overview: "101-year-old Rose DeWitt Bukater tells the story of her life aboard the Titanic, 84 years later. A young Rose boards the ship with her mother and fiancé. Meanwhile, Jack Dawson and Fabrizio De Rossi win third-class tickets aboard the ship. Rose tells the whole story from Titanic's departure through to its death—on its first and last voyage—on April 15, 1912.",
//     popularity: 117.82,
//     poster_path: '/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
//     release_date: '1997-11-18',
//     title: 'Titanic',
//     video: false,
//     vote_average: 7.9,
//     vote_count: 23792,
//     imageBase: 'http://image.tmdb.org/t/p/original'
//   }
// }
// [
//   'title',            'year',
//   'rated',            'released',
//   'runtime',          'genre',
//   'director',         'writer',
//   'actors',           'plot',
//   'language',         'country',
//   'awards',           'poster',
//   'ratings',          'metascore',
//   'imdbrating',       'imdbvotes',
//   'imdbid',           'type',
//   'tomatometer',      'tomatoimage',
//   'tomatorating',     'tomatoreviews',
//   'tomatofresh',      'tomatorotten',
//   'tomatoconsensus',  'tomatousermeter',
//   'tomatouserrating', 'tomatouserreviews',
//   'tomatourl',        'dvd',
//   'boxoffice',        'production',
//   'website'
// ]
// Queue Success: {
//   id: 'titanic',
//   name: 'titanic',
//   filename: 'titanic',
//   omdb: {
//     title: 'Titanic',
//     year: '1997',
//     rated: 'PG-13',
//     released: '19 Dec 1997',
//     runtime: '194 min',
//     genre: { '0': 'Drama', '1': 'Romance' },
//     director: { '0': 'James Cameron' },
//     writer: { '0': 'James Cameron' },
//     actors: {
//       '0': 'Leonardo DiCaprio',
//       '1': 'Kate Winslet',
//       '2': 'Billy Zane'
//     },
//     plot: '84 years later, a 100 year-old woman named Rose DeWitt Bukater tells the story to her granddaughter Lizzy Calvert, Brock Lovett, Lewis Bodine, Bobby Buell and Anatoly Mikailavich on the Keldysh about her life set in April 10th 1912, on a ship called Titanic when young Rose boards the departing ship with the upper-class passengers and her mother, Ruth DeWitt Bukater, and her fiancé, Caledon Hockley. Meanwhile, a drifter and artist named Jack Dawson and his best friend Fabrizio De Rossi win third-class tickets to the ship in a game. And she explains the whole story from departure until the death of Titanic on its first and last voyage April 15th, 1912 at 2:20 in the morning.',
//     language: 'English, Swedish, Italian, French',
//     country: 'United States, Mexico',
//     awards: 'Won 11 Oscars. 126 wins & 83 nominations total',
//     poster: 'https://m.media-amazon.com/images/M/MV5BMDdmZGU3NDQtY2E5My00ZTliLWIzOTUtMTY4ZGI1YjdiNjk3XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_SX300.jpg',
//     ratings: { '0': [Object], '1': [Object], '2': [Object] },
//     metascore: '75',
//     imdbrating: '7.9',
//     imdbvotes: '1,248,724',
//     imdbid: 'tt0120338',
//     type: 'movie',
//     tomatometer: null,
//     tomatoimage: null,
//     tomatorating: null,
//     tomatoreviews: null,
//     tomatofresh: null,
//     tomatorotten: null,
//     tomatoconsensus: null,
//     tomatousermeter: null,
//     tomatouserrating: null,
//     tomatouserreviews: null,
//     tomatourl: 'https://www.rottentomatoes.com/m/titanic/',
//     dvd: '01 Jun 2014',
//     boxoffice: '$674,292,608',
//     production: null,
//     website: null
//   }
// }
// Queue Success: {
//   id: 'titanic',
//   name: 'titanic',
//   filename: 'titanic',
//   trailers: [
//     'R79Ftb1Ct4I', 'cZUvJ37ao1k',
//     '1oyechwbCZY', 'Y9AWk2PGYuA',
//     'iCPEIqqFXds', 'wO44qBPBG4c',
//     'oHY7D7K58BM', 'JYdCltjvrxg',
//     'tEM0I3ltp7M', 'UE5KcYjO5d8',
//     'zSRvmHSgaBg', '_qTZRD1_ybQ',
//     'EsoZymW-RtI', 'cIJ8ma0kKtY',
//     'thrdkT9vE3k', 'CHekzSiZjrY'
//   ]
// }
// [
//   'adult',             'backdrop_path',
//   'genre_ids',         'id',
//   'original_language', 'original_title',
//   'overview',          'popularity',
//   'poster_path',       'release_date',
//   'title',             'video',
//   'vote_average',      'vote_count',
//   'imageBase'
// ]
