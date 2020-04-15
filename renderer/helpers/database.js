'use strict'

import Store from 'electron-store'
import config from '../config'
import { _refreshGenres, _refreshMovies, refreshGenres, refreshMovies, refreshState } from './services'
import { epoch, getElByKeyValue } from './util'

const store = new Store( {
	defaults: {
		state: {},
		cache: [],
		genres: [],
		movies: [],
		recent: [],
		watched: []
	}
} )

/* State */
export const initState = options => {

	store.set( 'state', { ...config.DEFAULT_STATE, ...options } )

}

export const getState = () => store.get( 'state' )

export const setState = options => {

	const state = getState()
	store.set( 'state', { ...state, ...options } )
	refreshState()

}

export const syncState = renderState => {

	const state = getState()
	store.set( 'state', { ...state, ...renderState } )
	refreshState()
	refreshGenres()
	refreshMovies()

}

/* Recent */
export const addRecent = mid => {

	const time = epoch()

	const recent = store.get( 'recent' )
	recent.unshift( { _id: mid, time } )
	store.set( 'recent', recent )

	updateMovie( mid, { recentTime: time } )

}

/* Watched */
export const addWatched = mid => {

	const time = epoch()

	const watched = store.get( 'watched' )
	watched.unshift( { _id: mid, time } )
	store.set( 'watched', watched )

	updateMovie( mid, { watchedTime: time } )

}

/* Genre */
export const indexGenre = ( gid, name ) => {

	// Create or update genre name
	const genre = getGenre( gid )
	if ( genre ) {

		updateGenre( gid, { name } )

	} else {

		addGenre( gid, { name } )

	}

}

export const indexMovieGenre = ( gid, mid ) => {

	// Create or update genre and pin a movie to genre
	const genre = getGenre( gid )
	if ( genre ) {

		// Genre is not guaranteed to have .items
		const items = genre.items || []
		items.push( mid )
		updateGenre( gid, { items } )

	} else {

		addGenre( gid, { items: [ mid ] } )

	}

}

export const getGenres = () => store.get( 'genres' )

const addGenre = ( gid, options ) => {

	const genre = { ...{ id: gid, _id: gid.toString(), items: [] }, ...options }
	const genres = store.get( 'genres' )
	genres.push( genre )
	store.set( 'genres', genres )

}

const getGenre = gid => {

	const genres = store.get( 'genres' )

	for ( const genre of genres ) {

		if ( genre._id === gid.toString() ) {

			return genre

		}

	}

	return false

}

const updateGenre = ( gid, options ) => {

	const genres = store.get( 'genres' )
	genres.forEach( ( genre, i ) => {

		if ( String( genre._id ) === String( gid ) ) {

			// Id is a number

			genre = { ...genre, ...options }
			genres[i] = genre

		}

	} )

	store.set( 'genres', genres )
	refreshGenres()

}

export const resetGenres = () => {

	const genres = store.get( 'genres' )
	genres.forEach( ( genre, i ) => {

		genre.items = []
		genres[i] = genre

	} )

	store.set( 'genres', genres )
	_refreshGenres()

}

/* Movies */
export const addMovie = movie => {

	const movies = store.get( 'movies' )
	movies.push( movie )
	store.set( 'movies', movies )
	refreshMovies()

	return movie._id

}

export const getMovies = () => {

	return store.get( 'movies' )

}

export const getMovieById = mid => {

	const movies = store.get( 'movies' )

	return getElByKeyValue( movies, '_id', mid )

}

export const getMovieByFile = file => {

	const movies = store.get( 'movies' )
	for ( const movie of movies ) {

		if ( movie.file === file ) {

			return movie

		}

	}

	return false

}

export const updateMovie = ( mid, options ) => {

	const movies = store.get( 'movies' )
	movies.forEach( ( movie, i ) => {

		if ( movie._id === mid ) {

			movie = { ...movie, ...options }
			movies[i] = movie
			store.set( 'movies', movies )

		}

	} )

}

export const updateMovieTrailer = ( mid, trailer ) => {

	const movies = store.get( 'movies' )
	movies.forEach( ( movie, i ) => {

		if ( movie._id === mid ) {

			movie.trailer = trailer
			movies[i] = movie
			store.set( 'movies', movies )

		}

	} )

}

export const randomizeMovies = () => {

	setState( { isShuffling: true } )

	const movies = store.get( 'movies' )
	for ( const movie of movies ) {

		updateMovie( movie._id, { seed: Math.random() } )

	}

	refreshMovies()
	setState( { isShuffling: false } )

}

export const resetMovies = () => {

	store.set( 'movies', [] )
	_refreshMovies()

}

/* Cache */
const addCachedMovie = movie => {

	const cache = store.get( 'cache' )
	cache.push( movie )
	store.set( 'cache', cache )

}

const updateCachedMovie = ( key, movie ) => {

	const cache = store.get( 'cache' )
	cache.unshift( { _id: key, cachedTime: epoch(), movie } )
	store.set( 'cache', cache )

}

export const getCachedMovie = key => {

	const cache = store.get( 'cache' )
	for ( const c of cache ) {

		if ( c._id === key ) {

			return c

		}

	}

	return false

}

export const cacheMovie = file => {

	const movie = getMovieByFile( file )
	movie.cachedTime = epoch()
	// Only cache if it loaded properly
	if ( movie && movie.intel.Title && movie.info.title ) {

		addCachedMovie( movie )

	}

}

export const getMoviesCache = () => {

	const cache = store.get( 'cache' )

	return cache

}

export const refreshMovieCache = () => {

	const movies = getMovies()
	const time = epoch()
	movies.forEach( movie => {

		updateCachedMovie( movie.path + movie.file, movie )

	} )
	setState( { cachedMoviesTime: time } )

}

/* DB */
export const resetDB = () => {

	store.reset()

	return true

}
