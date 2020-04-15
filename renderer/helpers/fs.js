'use strict'

import fs from 'fs'
import os from 'os'

export const getOSMediaPath = () => {

	// Get default media directory. Fetches ~/movies, ~/videos, ~

	let home = os.homedir()
	if ( home.slice( -1 ) !== '/' ) {

		home += '/'

	}

	let dir = home
	const files = fs.readdirSync( home )
	files.forEach( file => {

		const stats = fs.lstatSync( home + file )
		if (
			stats.isDirectory() &&
			( file.toLowerCase().includes( 'movies' ) ||
				file.toLowerCase().includes( 'videos' ) )
		) {

			dir = home + file + '/'

		}

	} )

	return dir

}

export const isDirectory = dirPath => {

	return fs.existsSync( dirPath ) && fs.lstatSync( dirPath ).isDirectory()

}
