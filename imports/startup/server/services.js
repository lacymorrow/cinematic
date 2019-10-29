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

const q = queue({
	autostart: true,
	concurrency: config.MAX_CONNECTIONS,
	timeout: 5000,
	results: []
})

// On every job finish
q.on('success', (result, job) => {
	// Change loading bar when queue updates
	const {queueTotal} = getState()
	console.log('success!!', queueTotal, q.length)

	if (q.length === 0) {
		setState({loading: 0})
		if (config.CACHE_TIMEOUT) {
			// Loading has finished, update cache
			refreshMovieCache()
		}
	} else {
		setState({loading: Math.round(q.length / queueTotal * 100)})
	}
})

q.on('end', () => {
	console.log('Queue finished.')
	setState({loading: 0})
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

	// Plot release-date year poster

	// Updates to gather
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
			res.Runtime = res.Runtime && res.Runtime.replace(/\D/g, '')
			res.poster = res.Poster
			res.year = res.Year
			res.imdb_id = res.imdbID
			res.plot = res.Plot
			res.poster = res.Poster
			res.release_date = Date.parse(res.Released)
			res.title = res.Title
			res.ratings = []

			if (res.imdbRating) {
				res.ratings.push({
					name: 'IMDB RATING',
					score: parseFloat(res.imdbRating),
					count: countToArray(res.imdbRating)
				})
			}

			if (res.Metascore) {
				res.ratings.push({
					name: 'METASCORE RATING',
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
					name: 'TMDB RATING',
					score: parseFloat(res.vote_average),
					count: countToArray(res.vote_average)
				})
			}

			res.plot = res.overview
			res.release_date = Date.parse(res.release_date)
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
		multi: true
	})
		.then(res => {
			return res.map(e => {
				return getYoutubeId(e)
			})
		})
}

const countToArray = num => {
	return Array.apply(
		null,
		new Array(Math.round(num))
	).map(() => {
		return {}
	})
}

const getYoutubeId = url => {
	// If a URL, strip and return video ID
	if (url.indexOf('/' > -1)) {
		return url.split('=').pop()
	}

	return url
}

const reconcileMovieMeta = (mid, meta) => {
	const movie = getMovieById(mid)
	movie.ratings = [...movie.ratings, ...meta.ratings]
	Object.assign(
		movie,
		meta,
		{plot: movie.plot || meta.plot},
		{poster: movie.poster || meta.poster},
		{release_date: movie.release_date || meta.release_date},
		{year: movie.year || meta.year},
	)
	updateMovie(mid, movie)
	return movie
}
