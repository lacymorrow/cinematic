/* global Meteor, Mongo */

'use strict'

import fs from 'fs'
import os from 'os'
import path from 'path'
import open from 'open'
import omdbApi from 'omdb-client'
import movieInfo from 'movie-info'
import movieTrailer from 'movie-trailer'
import parseTorrentName from 'parse-torrent-name'

import {config} from '../imports/config'

const Log = new Mongo.Collection('log')
const State = new Mongo.Collection('state')
const Recent = new Mongo.Collection('recent')
const Watched = new Mongo.Collection('watched')
const Genres = new Mongo.Collection('genres')
const Movies = new Mongo.Collection('movies')
const MovieCache = new Mongo.Collection('movieCache')

const getOSMediaPath = () => {
	// Get default media directory. Fetches ~/movies, ~/videos, ~

	let home = os.homedir()
	if (home.slice(-1) != '/') {
		home += '/'
	}

	let dir = home
	const files = fs.readdirSync(home)
	files.forEach((file, i) => {
		const stats = fs.lstatSync(home + file)
		if (
			stats.isDirectory() &&
            (file.toLowerCase().includes('movies') ||
                file.toLowerCase().includes('videos'))
		) {
			dir = home + file + '/'
		}
	})
	return dir
}

const epoch = function () {
	const d = new Date()
	return d.getTime() / 1000
}

const replaceAll = function (str, find, replace) {
	return str.replace(new RegExp(find, 'g'), replace)
}

const parseName = function (name) {
	name = replaceAll(name, '_', ' ') // Replace underscores with spaces
	name = replaceAll(name, '-', ' ')
	return name
}

// Safe console.log which outputs in the called context - client/server
const broadcast = function (msg, err) {
	if (err === true) {
		// Log error
	}

	Log.insert({time: epoch(), msg: (msg || err), error: Boolean(err)})
	if (typeof console !== 'undefined') {
		console.log(msg)
	}
}

const startupFromCache = () => {
	const state = State.findOne({_id: '0'})
	// If genre cache is expired, update genres
	if (
		config.CACHE_TIMEOUT &&
        state.genreCacheTimestamp &&
        epoch() < state.genreCacheTimestamp + config.CACHE_TIMEOUT
	) {
		broadcast('Cinematic: Loading cached genre list.')
	} else {
		broadcast('Cinematic: Updating genre cache.')
		Meteor.call('syncGenreCache')
	}

	startup()
}

const startup = () => {

}

// Define observable collections
Meteor.publish('log', () => {
	return Log.find()
})
Meteor.publish('state', () => {
	return State.find()
})
Meteor.publish('recent', () => {
	return Recent.find()
})
Meteor.publish('watched', () => {
	return Watched.find()
})
Meteor.publish('genres', () => {
	return Genres.find()
})
Meteor.publish('movies', () => {
	return Movies.find()
})
Meteor.publish('movieCache', () => {
	return MovieCache.find()
})

// Server globals
// startup functions
Meteor.startup(() => {
	// Setup db - optionally clear movies, log, and path
	Log.remove({})
	Movies.remove({})

	// Welcome message
	broadcast('\n----- Cinematic -----')

	// Set default path
	const dir = getOSMediaPath()
	broadcast('Cinematic: Using ' + dir + ' as movie directory')

	// TODO: save current dir to store and retrieve on startup

	// Set up state - our redneck appcache

	if (State.findOne({_id: '0'})) {
		startupFromCache()
	} else {
		State.insert({
			_id: '0', // There can be only one...
			path: dir,
			cwd: process.env.PWD
		})
		startup()
	}

	// Initial update
	Meteor.call('updatePath', dir)
}) // End startup

// number of concurrent api connections; currently doesn't distinguish between different api source limits
// total, number left to process, currently processing
let api_total = 0
let api_queue = 0
let api_current = 0

// Server-side methods
Meteor.methods({
	addGenre(gid, mid, name) {
		const id = String(gid)
		const genre = Genres.findOne({_id: id})
		if (genre && name) {
			Genres.update(id, {$set: {name}})
		} else if (genre && mid) {
			const items = genre.items || []
			items.push(mid)
			Genres.update(id, {$set: {items}})
		} else if (name) {
			Genres.insert({_id: id, id: gid, name})
		} else if (mid) {
			Genres.insert({_id: id, id: gid, name, items: [mid]})
		}
	},
	addRecent(mid) {
		const time = epoch()
		Recent.upsert({_id: mid}, {time})
		Movies.update({_id: mid}, {$set: {recent_time: time}})
	},
	addWatched(mid) {
		const time = epoch()
		Watched.upsert({_id: mid}, {time})
		Movies.update({_id: mid}, {$set: {watched_time: time}})
	},
	addMovie(file, options) {
		// Set options
		var options = options ? options : {}
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
					Meteor.call('addGenre', e, mid, null)
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
					recent_time: null,
					watched_time: null,
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
				Meteor.call('getIntel', mid, name, year)
			}
		}
	},
	cacheMovies() {
		const movies = Movies.find()
		const time = epoch()
		movies.forEach(movie => {
			movie.cache_date = epoch()
			MovieCache.upsert({_id: movie.path + movie.file}, {cache_date: time, movie})
		})
		State.update('0', {$set: {cache_movies: time}})
	},
	cacheMovie(file) {
		const mov = Movies.findOne({file})
		mov.cache_date = epoch()
		// Only cache if it loaded properly
		if (mov && mov.intel.Title && mov.info.title) {
			MovieCache.insert(mov)
		}
	},
	directorySearch(output) {
		broadcast('Server adding files:' + '\n' + output)
	},
	getIntel(mid, name, year) {
		// Updates to gather
		const jobs = [
			'updateTrailer', // We call trailer first, because we cache as soon as we get any info; if program stops before all info loaded, still cached
			'updateIntel',
			'updateInfo'
		]
		_.map(jobs, job => {
			api_queue += 1
			api_total += 1
			Meteor.call('queueIt', job, mid, name, year, (
				err,
				res
			) => {
				if (err) {
					broadcast('Cinematic/getIntel: ' + err)
				}
			})
		})
	},
	openFile(file) {
		broadcast('Cinematic: Opening ' + file)
		open('file://' + file)
	},
	populateMovies(dirPath, recurse_level) {
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
								Meteor.call(
									'populateMovies',
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

			if (api_queue === 0) {
				State.update('0', {$set: {loading: 0}})
			}
		} catch (error) {
			broadcast(
				'Error populating movies. ' + error.name + ' ' + error.message,
				true
			)
		}
	},
	updatePath(path) {
		try {
			if (fs.existsSync(path) && fs.statSync(path).isDirectory()) {
				Movies.remove({})
				State.update('0', {$set: {path}})
			} else {
				throw new Error('Error: Path is not a directory.')
			}

			Meteor.call('populateMovies', path, 0)
		} catch (error) {
			broadcast(
				'Error getting path. ' + error.name + ' ' + error.message,
				true
			)
		}
	},
	syncGenreCache: async () => {
		Genres.remove({})
		try {
			const response = await fetch(`${config.GENRE_ENDPOINT}?api_key=${config.TMDB_KEY}`);
			const res = await response.json()
			res.data.genres.forEach(genre => {
				Meteor.call('addGenre', genre.id, null, genre.name)
			})
			State.update('0', {$set: {genreCacheTimestamp: epoch()}})
		} catch (error) {
			broadcast(`Cinematic/syncGenreCache: ${error}`)
		}
	},
	updateIntel(mid, name, year) {
		omdbApi.get({
			omdb_key: config.OMDB_KEY,
			apiKey: config.OMDB_KEY,
			title: name,
			plot: config.PLOT_LENGTH === 'short' ? 'short' : 'full'
		},
		Meteor.bindEnvironment((err, res) => {
			Meteor.call('queueDone', 'updateIntel')
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
			const mov = Movies.findOne({_id: mid})
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
			Movies.update(mid, mov)
		})
		)
	},
	updateInfo(mid, name, year) {
		movieInfo(
			name,
			year,
			Meteor.bindEnvironment((err, res) => {
				Meteor.call('queueDone', 'updateInfo')
				if (err) {
					broadcast(
						'movie-info error: ' + name + ': ' + err,
						true
					)
					return false
				}

				_.each(res.genre_ids, (e, i) => {
					Meteor.call('addGenre', e, mid, null)
				})
				// Lets parse this shit proper
				const mov = Movies.findOne({_id: mid})
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
				Movies.update(mid, mov)
			})
		)
	},
	updateTrailer(mid, name, year) {
		movieTrailer(
			name, {
				year,
				multi: true
			},
			Meteor.bindEnvironment((err, res) => {
				Meteor.call('queueDone', 'updateTrailer')
				if (err) {
					broadcast(
						'movie-trailer error: ' + name + ': ' + err,
						true
					)
					return false
				}

				Movies.update(mid, {$set: {trailer: res}})
			})
		)
	},
	updateRandom() {
		const seeds = Movies.find({}, {fields: {seed: 1}})
		seeds.forEach(seed => {
			Movies.update(seed._id, {$set: {seed: Math.random()}})
		})
	},
	queueIt(job, mid, name, year) {
		if (api_current >= config.MAX_CONNECTIONS) {
			// Too many concurrent connections
			Meteor.setTimeout(() => {
				Meteor.call('queueIt', job, mid, name, year, (
					err,
					res
				) => {
					if (err) {
						broadcast('Cinematic/queueIt/retryError: ' + err)
					}
				})
			}, config.RETRY_DELAY)
		} else {
			api_current += 1
			Meteor.call(job, mid, name, year, (err, res) => {
				if (err) {
					broadcast('Cinematic/queueIt/jobError: ' + err)
				}
			})
		}
	},
	queueDone(job) {
		api_current -= 1
		api_queue -= 1
		// Update loading percent every set
		if (api_queue === 0) {
			State.update('0', {$set: {loading: 0}})
			if (config.CACHE_TIMEOUT) {
				Meteor.call('cacheMovies')
			}
		} else if (api_queue % config.MAX_CONNECTIONS === 0) {
			State.update('0', {
				$set: {loading: Math.round(api_queue / api_total * 100)}
			})
		}
	},
	reset() {
		broadcast('Cinematic: Resetting server...')
		State.remove({})
		Recent.remove({})
		Watched.remove({})
		Genres.remove({})
		Movies.remove({})
		MovieCache.remove({})

		// Set default path
		const dir = Meteor.call('getOSMediaPath')

		const time = epoch()
		const sid = State.insert({
			_id: '0',
			path: dir,
			cwd: process.env.PWD
		})

		// Grab genre list
		Meteor.call('syncGenreCache')

		// Initial update
		Meteor.call('updatePath', dir)
	}
})
