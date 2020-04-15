'use strict'

import { shell } from 'electron'
import logger from 'electron-timber'
import { is } from 'electron-util'
import fs from 'fs'
import path from 'path'
import parseTorrentName from 'parse-torrent-name'

import config from '../config'
import strings from './strings'
import ipc from './safe-ipc'
import { defaultMovieMeta, movieTitlePattern } from './constants'
import { getOSMediaPath, isDirectory } from './fs'
import {
	epoch,
	hash,
	ignorePattern,
	isDigit,
	prettyName
} from './util'
import { fetchMeta, initGenreCache, resetQueue } from './services'
import {
	initState,
	getState,
	setState,
	syncState,
	addMovie,
	getCachedMovie,
	getMoviesCache,
	indexMovieGenre,
	randomizeMovies,
	resetGenres,
	resetMovies,
	resetDB
} from './database'

export const start = () => {

	/* IPC Communication */
	ipc.on( 'to-worker', ( event, arg ) => {

		const { command, data } = arg
		switch ( command ) {

			case 'choose-directory':
				if ( data === false ) {

					console.log( strings.error.chooseDirs )

				} else {

					const { canceled, filePaths } = data
					if ( canceled || filePaths.length === 0 ) {
						// Dialog was canceled
					} else {

						const dirpath = filePaths[0]
						setPath( dirpath )

					}

				}

				break
			case 'file':
				openExternal( path.join( 'file://', data ) )
				shell.beep()
				break
			case 'url':
				openExternal( data )
				shell.beep()
				break
			case 'randomize':
				randomizeMovies()
				break
			case 'sync':
				syncState( data )
				break
			case 'message':
				// If message is received, pass it back to the renderer via the main thread
				logger.log( data )
				break
			default:
				logger.log( `${strings.ipc.invalid}: ${data} ${arg}` )
				break

		}

	} )

	const state = getState()
	let dirpath

	if ( is.development ) {

		// UNCOMMENT to reset the app on every boot
		initState()
		resetGenres()

	}

	if ( !config.CACHE_TIMEOUT &&
			state.dirpath ) {

		// Cinematic has been run before and cache has not expired
		setState( { message: strings.messagebox.loadFromCache } )
		logger.log( strings.warn.cache_valid )

		// Reload movies DB
		getMoviesCache()

		// Scan path anyway to verify real-time
		dirpath = state.dirpath

		// If genre cache is expired, update genres
		if (
			!state.genreCacheTimestamp ||
			!( epoch() < state.genreCacheTimestamp + config.CACHE_TIMEOUT )
		) {

			logger.log( strings.log.fetchGenreCache )
			initGenreCache()

		}

	} else {

		// First run
		logger.log( strings.log.firstRun )
		initGenreCache()

		// Set path from os, fallback to config or root
		dirpath = getOSMediaPath() || config.DEFAULT_MEDIA_PATH || '/'

	}

	// Reset fleeting state
	setState( { queueTotal: 0, currentPage: config.DEFAULT_STATE.currentPage, loading: 0 } )

	// Trigger a reload of data
	setPath( dirpath )

}

export const setPath = dirpath => {

	// Save dirpath
	setState( {
		dir: dirpath,
		dirpath, // Migrating to use this variable
		message: `${strings.messagebox.setPath} ${dirpath}`
	} )

	// Scan files
	scanPath()

}

const scanPath = () => {

	// TODO - this is broken and doesn't reset the renderer quick enough
	// TODO - loading bar

	const { dirpath } = getState()
	if ( isDirectory( dirpath ) ) {

		resetQueue()
		resetGenres()
		resetMovies()
		setState( { dirpath, currentDir: dirpath, queueTotal: 0 } )

		scanDir( dirpath, 0 )

	} else {

		logger.log( strings.error.scanPath )

	}

}

const scanDir = ( dirpath, recurseDepth ) => {

	// Read from filesystem
	try {

		const files = fs.readdirSync( dirpath )
		setState( { message: `${strings.messagebox.scanDir} ${dirpath}` } )
		files.forEach( file => {

			const ext = path.extname( file )
			const filepath = path.join( dirpath, file )

			if ( file.indexOf( '.' ) === 0 ) {

				// Skip dotfiles
				return false

			}

			if ( ext ) {

				// File
				if ( config.VALID_FILETYPES.includes( ext ) ) {

					scanFile( filepath )

				} else {

					logger.log( `${strings.warn.file}: ${file}` )

				}

			} else if ( isDirectory( filepath ) && recurseDepth < config.SCAN_DEPTH ) {

				scanDir( path.join( filepath, '/' ), recurseDepth + 1 )

			}

		} ) // End file scan forEach

	} catch ( error ) {

		logger.log( `${strings.error.scanDir} - ${dirpath}: ${error}` )

	}

}

const scanFile = filepath => {

	const file = path.basename( filepath )
	const ext = path.extname( filepath )
	const { name, year } = parseFilename( path.basename( file, ext ) )

	if ( name !== ext && !ignorePattern( name ) ) {

		const movc = getCachedMovie( filepath )

		setState( { message: `${strings.messagebox.scanFile} ${filepath}` } )
		if (
			movc &&
			config.CACHE_TIMEOUT &&
			epoch() < movc.cached_at + config.CACHE_TIMEOUT
		) {

			// Cached
			logger.log( `${strings.warn.filecache}: ${name}` )
			addMovie( movc.movie )
			movc.movie.info.genre_ids.forEach( e => {

				indexMovieGenre( e, movc.movie._id )

			} )

		} else {

			// Not cached
			const movie = Object.assign( defaultMovieMeta, {
				ext,
				file,
				name,
				filepath,
				year,
				_id: hash( filepath ),
				releaseDate: year,
				title: name
			} )

			const mid = addMovie( movie )

			// Make api calls to gather info
			fetchMeta( mid, name, year )

		}

	} else {

		setState( { message: `Skipping file ${filepath}` } )

	}

}

const openExternal = async resource => {

	setState( { message: `${strings.messagebox.openExternal} ${resource}` } )

	try {

		await shell.openExternal( resource )

	} catch ( error ) {

		setState( { message: `${strings.messagebox.openExternalError} ${resource}: ${error.message}` } )
		logger.error( { err: { message: error.message, stack: error.stack } } )

	}

}

const parseFilename = filename => {

	const meta = { name: filename, year: null }
	switch ( config.PARSE_METHOD ) {

		case 'regex': {

			const match = movieTitlePattern.exec( filename )
			if ( match ) {

				meta.name = unescape( match[1] )
				if ( match.length > 1 && isDigit( match[3] ) ) {

					meta.year = match[3]

				}

			}

			break

		}

		case 'parse':
		default: {

			if ( filename === '.' ) {

				return

			}

			const parsedMeta = parseTorrentName( filename )
			Object.assign( meta, {
				name: prettyName( parsedMeta.title ),
				year: parsedMeta.year || null
			} )

			break

		}

	}

	return meta

}

export const reset = () => {

	// Reset and init state
	setState( { message: strings.log.reset } )
	logger.log( strings.log.reset )
	resetDB()
	resetQueue()

	// Restart
	start()

}

// // Server-side methods exposed to the client
// Meteor.methods({
// 	handleBrowseDialogger.log(files) {
// 		// Receives an array of filenames
// 		files.forEach(e => {
// 			scanFile(e.name)
// 		})
// 	},
// 	handleConfirmPath(dirPath) {
// 		// Add trailing slash
// 		dirPath += dirPath.slice(-1) === '/' ? '' : '/'
//
// 		// Set new dir
// 		setState({dir: path.normalize(dirPath)})
// 		scanPath()
// 	},
// 	handleOpenFile(fileObj) {
// 		logger.log('Opening ' + fileObj.filepath)
// 		addWatched(fileObj.mid)
// 		openFile(fileObj.filepath)
// 	},
// 	handleRandomSort() {
// 		randomizeMovies()
// 	},
// 	handleViewMovie(mid) {
// 		addRecent(mid)
// 	}
// })
