/* global $, Desktop, Meteor, Mongo, Session */

'use strict'

import NProgress from 'nprogress'
import {config} from '../imports/config'
import {broadcast} from '../imports/startup/both/util'

import {
	bullets,
	details,
	directory,
	header,
	movies,
	sidebar,
	sort
} from '../imports/ui'

/* Third-Party Progress bar: NProgress */
NProgress.configure({trickleRate: 0.01, trickleSpeed: 1400})

let ratingTimer
let totalRatings

const State = new Mongo.Collection('state')
const Recent = new Mongo.Collection('recent')
const Watched = new Mongo.Collection('watched')
const Genres = new Mongo.Collection('genres')
const Movies = new Mongo.Collection('movies')

// Observe db collections
Meteor.subscribe('state')
Meteor.subscribe('genres') // A map of genre-firendly-name to genre id
Meteor.subscribe('movies')
Meteor.subscribe('movieCache')
Meteor.subscribe('recent') // Recently clicked
Meteor.subscribe('watched')

const SORT_TYPES = [
	'Alphabetical',
	'Popularity',
	'Release Date',
	'Runtime',
	'Random' /* , "Ratings" */
]

/* OnReady */
Template.body.rendered = function () {
	if (Meteor.isDesktop) {
		document.body.classList.add('desktop')
		// Receive files from Electron
		// Desktop.on('desktop', 'selected-file', (event, data) => {
		// 	console.log('Selected File Dialog Data:', event, data)
		// 	if (data.length === 1) {
		// 		// Single folder to open
		// 		$('#directory').val(data[0])
		// 		setPath()
		// 	}
		// })

		// Init browse button IPC
		document.querySelector('#browse-link').classList.remove('hide')
	} else {
		document.querySelector('#browse-link').classList.remove('hide')
	}

	$('[data-toggle="tooltip"]').tooltip()
}

/*
 * HELPERS
 */

// Template tags
Template.registerHelper('equals', (v1, v2) => {
	return v1 === v2
})

Template.registerHelper('gt', (v1, v2) => {
	return v1 > v2
})

// Database getters
Template.body.helpers({
	page() {
		return Session.get('currentPage')
	}
})

Template.sidebar.helpers({
	page() {
		return Session.get('currentPage')
	},
	genres() {
		return Genres.find({items: {$exists: true}}, {sort: {name: 1}}).fetch()
	},
	movieCount() {
		return Movies.find().count()
	},
	recentCount() {
		return Recent.find().count()
	},
	watchedCount() {
		return Watched.find().count()
	}
})

// Loading indicatior
Template.header.helpers({
	loading() {
		const state = State.findOne({_id: '0'})
		// Invert percentage (0 is done, 100% complete, false, off; 100 is 0% complete)
		const loaded = (state) ? 100 - state.loading : 100
		setLoaded(loaded / 100)
		return loaded
	}
})

// Define path helpers
Template.directory.helpers({
	directory() {
		const state = State.findOne({_id: '0'})
		return (state) ? state.dir : '---'
	}
})

// Define details helpers
Template.details.helpers({
	rating() {
		return Session.get('activeRating')
	},
	config() {
		return config
	},
	movie() {
		const movie = Movies.findOne({_id: Session.get('currentMovie')})
		if (movie) {
			console.log(movie.ratings)
			movie.ratings.map((o, i) => {
				movie.ratings[i].index = i
				if (i === movie.ratings.length - 1) {
					movie.ratings[i].indexPlus = 0
				} else {
					movie.ratings[i].indexPlus = i + 1
				}
			})
		}

		return movie
	},
	currentTrailer() {
		return Session.get('currentTrailer')
	}
})

// Define movies helpers
Template.movies.helpers({
	movies() {
		const movies = Movies.find(
			Session.get('movieQuery'),
			Session.get('movieSort')
		).fetch()
		let index = 0
		movies.map((o, i) => {
			movies[i].index = index++
		})
		return movies
	}
})

// Sort helpers
Template.sort.helpers({
	showSort() {
		const currentSort = Session.get('currentSort')
		return currentSort !== 'Recent'
	},
	sort() {
		return SORT_TYPES
	},
	currentSort() {
		return Session.get('currentSort')
	}
})

/*
 * Events
 */

Template.body.events({
	'click #refresh'(event) {
		broadcast('Cinematic: Resetting client...')
		resetClient()
		Meteor.call('handleRefresh')
	}
})

// Sort event
Template.sort.events({
	'change #sort'(event, template) {
		const sort = $(event.currentTarget).val()
		Session.set('currentSort', sort)
		// Warning, magic numbers below, indexs reference sort types above
		if (sort === SORT_TYPES[0]) {
			// Alphabetical
			Session.set('movieSort', {sort: {name: 1}})
		} else if (sort === SORT_TYPES[1]) {
			// Popularity
			Session.set('movieSort', {sort: {'info.popularity': -1}})
		} else if (sort === SORT_TYPES[2]) {
			// Release Date
			Session.set('movieSort', {sort: {'info.release_date': -1}})
		} else if (sort === SORT_TYPES[3]) {
			// Runtime
			Session.set('movieSort', {sort: {'intel.Runtime': 1}})
		} else if (sort === SORT_TYPES[4]) {
			// Random
			Session.set('movieSort', {sort: {seed: 1}})
		} else if (sort === 'Ratings') {
			// Inactive, should use avg ratings
		}
	},
	'click #random'(event) {
		Meteor.call('handleRandom')
	}
})

// Handle filters navigation
Template.sidebar.events({
	'click #links-panel li.link'(event) {
		const page = Session.get('currentPage')
		if (Session.get('currentSort') === 'Recent') {
			resetSort()
		}

		const pid = String(event.currentTarget.dataset.id)
		const currentPage = $(event.currentTarget).text()
		Session.set('currentPage', currentPage)
		// Hide right panel
		Session.set('currentMovie', 0)
		const genre = Genres.findOne(pid)
		if (genre) {
			// Genre page - All: alphabetical
			Session.set('movieQuery', {
				_id: {$in: Genres.findOne(pid).items}
			})
		} else if (currentPage === 'New') {
			// Browse Recently Released
			Session.set('movieQuery', {})
		} else if (currentPage === 'Recent') {
			// Browse recently viewed: alphabetical  **** TODO: HAVENT FIGURED OUT SORTING
			const recent = []
			_.map(Recent.find().fetch(), e => {
				recent.push(e._id)
			})
			Session.set('currentSort', 'Recent')
			Session.set('movieQuery', {_id: {$in: recent}})
			Session.set('movieSort', {sort: {recentTime: -1}})
		} else if (currentPage === 'Watched') {
			// Browse watched: order of watched
			const watched = []
			_.map(Watched.find().fetch(), e => {
				watched.push(e._id)
			})
			Session.set('currentSort', 'Recent')
			Session.set('movieQuery', {_id: {$in: watched}})
			Session.set('movieSort', {sort: {watchedTime: -1}})
		} else {
			// Main page - All: alphabetical
			Session.set('movieQuery', {})
		}
	}
})

Template.details.events({
	'click #rating'(event) {
		// Switch ratings
		resetRatingInterval()
		rotateRating()
	},
	'click #open-link'(event) {
		const filepath = event.currentTarget.dataset.src
		const mid = event.currentTarget.dataset.id
		Meteor.call('handleOpenFile', {mid, filepath})
	},
	'click #trailer .trailer'(event) {
		// Switch trailers
		Session.set('currentTrailer', event.currentTarget.dataset.id)
	}
})

// Define movie display events (click, keystroke)
Template.movies.events({
	// Show right panel
	'click .movie-image'(event) {
		// Switch current movie in details panel
		const {id} = event.currentTarget.dataset
		const trailers = Movies.findOne({_id: id}, {fields: {trailer: 1}})
		const {ratings} = Movies.findOne({_id: id}, {fields: {ratings: 1}})
		totalRatings = ratings.length
		// Set initial trailer
		const trailer =
            trailers.trailer &&
            trailers.trailer[0]
		Session.set('currentTrailer', trailer)
		// Set current movie and add to recent
		Session.set('currentMovie', id)
		Meteor.call('handleViewMovie', id)
		// Set timer to rotate ratings
		resetRatingInterval()
	}
	// 'keyup .movie-image'(event) {
	// 	event.preventDefault()
	// 	if (event.which === 37) { // 38 39 40
	// 		// Left
	// }
})

// Define path events
Template.directory.events({
	'change #browse-input-directory'(event) {
		event.preventDefault()
		Meteor.call('handleBrowseDialog', event.target.files)
	},
	'click #browse-input-link'(event) {
		$('#browse-input-directory').click()
	},
	'keyup #directory'(event) {
		if (event.which === 13) {
			// On <enter> set path
			setPath()
		}
	},
	'click #search-refresh'(event) {
		setPath()
	},
	'click #browse-link'(event) {
		if (Meteor.isDesktop) {
			Desktop.send('desktop', 'open-file-dialog')
		} else {
			// Web browser
		}
	}
})

// Client-side methods

const setLoaded = function (percentage) {
	NProgress.start()
	NProgress.set(percentage)
}

const setPath = function () {
	resetClient()
	const _directory = document.querySelector('#directory')
	if (_directory.value !== '') {
		let directory = _directory.value
		if (directory.slice(-1) !== '/') {
			directory += '/'
		}
	}

	Meteor.call('handleConfirmPath')
}

const rotateRating = function () {
	// Broadcast(totalRatings); // !important! number of ratings sources < ------------------- MAGIC NUMBER HERE
	let x = Session.get('activeRating')
	x += 1
	Session.set('activeRating', x === totalRatings ? 0 : x)
}

const resetRatingInterval = function () {
	if (ratingTimer) {
		Meteor.clearInterval(ratingTimer)
	}

	ratingTimer = Meteor.setInterval(rotateRating, config.RATING_DELAY)
}

const resetSort = function () {
	// Default sort values
	Session.set('currentSort', SORT_TYPES[0])
	Session.set('movieSort', {sort: {name: 1}})
}

// Defaults
const resetClient = function () {
	resetSort()
	Session.set('activeRating', 0)
	Session.set('currentMovie', 0)
	Session.set('currentPage', 'Movies')
	Session.set('movieQuery', {})
}

resetClient()

// Prevent eslint no-unused
export {
	bullets,
	details,
	directory,
	header,
	movies,
	sidebar,
	sort
}
