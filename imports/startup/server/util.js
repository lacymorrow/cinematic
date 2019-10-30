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
	trailer: null,
	seed: Math.random(),
	recentTime: null,
	watchedTime: null,

	// Stubs
	ratings: [],
	info: {},
	intel: {},

	// Cumulative info
	imdbId: null,
	plot: null,
	poster: null,
	releaseDate: null,
	title: null,
	cached: false
}
