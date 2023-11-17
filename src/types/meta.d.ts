export type TrailersType = string[];
export type RatingsType = {
  name: string;
  score: number;
}[];

export interface TmdbErrorType {
  message: string;
}

export interface TmdbType {
  message?: string; // Error message

  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: Date;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  imageBase: string;
}

export interface OmdbType {
  title: string;
  year: string;
  rated: string;
  released: string;
  runtime: string;
  genre: { [key: string]: string };
  director: { [key: string]: string };
  writer: { [key: string]: string };
  actors: { [key: string]: string };
  plot: string;
  language: string;
  country: string;
  awards: string;
  poster: string;
  ratings: {
    [key: string]: {
      source: string;
      value: string;
    };
  };
  metascore: string;
  imdbrating: string;
  imdbvotes: string;
  imdbid: string;
  type: string;
  tomatometer: null;
  tomatoimage: null;
  tomatorating: null;
  tomatoreviews: null;
  tomatofresh: null;
  tomatorotten: null;
  tomatoconsensus: null;
  tomatousermeter: null;
  tomatouserrating: null;
  tomatouserreviews: null;
  tomatourl: string;
  dvd: string;
  boxoffice: string;
  production: null;
  website: null;
}

export interface Rating {
  source: string;
  value: string;
}
