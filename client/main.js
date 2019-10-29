/* global $, Desktop, Meteor, Mongo, Session, Template */

'use strict'

import NProgress from 'nprogress'
import {config} from '../imports/config'
import {broadcast} from '../imports/startup/both/util'

const State = new Mongo.Collection('state')
const Recent = new Mongo.Collection('recent')
const Watched = new Mongo.Collection('watched')
const Genres = new Mongo.Collection('genres')
const Movies = new Mongo.Collection('movies')

if (Meteor.isDesktop) {
	// Send config
	Desktop.send('desktop', 'load-settings', config)
	// Receive files from browser
	Desktop.on('desktop', 'selected-file', (event, data) => {
		console.log('Selected File Dialog Data:', event, data)
		if (data.length === 1) {
			// Single folder to open
			$('#path').val(data[0])
			setPath()
		}
	})
} // End Meteor.isDesktop

let ratingTimer
let totalRatings

// Observe db collections
Meteor.subscribe('state')
Meteor.subscribe('genres') // A map of genre-firendly-name to genre id
Meteor.subscribe('movies')
Meteor.subscribe('movieCache')
Meteor.subscribe('recent') // Recently clicked
Meteor.subscribe('watched')

/* Third-Party Progress bar: NProgress */
NProgress.configure({trickleRate: 0.01, trickleSpeed: 1400})

/* OnReady */
Template.body.rendered = function () {
	if (Meteor.isDesktop) {
		// Desktop Loaded
		isDesktop()
		// Init browse button IPC
		document.querySelector('#browse-link').classList.remove('hide')
	} else {
		document.querySelector('#browse-link').classList.remove('hide')
	}

	$('[data-toggle="tooltip"]').tooltip()
}

/*
 * HELPERS
 * Define nav helpers
 */

Template.registerHelper('equals', (v1, v2) => {
	return v1 === v2
})

Template.registerHelper('gt', (v1, v2) => {
	return v1 > v2
})

Template.body.helpers({
	page() {
		return Session.get('currentPage')
	}
})

Template.navigation.helpers({
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

// Define loading indicatior
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
Template.path.helpers({
	path() {
		const state = State.findOne({_id: '0'})
		return (state) ? state.path : '---'
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
			movie.ratings.map((o, i) => {
				movie.ratings[i].index = i
				if (i == movie.ratings.length - 1) {
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
		return currentSort != 'Recent'
	},
	sort() {
		return config.SORT_TYPES
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
		if (sort == config.SORT_TYPES[0]) {
			// Alphabetical
			Session.set('movieSort', {sort: {name: 1}})
		} else if (sort == config.SORT_TYPES[1]) {
			// Popularity
			Session.set('movieSort', {sort: {'info.popularity': -1}})
		} else if (sort == config.SORT_TYPES[2]) {
			// Release Date
			Session.set('movieSort', {sort: {'info.release_date': -1}})
		} else if (sort == config.SORT_TYPES[3]) {
			// Runtime
			Session.set('movieSort', {sort: {'intel.Runtime': 1}})
		} else if (sort == config.SORT_TYPES[4]) {
			// Random
			Session.set('movieSort', {sort: {seed: 1}})
		} else if (sort == 'Ratings') {
			// Inactive, should use avg ratings
		}
	},
	'click #random'(event) {
		Meteor.call('handleRandom')
	}
})

// Handle page changes with filter
Template.navigation.events({
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

// Define movie events
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
	},
	'keyup .movie-image'(event) {
		const magnitude = 3 // $(".keyboard-magnitude").data('id'); // this should equal the number of movies per row
		event.preventDefault()
		if (event.which === 37) {
			// Left
			var currTab =
                parseInt($('.movie-image:focus').attr('tabIndex')) - 1
			$('.movie-image[tabIndex="' + currTab + '"]').click()
			$('.movie-image[tabIndex="' + currTab + '"]').focus()
		} else if (event.which === 39) {
			// Right
			var currTab =
                parseInt($('.movie-image:focus').attr('tabIndex')) + 1
			$('.movie-image[tabIndex="' + currTab + '"]').click()
			$('.movie-image[tabIndex="' + currTab + '"]').focus()
			// } else if(event.which == 38){
			//   // up
			//   var currTab = parseInt($('.movie-image:focus').attr('tabIndex')) - magnitude;
			//   $('.movie-image[tabIndex="'+currTab+'"]').click();
			//   $('.movie-image[tabIndex="'+currTab+'"]').focus();
			// } else if(event.which == 40){
			//   // down
			//   var currTab = parseInt($('.movie-image:focus').attr('tabIndex')) + magnitude;
			//   $('.movie-image[tabIndex="'+currTab+'"]').click();
			//   $('.movie-image[tabIndex="'+currTab+'"]').focus();
		}
	}
})

// Define path events
Template.path.events({
	'change #browse-input-directory'(event) {
		event.preventDefault()
		Meteor.call('handleBrowseDialog', event.target.files)
	},
	'click #browse-input-link'(event) {
		$('#browse-input-directory').click()
	},
	'keyup #path'(event) {
		if (event.which == 13) {
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

var isDesktop = function () {
	$('html').addClass('desktop-app')
}

var setLoaded = function (percentage) {
	NProgress.start()
	NProgress.set(percentage)
}

var setPath = function () {
	resetClient()
	const _path = document.querySelector('#path')
	if (_path.value != '') {
		let path = _path.value
		if (path.slice(-1) != '/') {
			path += '/'
		}
	}

	Meteor.call('handleConfirmPath')
}

var rotateRating = function () {
	// Broadcast(totalRatings); // !important! number of ratings sources < ------------------- MAGIC NUMBER HERE
	let x = Session.get('activeRating')
	x += 1
	Session.set('activeRating', x == totalRatings ? 0 : x)
}

var resetRatingInterval = function () {
	if (ratingTimer) {
		Meteor.clearInterval(ratingTimer)
	}

	ratingTimer = Meteor.setInterval(rotateRating, config.RATING_DELAY)
}

var resetSort = function () {
	// Default sort values
	Session.set('currentSort', config.SORT_TYPES[0])
	Session.set('movieSort', {sort: {name: 1}})
}

// Defaults
var resetClient = function () {
	resetSort()
	Session.set('activeRating', 0)
	Session.set('currentMovie', 0)
	Session.set('currentPage', 'Movies')
	Session.set('movieQuery', {})
}

resetClient()
