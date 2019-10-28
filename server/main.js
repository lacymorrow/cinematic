/* global Meteor */

'use strict'

// TODO:
// Loading bar
// Ignore pattern uses regex

import fs from 'fs'
import path from 'path'

import open from 'open'
import fetch from 'isomorphic-fetch'
import parseTorrentName from 'parse-torrent-name'

import {config} from '../imports/config'
import {broadcast, epoch, prettyName} from '../imports/startup/both/util'
import {getOSMediaPath, isDirectory, regexPattern} from '../imports/startup/server/util'
import {fetchMeta, initGenreCache, resetQueue} from '../imports/startup/server/services'
import {

	Movies, Genres, Recent, MovieCache, Watched, State,
	initState,
	getState,
	updateState,

	indexGenre,
	indexMovieGenre,

	getMovies,
	getMovieById,
	getMovieByFile,
	updateMovie,
	updateMovieTrailer,
	randomizeMovies,
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
	broadcast('Using ' + dir + ' as media dir.')

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

const scanDir = (dirPath, recurseDepth) => {
	// Read from filesystem
	const files = fs.readdirSync(dirPath)
	files.forEach(file => {
		const ext = path.extname(file)
		if (file.indexOf('.') === 0) {
			// Skip dotfiles
			return false
		}

		if (ext) {
			// File
			if (config.VALID_TYPES.includes(ext)) {
				scanFile({dirPath, file, ext})
			} else {
				broadcast(`Warning: File ${file} not valid.`)
			}
		} else if (isDirectory(dirPath) && recurseDepth < config.SCAN_DEPTH) {
			scanDir(path.join(dirPath, file, '/'), recurseDepth + 1)
		}
	}) // End file scan forEach
}

const scanFile = options => {
	const {file, ext, dirPath} = options
	console.log(file, ext)
	switch (config.PARSE_METHOD) {
		case 'regex': {
			let match = regexPattern.exec(path.basename(file, ext))
			let name = (year = null)
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

			break;
		}
		case 'parse': {}
		default: {
			const fileName = file.substr(0, file.length - ext.length)
			if (fileName === '.') {
				return
			}

			const parsedName = parseTorrentName(
				file.substr(0, file.length - ext.length)
			)
			var name = parsedName.title ? parsedName.title : fileName
			name = prettyName(name)
			var year = parsedName.year ? parsedName.year : null
			break;

		}
	}

	if (
		name &&
        name !== ext &&
        !config.IGNORE_PATTERN.includes(name.toLowerCase())
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
				ext,
				file,
				name,
				filepath: dirPath,
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
}

const reset = () => {
	// Reset and init state
	broadcast('Cinematic: Resetting server...')
	resetDB()
	resetQueue()

	// Restart
	setup()
	start()
}

// Server-side methods exposed to the client
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

	},
	handleBrowseDialog(files) {
		// Broadcast
		for (let i = files.length - 1; i >= 0; i--) {
			Meteor.call('addMovie', files[i].name)
		}
	},
	handleOpenFile(file) {
		broadcast('Cinematic: Opening ' + file)
		open('file://' + file)
	},
	async scanPath() {
		const {dir} = getState()
		if (isDirectory(dir)) {
			resetMovies()
			updateState({dir})
			scanDir(dir, 0)
		} else {
			broadcast('Error: Path is not a directory.')
		}
	},
	handleRandom() {
		randomizeMovies()
	},
	handleRefresh() {
		reset()
	}
})
