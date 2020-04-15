'use strict'

export const movieTitlePattern = /^(.*?)(?:\[? ([\d]{4})?\]?|\(?([\d]{4})?\)?)$/g

export const defaultMovieMeta = {
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
