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
import {broadcast, epoch, isDigit, prettyName} from '../imports/startup/both/util'
import {defaultMeta, getOSMediaPath, isDirectory, ignorePattern, regexPattern} from '../imports/startup/server/util'
import {fetchMeta, initGenreCache, resetQueue} from '../imports/startup/server/services'
import {
	initState,
	getState,
	updateState,

	addMovie,
	addRecent,
	addWatched,

	getCachedMovie,
	indexMovieGenre,

	randomizeMovies,
	resetMovies,
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
	scanPath()
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

const scanPath = () => {
	const {dir} = getState()
	if (isDirectory(dir)) {
		resetMovies()
		updateState({dir})
		scanDir(dir, 0)
	} else {
		broadcast('Error: Path is not a directory.')
	}
}

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
	const {name, year} = parseFilename(path.basename(file, ext))

	if (name !== ext && !ignorePattern(name)) {
		const key = path.join(dirPath, file)
		const movc = getCachedMovie(key)
		if (
			movc &&
            config.CACHE_TIMEOUT &&
            epoch() < movc.cached_at + config.CACHE_TIMEOUT
		) {
			// Cached
			broadcast(`Loading cached movie ${name}`)
			addMovie(movc.movie)
			movc.movie.info.genre_ids.forEach(e => {
				indexMovieGenre(e, movc.movie._id)
			})
		} else {
			// Not cached
			const movie = Object.assign(defaultMeta, {
				ext,
				file,
				name,
				filepath: dirPath,
				year,
				release_date: year,
				title: name
			})

			const mid = addMovie(movie)

			// Make api calls to gather info
			fetchMeta(mid, name, year)
		}
	}
}

const parseFilename = filename => {
	const meta = {name: filename, year: null}
	switch (config.PARSE_METHOD) {
		case 'regex': {
			const match = regexPattern.exec(filename)
			if (match) {
				meta.name = unescape(match[1])
				if (match.length > 1 && isDigit(match[3])) {
					meta.year = match[3]
				}
			}

			break
		}

		case 'parse':
		default: {
			if (filename === '.') {
				return
			}

			const parsedMeta = parseTorrentName(filename)
			Object.assign(meta, {
				name: prettyName(parsedMeta.title),
				year: parsedMeta.year || null
			})

			break
		}
	}

	return meta
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
	handleBrowseDialog(files) {
		// Broadcast
		files.forEach(e => {
			scanFile(e.name)
		})
	},
	handleConfirmPath() {
		scanPath()
	},
	handleOpenFile(file) {
		broadcast('Cinematic: Opening ' + file.filepath)
		addWatched(file.mid)
		open('file://' + file.filepath)
	},
	handleRandom() {
		randomizeMovies()
	},
	handleRefresh() {
		reset()
	},
	handleViewMovie(mid) {
		addRecent(mid)
	}
})
