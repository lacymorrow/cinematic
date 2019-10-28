/* global Meteor */

'use strict'

import fs from 'fs'
import path from 'path'

import open from 'open'
import fetch from 'isomorphic-fetch'
import parseTorrentName from 'parse-torrent-name'

import {config} from '../imports/config'
import {broadcast, epoch, parseName} from '../imports/startup/both/util'
import {getOSMediaPath} from '../imports/startup/server/util'
import {fetchMeta, fetchOMDB, fetchTMDB, fetchTrailer} from '../imports/startup/server/services'
import {

	Movies, Genres, Recent, MovieCache, Watched, State,
	getState,
	initState,

	indexGenre,
	indexMovieGenre,

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
				fetchMeta(mid, name, year)
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
