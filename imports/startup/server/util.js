'use strict'
import fs from 'fs'
import os from 'os'
import {config} from '../../config'

export const getOSMediaPath = () => {
	// Get default media directory. Fetches ~/movies, ~/videos, ~

	let home = os.homedir()
	if (home.slice(-1) !== '/') {
		home += '/'
	}

	let dir = home
	const files = fs.readdirSync(home)
	files.forEach(file => {
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

export const isDirectory = dirPath => {
	return fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()
}

export const ignorePattern = str => {
	return config.IGNORE_PATTERN.includes(str.toLowerCase())
}

export const regexPattern = /^(.*?)(?:\[? ([\d]{4})?\]?|\(?([\d]{4})?\)?)$/g

export const defaultMeta = {
	ext: null,
	file: null,
	name: null,
	filepath: null,
	year: null,
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
		release_date: null,
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
	release_date: null,
	title: null,
	cached: false
}
