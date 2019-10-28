/* global Meteor, Mongo */

'use strict'

import {epoch} from '../both/util'

export const Genres = new Mongo.Collection('genres')
export const Movies = new Mongo.Collection('movies')
export const MovieCache = new Mongo.Collection('movieCache')
export const State = new Mongo.Collection('state')
export const Recent = new Mongo.Collection('recent')
export const Watched = new Mongo.Collection('watched')

export const initState = options => {
	const defaults = {
		_id: '0', // There can be only one...
		cwd: process.env.PWD,
		queueTotal: 0,
		dir: '~'
	}
	return State.insert(Object.assign(defaults, options))
}

export const getState = () => {
	return State.findOne({_id: '0'})
}

export const updateState = options => {
	return State.update('0', {$set: options})
}

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

export const getMovies = () => {
	return Movies.find()
}

export const getMovieById = id => {
	return Movies.findOne({_id: id})
}

export const getMovieByFile = file => {
	return Movies.findOne({file})
}

export const updateMovie = (id, options) => {
	return Movies.update(id, options)
}

export const updateMovieTrailer = (id, trailer) => {
	return Movies.update(id, {$set: {trailer}})
}

export const resetMovies = () => {
	return Movies.remove({})
}

const addMovieCache = movie => {
    MovieCache.insert(movie)
}

const updateMovieCache = (id, movie) => {
	movie.cache_date = epoch()
    MovieCache.upsert({_id: id}, {cache_date: epoch(), movie})
}

export const cacheMovie = file => {
    const movie = getMovieByFile(file)
    movie.cache_date = epoch()
    // Only cache if it loaded properly
    if (movie && movie.intel.Title && movie.info.title) {
        addMovieCache(movie)
    }
}

export const refreshMovieCache = () => {
    const movies = getMovies()
    const time = epoch()
    movies.forEach(movie => {
        updateMovieCache(movie.path + movie.file, movie)
    })
    updateState({cached_movies_at: time})
}

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
