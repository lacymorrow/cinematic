/* global Meteor */

'use strict'

import fs from 'fs'
import path from 'path'

import open from 'open'
import parseTorrentName from 'parse-torrent-name'

import {config} from '../imports/config'
import {broadcast, epoch, isDigit, prettyName} from '../imports/startup/both/util'
import {defaultMeta, getOSMediaPath, isDirectory, ignorePattern, regexPattern} from '../imports/startup/server/util'
import {fetchMeta, initGenreCache, resetQueue} from '../imports/startup/server/services'
import {
	initState,
	getState,
	setState,

	addMovie,
	addRecent,
	addWatched,

	getCachedMovie,
	indexMovieGenre,

	randomizeMovies,
	resetMovies,
	resetDB
} from '../imports/startup/server/database'

// Server globals
// startup functions
Meteor.startup(() => {
	// Setup db - optionally clear movies, log, and path
	resetMovies()

	// Welcome message
	broadcast('\n----- Cinematic -----')

	// Set up state - our redneck appcache

	if (getState()) {
		setupFromState()
	} else {
		// Reset
		setup()
	}

	start()
}) // End startup

const start = () => {
	scanPath()
}

const setup = () => {
	// Set default path
	const dir = getOSMediaPath()
	broadcast('Using ' + dir + ' as media dir.')

	initState({dir})

	// Grab genre list
	initGenreCache()
}

const setupFromState = () => {
	const state = getState()

	broadcast('Starting from previous state.')

	// Reset fleeting state
	setState({queueTotal: 0})

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

const scanPath = () => {
	const {dir} = getState()
	if (isDirectory(dir)) {
		resetMovies()
		setState({dir})
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
			if (config.VALID_FILETYPES.includes(ext)) {
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
				releaseDate: year,
				title: name
			})

			const mid = addMovie(movie)

			// Make api calls to gather info
			fetchMeta(mid, name, year)
		}
	}
}

const openFile = fileObj => {
	addWatched(fileObj.mid)
	open('file://' + fileObj.filepath)
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
	broadcast('Resetting server...')
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
	handleOpenFile(fileObj) {
		broadcast('Opening ' + fileObj.filepath)
		openFile(fileObj.filepath)
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
