'use strict'

import logger from 'electron-timber'
import debounce from 'lodash/debounce'
import ky from 'ky-universal'
import movieInfo from 'movie-info'
import movieTrailer from 'movie-trailer'
import omdbApi from 'omdb-client'
import queue from 'queue'

import config from '../config'
import ipc from './safe-ipc'
import strings from './strings'
import { epoch } from './util'
import {
	indexGenre,
	indexMovieGenre,
	getGenres,
	getMovies,
	getState,
	setState,
	getMovieById,
	updateMovie,
	refreshMovieCache
} from './database'

export const serviceLog = logger.create( { name: 'service' } )

/* Trigger a UI reflow */
const renderUpdate = ( command, data ) => {

	// Accepts {command: '', data:'...'} or as args
	if ( typeof command === 'object' ) {

		data = command.data
		command = command.command

	}

	// Log( `<<<UPDATE>>>: ${command} - ${JSON.stringify( data )}` )
	ipc.send( 'for-renderer', { command, data } )

}

// Debounced reflow triggers
export const _refreshGenres = () => {

	const genres = getGenres()
	renderUpdate( 'genres', genres )

}

export const refreshGenres = debounce( _refreshGenres, config.REFLOW_DELAY, {
	maxWait: config.REFLOW_DELAY,
	leading: true,
	trailing: true
} )

export const _refreshMovies = () => {

	const movies = getMovies()
	renderUpdate( 'movies', movies )

}

export const refreshMovies = debounce( _refreshMovies, config.REFLOW_DELAY, {
	maxWait: config.REFLOW_DELAY,
	leading: true,
	trailing: true
} )

export const refreshState = () => {

	const state = getState()
	renderUpdate( 'state', state )

}

// TODO Warn user if this will take awhile
// TODO test bad/no internet

/* QUEUE */
const q = queue( {
	autostart: true,
	concurrency: config.MAX_CONNECTIONS,
	timeout: config.TIMEOUT,
	results: []
} )

const qUpdateLoadingBar = () => {

	// Change loading bar when queue updates
	let { queueTotal } = getState()

	if ( queueTotal < q.length ) {

		queueTotal = q.length

	}

	// Percent of objects still in queue (invert percentage)
	let loading = 1 - ( q.length / queueTotal )
	if ( isNaN( loading ) || loading === 0 ) {

		loading = 0.01

	}

	setState( { loading, queueTotal, message: `${strings.messagebox.queue} ${queueTotal - q.length} / ${queueTotal}` } )

}

// TODO warn user of status
q.on( 'start', () => {

	// Logger.log( strings.q.start )
	// QUpdateLoadingBar()

} )

q.on( 'success', () => {

	qUpdateLoadingBar()
	refreshMovies()

} )

q.on( 'error', ( error, job ) => {

	setState( { message: `${strings.q.error}: ${error}: ${job.id}` } )
	logger.log( `${strings.q.error}: ${error}: ${job.id}` )
	qUpdateLoadingBar()

} )

q.on( 'timeout', ( next, job ) => {

	setState( { message: `${strings.q.timeout}: ${job.id}` } )
	logger.log( `${strings.q.timeout}: ${job.id}` )
	qUpdateLoadingBar()
	next()

} )

q.on( 'end', error => {

	if ( error ) {

		setState( { message: `${strings.q.error}: ${error}` } )
		logger.log( `${strings.q.error}: ${error}` )

	}

	logger.log( strings.q.finish )

	setState( { loading: 0, message: '' } )
	if ( config.CACHE_TIMEOUT ) {

		refreshMovieCache()

	}

	refreshMovies()

} )

export const resetQueue = () => {

	q.end()

}

export const initGenreCache = async () => {

	// ResetGenres()
	try {

		const response = await ky(
			`${config.GENRE_ENDPOINT}?api_key=${config.TMDB_KEY}`
		)
		const res = await response.json()

		for ( const genre of res.genres ) {

			indexGenre( genre.id, genre.name )
			// Logger.log( genre.id, genre.name )

		}

		setState( { cachedGenresTime: epoch(), message: strings.messagebox.genreCache } )

	} catch ( error ) {

		setState( { message: strings.messagebox.genreCacheError } )
		throw new Error( `initGenreCache/ ${strings.error.genres}: ${error}` )

	}

}

// Queue API calls
export const fetchMeta = ( mid, name, year ) => {

	const jobOMDB = async () => {

		// Try {

		const response = await fetchOMDB( name )

		return reconcileMovieMeta( mid, response )

		// } catch ( error ) {

		// 	// TODO ERRORS

		// 	return logger.log( `${strings.error.omdb}: ${error}` )

		// }

	}

	const jobTMDB = async () => {

		// TODO Uncomment
		// try {

		const response = await fetchTMDB( name, year )
		// Add movie genres
		for ( const gid of response.genre_ids ) {

			indexMovieGenre( gid, mid )

		}

		return reconcileMovieMeta( mid, response )

		// } catch ( error ) {

		// 	// TODO ERRORS

		// 	return logger.log( `${strings.error.tmdb}: ${error}` )

		// }

	}

	const jobTrailer = async () => {

		try {

			const response = await fetchTrailer( name, year )
			const movie = getMovieById( mid )

			if ( movie ) {

				movie.trailers = response

			}

			updateMovie( mid, movie )

			return response

		} catch ( error ) {

			return logger.log( `${strings.error.trailer}: ${error}` )

		}

	}

	jobOMDB.id = `OMDB: ${name}`
	jobTMDB.id = `TMDB: ${name}`
	jobTrailer.id = `Trailer: ${name}`

	q.push( jobOMDB )
	q.push( jobTMDB )
	q.push( jobTrailer )

}

const fetchOMDB = name => {

	return new Promise( ( resolve, reject ) => {

		omdbApi.get(
			{
				apiKey: config.OMDB_KEY,
				title: name,
				plot: config.PLOT_LENGTH === 'short' ? 'short' : 'full'
			},
			async ( error, res ) => {

				// Process meta
				if ( error && !res ) {

					return reject( error )

				}

				// Toss any "N/A" response
				for ( const key of Object.keys( res ) ) {

					if ( res[key] === 'N/A' ) {

						res[key] = null

					}

				}

				// Strip runtime non-digit characters
				res.runtime = parseInt(
					res.Runtime && res.Runtime.replace( /\D/g, '' ),
					10
				)
				res.poster = res.Poster
				res.year = res.Year
				res.imdbId = res.imdbID
				res.plot = res.Plot
				res.poster = res.Poster
				res.releaseDate = Date.parse( res.Released )
				res.title = res.Title
				res.ratings = []

				// TODO Remove this unless it actually helps
				// Arrays of the ratings :|
				if ( res.imdbRating ) {

					res.ratings.push( {
						name: 'IMDB',
						score: parseFloat( res.imdbRating ),
						count: arrayOfNElements( res.imdbRating )
					} )

				}

				if ( res.Metascore ) {

					res.ratings.push( {
						name: 'Metascore',
						score: res.Metascore / 10,
						count: arrayOfNElements( res.Metascore / 10 )
					} )

				}

				// TODO remove info and intel after flattening
				const keys = Object.keys( res )
				res.intel = {}
				for ( const key of keys ) {

					res.intel[key] = res[key]

				}

				return resolve( res )

			}
		)

	} )

}

const fetchTMDB = async ( name, year ) => {

	const response = await movieInfo( name, year )

	response.ratings = []

	if ( response.vote_average ) {

		response.ratings.push( {
			name: 'TMDB',
			score: parseFloat( response.vote_average ),
			count: arrayOfNElements( response.vote_average )
		} )

	}

	response.plot = response.overview
	response.releaseDate = Date.parse( response.release_date )
	response.year = response.Year

	response.backdrop =
		config.IMDB_ENDPOINT + config.BACKDROP_SIZE + response.backdrop_path
	response.poster = config.IMDB_ENDPOINT + config.POSTER_SIZE + response.poster_path

	// TODO remove info and intel after flattening
	const keys = Object.keys( response )
	response.info = {}

	for ( const key of keys ) {

		response.info[key] = response[key]

	}

	return response

}

const fetchTrailer = ( name, year ) => {

	return movieTrailer( name, {
		year,
		id: true,
		multi: true
	} )

}

const arrayOfNElements = num => {

	// Create an array of empty elements with length n
	return new Array( Math.round( num ) ).map( () => {

		return {}

	} )

}

const reconcileMovieMeta = ( mid, meta ) => {

	const movie = getMovieById( mid )
	if ( movie ) {

		// Merge objects and preserve: plot, poster, releaseDate, year
		Object.assign(
			movie,
			meta,
			{ ratings: [ ...movie.ratings, ...meta.ratings ] },
			{ plot: movie.plot || meta.plot },
			{ poster: movie.poster || meta.poster },
			{ releaseDate: movie.releaseDate || meta.releaseDate },
			{ year: movie.year || meta.year }
		)
		updateMovie( mid, movie )

		return movie

	}

	return meta

}
