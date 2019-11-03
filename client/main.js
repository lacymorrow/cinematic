/* global $, Desktop */

'use strict'
import {Meteor} from 'meteor/meteor'
import {Session} from 'meteor/session'
import {Template} from 'meteor/templating'

import NProgress from 'nprogress'
import {config} from '../imports/config'
import {broadcast} from '../imports/startup/both/util'

import {
	getState,
	getGenres,
	getGenreById,

	getMovie,
	getMovieQuery,
	getMovieCount,
	getRecent,
	getRecentCount,
	getWatched,
	getWatchedCount

} from '../imports/startup/client/database'

import {
	bullets,
	details,
	directory,
	display,
	header,
	movies,
	navigation,
	sort
} from '../imports/ui'

const SORT_TYPES = [
	'Alphabetical',
	'Popularity',
	'Release Date',
	'Runtime',
	'Random' /* , "Ratings" */
]

/* Third-Party Progress bar: NProgress */
NProgress.configure({trickleRate: 0.01, trickleSpeed: 1400})
NProgress.start()

// Client-side methods

const setLoaded = function (loaded) {
	// Convert to percentage
	NProgress.set(loaded / 100)
}

const setPath = function () {
	resetClient()
	let directory = document.querySelector('#directory').value
	if (directory !== '') {
		if (directory.slice(-1) !== '/') {
			directory += '/'
		}

		Meteor.call('handleConfirmPath')
	}
}

const rotateRating = function () {
	// Increment activeRating
	const x = Session.get('activeRating') + 1
	Session.set('activeRating', x % Session.get('totalRatings'))
}

let ratingTimer
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
	isDesktop() {
		return Meteor.isDesktop
	},
	page() {
		return Session.get('currentPage')
	}
})

Template.navigation.helpers({
	page() {
		return Session.get('currentPage')
	},
	genres() {
		return getGenres()
	},
	movieCount() {
		return getMovieCount()
	},
	recentCount() {
		return getRecentCount()
	},
	watchedCount() {
		return getWatchedCount()
	}
})

// Loading indicatior
Template.header.helpers({
	loading() {
		const state = getState()
		// Invert percentage (0 is done, 100% complete, false, off; 100 is 0% complete)
		const loaded = state ? 100 - state.loading : 100
		setLoaded(loaded)
		return loaded
	}
})

// Define path helpers
Template.directory.helpers({
	directory() {
		const state = getState()
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
		const movie = getMovie(Session.get('currentMovie'))
		if (movie) {
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
		const movies = getMovieQuery(Session.get('movieQuery'), Session.get('movieSort'))
		movies.map((o, i) => {
			movies[i].index = i
		})
		return movies
	}
})

// Sort helpers
Template.sort.helpers({
	currentSort() {
		return Session.get('currentSort')
	},
	showSort() {
		const currentSort = Session.get('currentSort')
		return currentSort !== 'Recent'
	},
	sort() {
		return SORT_TYPES
	}
})

/*
 * Events
 */

Template.body.events({
	'click #refresh'() {
		broadcast('Cinematic: Resetting client...')
		Meteor.call('handleRefresh')
		resetClient()
	}
})

// Sort event
Template.sort.events({
	'change #sort'(event) {
		const sort_value = $(event.currentTarget).val()
		Session.set('currentSort', sort)

		switch (sort_value) {
			case SORT_TYPES[1]: {
				// Popularity
				Session.set('movieSort', {sort: {'info.popularity': -1}})
				break
			}

			case SORT_TYPES[2]: {
				// Release Date
				Session.set('movieSort', {sort: {'info.release_date': -1}})
				break
			}

			case SORT_TYPES[3]: {
				// Runtime
				Session.set('movieSort', {sort: {'intel.Runtime': 1}})
				break
			}

			case SORT_TYPES[4]: {
				// Random
				Session.set('movieSort', {sort: {seed: 1}})
				break
			}

			// Alphabetical
			case SORT_TYPES[0]:
			case 'Ratings':
			default:
				Session.set('movieSort', {sort: {name: 1}})
				break
		}
	},
	'click #random'() {
		Meteor.call('handleRandom')
	}
})

// Handle filters navigation
Template.navigation.events({
	// Sidebar nav link - click
	'click #navigation-panel li.link'(event) {
		if (Session.get('currentSort') === 'Recent') {
			resetSort()
		}

		// Set page and title
		const currentPage = $(event.currentTarget).text()
		Session.set('currentPage', currentPage)

		// Hide right panel
		Session.set('currentMovie', 0)

		// Set current page
		const genre = getGenreById(event.currentTarget.dataset.id)
		if (genre) {
			// Genre page - All: alphabetical
			Session.set('movieQuery', {
				_id: {$in: genre.items}
			})
		} else if (currentPage === 'New') {
			// Browse Recently Released
			Session.set('movieQuery', {})
		} else if (currentPage === 'Recent') {
			// Browse recently viewed: alphabetical  **** TODO: HAVENT FIGURED OUT SORTING
			const recent = getRecent().map(e => {
				return e._id
			})
			Session.set('currentSort', 'Recent')
			Session.set('movieQuery', {_id: {$in: recent}})
			Session.set('movieSort', {sort: {recentTime: -1}})
		} else if (currentPage === 'Watched') {
			// Browse watched: order of watched
			const watched = getWatched().map(e => {
				return e._id
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
	'click #rating'() {
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
		// Handle changing details when user switches movie
		const {id} = event.currentTarget.dataset
		const {ratings, trailer} = getMovie(id)
		Session.set('totalRatings', ratings.length)

		// Set initial trailer
		Session.set('currentTrailer', trailer[0])
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
	'click #browse-input-link'() {
		// Desktop
		$('#browse-input-directory').click()
	},
	'keyup #directory'(event) {
		if (event.which === 13) {
			// On <enter> set path
			setPath()
		}
	},
	'click #browse-link'() {
		if (Meteor.isDesktop) {
			// Desktop
			Desktop.send('desktop', 'open-file-dialog')
		} else {
			// Web browser
		}
	}
})

/* OnReady */
Template.body.rendered = function () {
	Meteor.isDesktop && document.body.classList.add('desktop')
	$('[data-toggle="tooltip"]').tooltip()

	// Receive files from Electron
	// Desktop.on('desktop', 'selected-file', (event, data) => {
	// 	console.log('Selected File Dialog Data:', event, data)
	// 	if (data.length === 1) {
	// 		// Single folder to open
	// 		$('#directory').val(data[0])
	// 		setPath()
	// 	}
	// })
}

// Init
resetClient()

// Prevent eslint no-unused
export {
	bullets,
	details,
	directory,
	display,
	header,
	movies,
	navigation,
	sort
}
