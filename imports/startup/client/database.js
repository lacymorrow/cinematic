import {Meteor} from 'meteor/meteor'
import {Mongo} from 'meteor/mongo'

// Observe db collection changes
Meteor.subscribe('state')
Meteor.subscribe('genres') // A map of genre-firendly-name to genre id
Meteor.subscribe('movies')
Meteor.subscribe('movieCache')
Meteor.subscribe('recent') // Recently clicked
Meteor.subscribe('watched')

const State = new Mongo.Collection('state')
export const Recent = new Mongo.Collection('recent')
export const Watched = new Mongo.Collection('watched')
export const Movies = new Mongo.Collection('movies')
export const Genres = new Mongo.Collection('genres')

// State
export const getState = () => State.findOne({_id: '0'})

export const getGenres = () => Genres.find({items: {$exists: true}}, {sort: {name: 1}}).fetch()

export const getGenreById = gid => Genres.findOne(gid)

export const getMovie = mid => Movies.findOne({_id: mid})

export const getMovieQuery = (query, sort) => Movies.find(query, sort).fetch()

export const getMovieCount = () => Movies.find().count()

export const getRecent = () => Recent.find().fetch()

export const getRecentCount = () => Recent.find().count()

export const getWatched = () => Watched.find().fetch()

export const getWatchedCount = () => Watched.find().count()
