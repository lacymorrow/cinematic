/* global Meteor */

'use strict'

import fs from 'fs'
import path from 'path'
import open from 'open'
import fetch from 'isomorphic-fetch'
import omdbApi from 'omdb-client'
import movieInfo from 'movie-info'
import movieTrailer from 'movie-trailer'
import parseTorrentName from 'parse-torrent-name'

import {config} from '../imports/config'
import {broadcast, epoch, parseName} from '../imports/startup/both/util'
import {getOSMediaPath} from '../imports/startup/server/util'
import {

	Movies, Genres, Recent, MovieCache, Watched, State,
	getState,
	initState,

	addGenre,
	getGenre,
	updateGenre,

	getMovies,
	getMovieById,
	getMovieByFile,
	updateMovie,
	updateMovieTrailer,
	resetMovies,

	refreshMovieCache,
	resetDB
} from '../imports/startup/server/database'

const setupFromState = () => {
	broadcast('Starting from previous state.')
	const state = getState()
	// If genre cache is expired, update genres
	if (
		!config.CACHE_TIMEOUT ||
        !state.genreCacheTimestamp ||
        !(epoch() < state.genreCacheTimestamp + config.CACHE_TIMEOUT)
	) {
		broadcast('Cinematic: Cache invalid. Fetching genres for cache.')
		initGenreCache()
	}
}

const setup = () => {
	// Set default path
	const dir = getOSMediaPath()
	broadcast('Cinematic: Using ' + dir + ' as movie directory')

	initState({dir})

	// Grab genre list
	initGenreCache()
}

const start = () => {
	Meteor.call('scanPath')
}

// Server globals
// startup functions
Meteor.startup(() => {
	// Todo: remove
	// Setup db - optionally clear movies, log, and path
	resetMovies()

	// Welcome message
	broadcast('\n----- Cinematic -----')

	// TODO: save current dir to store and retrieve on startup

	// Set up state - our redneck appcache

	if (getState()) {
		setupFromState()
	} else {
		// Reset
		setup()
	}

	start()
}) // End startup

// Create or update genre name
const indexGenre = (id, name) => {
	const genre = getGenre(id)
	if (genre) {
		updateGenre(id, {name})
	} else {
		addGenre(id, {name})
	}
}

// Create or update genre and pin a movie to genre
const indexMovieGenre = (id, mid) => {
	const genre = getGenre(id)
	if (genre) {
		// Genre is not guaranteed to have .items
		const items = genre.items || []
		items.push(mid)
		updateGenre(id, {items})
	} else {
		addGenre(id, {name, items: [mid]})
	}
}

const getIntel = (mid, name, year) => {
	// Updates to gather
	const jobs = [
		updateInfo,
		updateIntel,
		updateTrailer
	]
	_.map(jobs, job => {
		apiQueue += 1
		apiTotal += 1
		queueIt(job, mid, name, year, (
			err,
			res
		) => {
			if (err) {
				broadcast('Cinematic/getIntel: ' + err)
			}
		})
	})
}

const populateMovies = (dirPath, recurse_level) => {
	try {
		// Start loading bar
		State.update('0', {$set: {loading: 100}})

		// Read from filesystem
		const files = fs.readdirSync(dirPath)
		files.forEach((file, i) => {
			const ex = path.extname(file)
			if (
				ex &&
                _.contains(config.VALID_TYPES, ex.toLowerCase())
			) {
				// Found a movie!
				// this is where the magic happens
				Meteor.call('addMovie', file, {
					dirPath,
					ext: ex
				})
			} else if (recurse_level < config.SCAN_DEPTH) {
				// Ok let's try recursing, were avoiding as many fs calls as possible
				// which is why i didn't call it in the condition above
				// first, is this a directory?
				fs.lstat(
					dirPath + file,
					Meteor.bindEnvironment((err, stats) => {
						if (err) {
							broadcast(
								'fs error: ' + name + ': ' + err,
								true
							)
							return false
						}

						if (stats.isDirectory()) {
							populateMovies(
								dirPath + file + '/',
								recurse_level + 1
							)
						}
					})
				)
			}

			const state = State.findOne({_id: '0'})
			// Invert percentage (0 is done, 100% complete, false, off; 100 is 0% complete)
			const loaded = state && 100 - state.loading
		}) // End file scan forEach

		if (apiQueue === 0) {
			State.update('0', {$set: {loading: 0}})
		}
	} catch (error) {
		broadcast(
			'Error populating movies. ' + error.name + ' ' + error.message,
			true
		)
	}
}

const initGenreCache = async () => {
	Genres.remove({})
	try {
		const response = await fetch(`${config.GENRE_ENDPOINT}?api_key=${config.TMDB_KEY}`)
		const res = await response.json()
		res.genres.forEach(genre => {
			broadcast(genre)
			indexGenre(genre.id, genre.name)
		})
		State.update('0', {$set: {genreCacheTimestamp: epoch()}})
	} catch (error) {
		broadcast(`Cinematic/initGenreCache: ${error}`)
	}
}

const updateIntel = (mid, name, year) => {
	omdbApi.get({
		omdb_key: config.OMDB_KEY,
		apiKey: config.OMDB_KEY,
		title: name,
		plot: config.PLOT_LENGTH === 'short' ? 'short' : 'full'
	},
	Meteor.bindEnvironment((err, res) => {
		queueDone('updateIntel')
		if (err) {
			broadcast(
				'ombd-client error: ' + name + ': ' + err,
				true
			)
			return false
		}

		// Strip runtime characters
		res.Runtime = res.Runtime.replace(/\D/g, '')
		// Toss any "N/A" response
		for (const key in res) {
			if (res[key] == 'N/A') {
				res[key] = null
			}
		}

		// Lets parse this shit proper
		const mov = getMovieById(mid)

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

		mov.imdb_id = res.imdbID
		mov.plot = res.Plot
		mov.poster = res.Poster
		mov.release_date = Date.parse(res.Released)
		mov.title = res.Title
		if (!mov.poster) {
			mov.poster = res.Poster
		}

		if (!mov.year) {
			mov.year = res.Year
		}

		mov.intel = res
		mov.cached = true // WE CACHE HALF-LOADED FILES. BAD? PROBABLY
		updateMovie(mid, mov)
	})
	)
}

const updateInfo = (mid, name, year) => {
	movieInfo(
		name,
		year,
		Meteor.bindEnvironment((err, res) => {
			queueDone('updateInfo')
			if (err) {
				broadcast(
					'movie-info error: ' + name + ': ' + err,
					true
				)
				return false
			}

			_.each(res.genre_ids, (e, i) => {
				indexMovieGenre(e, mid)
			})
			// Lets parse this shit proper
			const mov = getMovieById(mid)
			res.backdrop =
                config.IMDB_ENDPOINT +
                config.BACKDROP_SIZE +
                res.backdrop_path
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

			mov.imdb_id = res.imdb_id
			mov.poster =
                config.IMDB_ENDPOINT +
                config.POSTER_SIZE +
                res.poster_path
			mov.title = res.title
			if (!mov.plot) {
				mov.plot = res.overview
			}

			if (!mov.release_date) {
				mov.release_date = Date.parse(res.release_date)
			}

			if (!mov.year) {
				mov.year = res.Year
			}

			mov.info = res
			mov.cached = true // WE CACHE HALF-LOADED FILES. BAD? PROBABLY
			updateMovie(mid, mov)
		})
	)
}

const updateTrailer = (mid, name, year) => {
	movieTrailer(
		name, {
			year,
			multi: true
		},
		Meteor.bindEnvironment((err, res) => {
			queueDone('updateTrailer')
			if (err) {
				broadcast(
					'movie-trailer error: ' + name + ': ' + err,
					true
				)
				return false
			}

			updateMovieTrailer(mid, res)
		})
	)
}

const queueIt = (job, mid, name, year) => {
	if (apiCurrent >= config.MAX_CONNECTIONS) {
		// Too many concurrent connections
		Meteor.setTimeout(() => {
			queueIt(job, mid, name, year, (
				err,
				res
			) => {
				if (err) {
					broadcast('Cinematic/queueIt/retryError: ' + err)
				}
			})
		}, config.RETRY_DELAY)
	} else {
		apiCurrent += 1
		job.call(this, mid, name, year, err => {
			if (err) {
				broadcast('Cinematic/queueIt/jobError: ' + err)
			}
		})
	}
}

const queueDone = job => {
	apiCurrent -= 1
	apiQueue -= 1
	// Update loading percent every set
	if (apiQueue === 0) {
		State.update('0', {$set: {loading: 0}})
		if (config.CACHE_TIMEOUT) {
			refreshMovieCache()
		}
	} else if (apiQueue % config.MAX_CONNECTIONS === 0) {
		State.update('0', {
			$set: {loading: Math.round(apiQueue / apiTotal * 100)}
		})
	}
}

// Number of concurrent api connections; currently doesn't distinguish between different api source limits
// total, number left to process, currently processing
let apiTotal = 0
let apiQueue = 0
let apiCurrent = 0

// Server-side methods
Meteor.methods({
	addRecent(mid) {
		const time = epoch()
		Recent.upsert({_id: mid}, {time})
		Movies.update({_id: mid}, {$set: {recentTime: time}})
	},
	addWatched(mid) {
		const time = epoch()
		Watched.upsert({_id: mid}, {time})
		Movies.update({_id: mid}, {$set: {watchedTime: time}})
	},
	addMovie(file, options) {
		// Set options
		options = options ? options : {}
		const ex = options.ext ?
			options.ext :
			file
				.split('.')
				.pop()
				.toLowerCase()
		const dirPath = options.dirPath ? options.dirPath : false

		const time = epoch()
		if (config.PARSE_METHOD === 'regex') {
			const regex = /^(.*?)(?:\[? ([\d]{4})?\]?|\(?([\d]{4})?\)?)$/g
			const match = regex.exec(path.basename(file, ex))
			var name = (year = null)
			if (match) {
				name = unescape(match[1])
				if (
					match.length > 1 &&
                    !isNaN(parseFloat(match[3])) &&
                    isFinite(match[3])
				) {
					year = match[3]
				}
			}
		} else {
			const fileName = file.substr(0, file.length - ex.length)
			if (fileName == '.') {
				return
			}

			const parsedName = parseTorrentName(
				file.substr(0, file.length - ex.length)
			)
			var name = parsedName.title ? parsedName.title : fileName
			name = parseName(name)
			var year = parsedName.year ? parsedName.year : null
		}

		if (
			name &&
            name != ex &&
            !_.contains(config.IGNORE_LIST, name.toLowerCase())
		) {
			// Cache handling
			const hash = dirPath + file
			const movc = MovieCache.findOne({_id: hash})
			if (
				movc &&
                movc.cached &&
                config.CACHE_TIMEOUT &&
                movc.movie &&
                time < movc.cache_date + config.CACHE_TIMEOUT
			) {
				// Cached
				broadcast('Cinematic: Loading cached movie ' + name)
				var mid = movc.movie._id
				Movies.insert(movc.movie)
				_.each(movc.movie.info.genre_ids, (e, i) => {
					indexMovieGenre(e, mid)
				})
			} else {
				// Not cached
				// add item to collection
				var mid = Movies.insert({
					ext: ex,
					file,
					name,
					path: dirPath,
					year,
					ratings: [],
					trailer: null,
					seed: Math.random(),
					recentTime: null,
					watchedTime: null,
					info: {
						adult: false,
						backdrop: null,
						backdrop_path: null,
						genre_ids: [],
						imdb_id: null,
						original_title: null,
						overview: null,
						popularity: null,
						poster_path: null,
						release_date: year,
						tagline: null,
						title: null,
						vote_average: null
					},
					intel: {
						Actors: null,
						Awards: null,
						Country: null,
						Director: null,
						Genre: null,
						Language: null,
						Metascore: null,
						Plot: null,
						Poster: null,
						Rated: null,
						Released: null,
						Runtime: null,
						Title: null,
						Type: null,
						Writer: null,
						Year: null,
						imdbID: null,
						imdbRating: null
					},
					// Combined info
					imdb_id: null,
					plot: null,
					poster: null,
					release_date: year,
					title: name,
					cached: false
				})
				// Make api calls to gather info
				getIntel(mid, name, year)
			}
		}
	},
	openFile(file) {
		broadcast('Cinematic: Opening ' + file)
		open('file://' + file)
	},
	scanPath() {
		const path = getState().dir
		try {
			if (fs.existsSync(path) && fs.statSync(path).isDirectory()) {
				Movies.remove({})
				State.update('0', {$set: {path}})
			} else {
				throw new Error('Error: Path is not a directory.')
			}

			populateMovies(path, 0)
		} catch (error) {
			broadcast(
				'Error getting path. ' + error.name + ' ' + error.message,
				true
			)
		}
	},
	updateRandom() {
		const seeds = Movies.find({}, {fields: {seed: 1}})
		seeds.forEach(seed => {
			Movies.update(seed._id, {$set: {seed: Math.random()}})
		})
	},
	reset() {
		// Reset and init state
		broadcast('Cinematic: Resetting server...')
		resetDB()

		// Restart
		setup()
		start()
	}
})
