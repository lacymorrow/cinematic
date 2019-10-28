/* global Meteor, Mongo */

'use strict'

import {epoch} from '../both/util'

export const Genres = new Mongo.Collection('genres')
export const Movies = new Mongo.Collection('movies')
export const MovieCache = new Mongo.Collection('movieCache')
export const State = new Mongo.Collection('state')
export const Recent = new Mongo.Collection('recent')
export const Watched = new Mongo.Collection('watched')

/* State */
export const initState = options => {
	const defaults = {
		_id: '0', // There can be only one...
		cwd: process.env.PWD,
		queueTotal: 0,
		dir: '~/'
	}
	return State.insert(Object.assign(defaults, options))
}

export const getState = () => {
	return State.findOne({_id: '0'})
}

export const updateState = options => {
	return State.update('0', {$set: options})
}

/* Recent */
export const addRecent = mid => {
	const time = epoch()
	Recent.upsert({_id: mid}, {time})
	Movies.update({_id: mid}, {$set: {recentTime: time}})
}

/* Watched */
export const addWatched = mid => {
	const time = epoch()
	Watched.upsert({_id: mid}, {time})
	Movies.update({_id: mid}, {$set: {watchedTime: time}})
}

/* Genre */
export const indexGenre = (id, name) => {
	// Create or update genre name
	const genre = getGenre(id)
	if (genre) {
		updateGenre(id, {name})
	} else {
		addGenre(id, {name})
	}
}

export const indexMovieGenre = (id, mid) => {
	// Create or update genre and pin a movie to genre
	const genre = getGenre(id)
	if (genre) {
		// Genre is not guaranteed to have .items
		const items = genre.items || []
		items.push(mid)
		updateGenre(id, {items})
	} else {
		addGenre(id, {name, items: [mid]})
	}
}

const addGenre = (id, options) => {
	const genre = Object.assign({...options}, {_id: id.toString(), id})
	return Genres.insert(genre)
}

const getGenre = id => {
	return Genres.findOne({_id: id.toString()})
}

const updateGenre = (id, options) => {
	return Genres.update(id.toString(), {$set: options})
}

export const resetGenres = () => {
	return Genres.remove({})
}

/* Movies */
export const addMovie = movie => {
	console.log(movie)
	return Movies.insert(movie)
}

export const getMovies = () => {
	return Movies.find()
}

export const getMovieById = mid => {
	return Movies.findOne({_id: mid})
}

export const getMovieByFile = file => {
	return Movies.findOne({file})
}

export const updateMovie = (mid, options) => {
	return Movies.update(mid, options)
}

export const updateMovieTrailer = (mid, trailer) => {
	return updateMovie(mid, {$set: {trailer}})
}

export const randomizeMovies = () => {
	const seeds = Movies.find({}, {fields: {seed: 1}})
	seeds.forEach(seed => {
		updateMovie(seed._id, {$set: {seed: Math.random()}})
	})
}

export const resetMovies = () => {
	return Movies.remove({})
}

/* Cache */
const addCachedMovie = movie => {
	MovieCache.insert(movie)
}

const updateCachedMovie = (key, movie) => {
	movie.cached_at = epoch()
	MovieCache.upsert({_id: key}, {cached_at: epoch(), movie})
}

export const getCachedMovie = key => {
	return MovieCache.findOne({_id: key})
}

export const cacheMovie = file => {
	const movie = getMovieByFile(file)
	movie.cached_at = epoch()
	// Only cache if it loaded properly
	if (movie && movie.intel.Title && movie.info.title) {
		addCachedMovie(movie)
	}
}

export const refreshMovieCache = () => {
	const movies = getMovies()
	const time = epoch()
	movies.forEach(movie => {
		updateCachedMovie(movie.path + movie.file, movie)
	})
	updateState({cached_movies_at: time})
}

/* DB */
export const resetDB = () => {
	Genres.remove({})
	Movies.remove({})
	MovieCache.remove({})
	State.remove({})
	Recent.remove({})
	Watched.remove({})

	return true
}

// Define observable collections for client
Meteor.publish('genres', () => {
	return Genres.find()
})
Meteor.publish('movies', () => {
	return Movies.find()
})
Meteor.publish('movieCache', () => {
	return MovieCache.find()
})
Meteor.publish('recent', () => {
	return Recent.find()
})
Meteor.publish('state', () => {
	return State.find()
})
Meteor.publish('watched', () => {
	return Watched.find()
})
