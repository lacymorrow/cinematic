/* global _ */

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
	updateState,
	getMovieById,
	updateMovie,
	resetGenres,
	refreshMovieCache
} from './database'

const q = queue({
	autostart: true,
	concurrency: config.MAX_CONNECTIONS,
	timeout: 5000,
	results: []
})

export const resetQueue = () => {
	q.end()
}

export const initGenreCache = async () => {
	resetGenres()
	try {
		const response = await fetch(`${config.GENRE_ENDPOINT}?api_key=${config.TMDB_KEY}`)
		const res = await response.json()
		res.genres.forEach(genre => {
			indexGenre(genre.id, genre.name)
		})
		updateState({genreCacheTimestamp: epoch()})
	} catch (error) {
		broadcast(`Cinematic/initGenreCache: ${error}`)
	}
}

export const fetchMeta = (mid, name, year) => {
	const {queueTotal} = getState()
	updateState({queueTotal: queueTotal + 3})

	// Updates to gather
	q.push(() => {
		fetchOMDB(mid, name)
			.then(res => {
				updateMovie(mid, res)
			})
			.catch(error => {
				broadcast(`Error fetching OMDB meta: ${error}`)
			})
	})

	q.push(() => {
		fetchTMDB(mid, name, year)
			.then(res => {
				updateMovie(mid, res)
			})
			.catch(error => {
				broadcast(`Error fetching TMDB meta: ${error}`)
			})
	})
	q.push(() => {
		fetchTrailer(name, year)
			.then(res => {
				const movie = getMovieById(mid)
				movie.trailer = res
				updateMovie(mid, movie)
			})
			.catch(error => {
				broadcast(`Error fetching trailer meta: ${error}`)
			})
	})

	// On every job finish
	q.on('success', () => {
		// Change loading bar when queue updates
		const {queueTotal} = getState()

		if (q.length === 0) {
			updateState({loading: 0})
			if (config.CACHE_TIMEOUT) {
				// Loading has finished, update cache
				refreshMovieCache()
			}
		} else {
			updateState({loading: Math.round(q.length / queueTotal * 100)})
		}
	})
}

const fetchOMDB = (mid, name) => {
	return new Promise((resolve, reject) => {
		omdbApi.get({
			omdb_key: config.OMDB_KEY,
			apiKey: config.OMDB_KEY,
			title: name,
			plot: config.PLOT_LENGTH === 'short' ? 'short' : 'full'
		}, async (error, res) => {
			// Process meta
			if (error) {
				reject(error)
			}

			// Toss any "N/A" response
			for (const key in res) {
				if (Object.prototype.hasOwnProperty.call(res, key) && res[key] === 'N/A') {
					res[key] = null
				}
			}

			// Strip runtime characters
			res.Runtime = res.Runtime.replace(/\D/g, '')

			// Lets parse this shit proper
			const mov = await getMovieById(mid)

			if (res.imdbRating) {
				// TODO: SAFE GET .ratings
				mov.ratings.push({
					name: 'IMDB RATING',
					score: parseFloat(res.imdbRating),
					count: Array.apply(
						null,
						new Array(Math.round(res.imdbRating))
					).map(() => {
						return {}
					})
				})
			}

			if (res.Metascore) {
				mov.ratings.push({
					name: 'METASCORE RATING',
					score: res.Metascore / 10,
					count: Array.apply(
						null,
						new Array(Math.round(res.Metascore / 10))
					).map(() => {
						return {}
					})
				})
			}

			if (!mov.poster) {
				mov.poster = res.Poster
			}

			if (!mov.year) {
				mov.year = res.Year
			}

			mov.imdb_id = res.imdbID
			mov.plot = res.Plot
			mov.poster = res.Poster
			mov.release_date = Date.parse(res.Released)
			mov.title = res.Title
			mov.intel = res

			resolve(mov)
		})
	})
}

const fetchTMDB = (mid, name, year) => {
	return movieInfo(name, year)
		.then(res => {
			_.each(res.genre_ids, e => {
				indexMovieGenre(e, mid)
			})

			// Lets parse this shit proper
			const mov = getMovieById(mid)
			if (res.vote_average) {
				mov.ratings.push({
					name: 'TMDB RATING',
					score: parseFloat(res.vote_average),
					count: Array.apply(
						null,
						new Array(Math.round(res.vote_average))
					).map(() => {
						return {}
					})
				})
			}

			if (!mov.plot) {
				mov.plot = res.overview
			}

			if (!mov.release_date) {
				mov.release_date = Date.parse(res.release_date)
			}

			if (!mov.year) {
				mov.year = res.Year
			}

			mov.backdrop =
                config.IMDB_ENDPOINT +
                config.BACKDROP_SIZE +
                res.backdrop_path
			mov.poster =
                config.IMDB_ENDPOINT +
                config.POSTER_SIZE +
                res.poster_path
			mov.imdb_id = res.imdb_id
			mov.title = res.title
			mov.info = res

			return mov
		})
}

const fetchTrailer = (name, year) => {
	return movieTrailer(name, {
		year,
		multi: true
	})
		.then(res => {
			return res.map(e => {
				return getYoutubeId(e)
			})
		})
}

const getYoutubeId = url => {
	// If a URL, strip and return video ID
	if (url.indexOf('/' > -1)) {
		return url.split('=').pop()
	}

	return url
}
