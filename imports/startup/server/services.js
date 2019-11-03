'use strict'

import queue from 'queue'
import movieInfo from 'movie-info'
import movieTrailer from 'movie-trailer'
import omdbApi from 'omdb-client'
import fetch from 'isomorphic-fetch'

import {config} from '../../config'
import {broadcast, epoch} from '../both/util'
import {
	indexGenre,
	indexMovieGenre,
	getState,
	setState,
	getMovieById,
	updateMovie,
	resetGenres,
	refreshMovieCache
} from './database'

// Create and start queue
const q = queue({
	autostart: true,
	concurrency: config.MAX_CONNECTIONS,
	timeout: 5000,
	results: []
})

// On every job finish
q.on('success', () => {
	// Change loading bar when queue updates
	const {queueTotal} = getState()
	setState({loading: Math.round(q.length / queueTotal * 100)})
})

q.on('end', () => {
	broadcast('Services queue completed.')
	setState({loading: 0})
	if (config.CACHE_TIMEOUT) {
		refreshMovieCache()
	}
})

export const resetQueue = () => {
	q.end()
}

export const initGenreCache = async () => {
	resetGenres()
	try {
		const response = await fetch(`${config.GENRE_ENDPOINT}?api_key=${config.TMDB_KEY}`)
		const res = await response.json()
		for (const genre of res.genres) {
			indexGenre(genre.id, genre.name)
		}

		setState({genreCacheTimestamp: epoch()})
	} catch (error) {
		broadcast(`Cinematic/initGenreCache: ${error}`)
	}
}

export const fetchMeta = (mid, name, year) => {
	const {queueTotal} = getState()
	setState({queueTotal: queueTotal + 3})

	// Queue API calls
	q.push(() => {
		return fetchOMDB(name)
			.then(res => {
				return reconcileMovieMeta(mid, res)
			})
			.catch(error => {
				return broadcast(`Error fetching OMDB meta: ${error}`)
			})
	})

	q.push(() => {
		return fetchTMDB(name, year)
			.then(res => {
				// Add movie genres
				for (const gid of res.genre_ids) {
					indexMovieGenre(gid, mid)
				}

				return reconcileMovieMeta(mid, res)
			})
			.catch(error => {
				return broadcast(`Error fetching TMDB meta: ${error}`)
			})
	})

	q.push(() => {
		return fetchTrailer(name, year)
			.then(res => {
				const movie = getMovieById(mid)
				movie.trailer = res
				updateMovie(mid, movie)
				return res
			})
			.catch(error => {
				return broadcast(`Error fetching trailer meta: ${error}`)
			})
	})
}

const fetchOMDB = name => {
	return new Promise((resolve, reject) => {
		omdbApi.get({
			omdb_key: config.OMDB_KEY,
			apiKey: config.OMDB_KEY,
			title: name,
			plot: config.PLOT_LENGTH === 'short' ? 'short' : 'full'
		}, async (error, res) => {
			// Process meta
			if (error && !res) {
				return reject(error)
			}

			// Toss any "N/A" response
			for (const key of Object.keys(res)) {
				if (res[key] === 'N/A') {
					res[key] = null
				}
			}

			// Strip runtime non-digit characters
			res.runtime = parseInt(res.Runtime && res.Runtime.replace(/\D/g, ''), 10)
			res.poster = res.Poster
			res.year = res.Year
			res.imdbId = res.imdbID
			res.plot = res.Plot
			res.poster = res.Poster
			res.releaseDate = Date.parse(res.Released)
			res.title = res.Title
			res.ratings = []

			if (res.imdbRating) {
				res.ratings.push({
					name: 'IMDB',
					score: parseFloat(res.imdbRating),
					count: countToArray(res.imdbRating)
				})
			}

			if (res.Metascore) {
				res.ratings.push({
					name: 'Metascore',
					score: res.Metascore / 10,
					count: countToArray(res.Metascore / 10)
				})
			}

			const keys = Object.keys(res)
			res.intel = {}
			for (const key of keys) {
				res.intel[key] = res[key]
			}

			return resolve(res)
		})
	})
}

const fetchTMDB = (name, year) => {
	return movieInfo(name, year)
		.then(res => {
			res.ratings = []

			if (res.vote_average) {
				res.ratings.push({
					name: 'TMDB',
					score: parseFloat(res.vote_average),
					count: countToArray(res.vote_average)
				})
			}

			res.plot = res.overview
			res.releaseDate = Date.parse(res.release_date)
			res.year = res.Year

			res.backdrop =
                config.IMDB_ENDPOINT +
                config.BACKDROP_SIZE +
                res.backdrop_path
			res.poster =
                config.IMDB_ENDPOINT +
                config.POSTER_SIZE +
                res.poster_path

			const keys = Object.keys(res)
			res.info = {}

			for (const key of keys) {
				res.info[key] = res[key]
			}

			return res
		})
}

const fetchTrailer = (name, year) => {
	return movieTrailer(name, {
		year,
		id: true,
		multi: true
	})
}

const countToArray = num => {
	// Create an array of empty elements with length n
	return new Array(Math.round(num)).map(() => {
		return {}
	})
}

const reconcileMovieMeta = (mid, meta) => {
	const movie = getMovieById(mid)

	// Merge objects and preserve: plot, poster, releaseDate, year
	Object.assign(
		movie,
		meta,
		{ratings: [...movie.ratings, ...meta.ratings]},
		{plot: movie.plot || meta.plot},
		{poster: movie.poster || meta.poster},
		{releaseDate: movie.releaseDate || meta.releaseDate},
		{year: movie.year || meta.year},
	)
	updateMovie(mid, movie)

	return movie
}
