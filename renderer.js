/* global Meteor, Mongo */
'use strict'
/*
 * Cinematic, (c) 2017 Lacy Morrow - http://github/lacmorrow/cinematic
 * @license GPL

 * Roadmap
 * - Account for duplicate filenames
 * - PUBLIC API BRO... SMH
 * - Limit Request count (throttle requests)
 * - Ability to add individual files via dialog
 * - Tell me which way filters are sorted by (ASC/DESC)
 * - Keyboard Navigation
 * - account for missing sort params
 * - Unused data: popularity, country, language, awards
 * - limit, possibly paginate movies
 * - Ambiguous/Fuzzy search
 * - TV Shows
 * - Filter by Director ( cool )
 * - parse intel genres ( old )
 * - auto rename files ( out of scope )

 * - Pass errors to front end

 *****
   NOTES
 *****
 * - We cache movies if a single api script returns intel (movieInfo/omdbClient); easier than waiting on 3 api reqs
 * - We disregard files with the same name as their extension, ex: avi.avi; check addMovie to change

 */

/* Secrets - public til they're blocked. 4 years going strong, thank TMDB and OMDB! */
const DEFAULT_TMDB_KEY = '9d2bff12ed955c7f1f74b83187f188ae'
const DEFAULT_OMDB_KEY = 'e0341ca3'

const settings = {
	/* Allow for personal api key secrets for analytics */
	tmdb_key: process.env.TMDB_KEY ? process.env.TMDB_KEY : DEFAULT_TMDB_KEY, // http://docs.themoviedb.apiary.io/ config
	omdb_key: process.env.OMDB_KEY ? process.env.OMDB_KEY : DEFAULT_OMDB_KEY, // Omdb api key

	/* Defaults */
	valid_types: [
		'.avi',
		'.flv',
		'.mp4',
		'.m4v',
		'.mov',
		'.ogg',
		'.ogv',
		'.vob',
		'.wmv',
		'.mkv'
	],
	sort_types: [
		'Alphabetical',
		'Popularity',
		'Release Date',
		'Runtime',
		'Random' /* , "Ratings" */
	],
	cache: 3600, // Seconds; 604800 = 7 days
	overview_length: 'full', // Plot Summary length: "short", "full" - from omdb

	/* URLs */
	base_url: 'https://image.tmdb.org/t/p/',
	genre_url: 'http://api.themoviedb.org/3/genre/movie/list',
	backdrop_size: 'w1280', // "w300", "w780", "w1280", "original"
	poster_size: 'w780', // "w92", "w154", "w185", "w342", "w500", "w780", "original",

	/* app-specific */
	// -- affects how app is run and may affect performance
	max_connections: 3, // Max number of simultaneous, more is faster but more api hits at once; 5 is okay...
	parse_method: 'parse', // Filename parsing options: "regex", "parse"; regex is best for well-organized files lile This[2004].avi
	rating_delay: 6000, // Milli-seconds of rating rotate interval; 5000 = 5 seconds
	retry_delay: 4000, // Milli-seconds delay of retrying failed api requests to alieviate thousands of simultaneous requests;
	recurse_level: 1, // How many directory levels to recursively search. 0 is a flat directory search. Higher is further down the rabbit hole === more processing time
	ignore_list: ['sample', 'etrg'] // A lowercase list of movie titles to ignore; ex: sample.avi
}

// Define db collections
const Log = new Mongo.Collection('log')
const State = new Mongo.Collection('state')
const Recent = new Mongo.Collection('recent')
const Watched = new Mongo.Collection('watched')
const Genres = new Mongo.Collection('genres')
const Movies = new Mongo.Collection('movies')
const MovieCache = new Mongo.Collection('movieCache')

/*
 * CLIENT
 */

if (Meteor.isClient) {
	if (Meteor.isDesktop) {
		// Send settings
		Desktop.send('desktop', 'load-settings', settings)
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
	Meteor.subscribe('log') // Application log
	Meteor.subscribe('state')
	Meteor.subscribe('recent') // Recently clicked
	Meteor.subscribe('watched')
	Meteor.subscribe('genres') // A map of genre-firendly-name to genre id
	Meteor.subscribe('movies')
	Meteor.subscribe('movieCache')

	/* Third-Party Progress bar: NProgress */
	NProgress.configure({trickleRate: 0.01, trickleSpeed: 1400})

	/* OnReady */
	Template.body.rendered = function () {
		if (Meteor.isDesktop) {
			// Desktop Loaded
			isDesktop()
			// Init browse button IPC
			$('#browse-link').removeClass('hide')
		} else {
			$('#browse-input').removeClass('hide')
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
		settings() {
			return settings
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
			return settings.sort_types
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
			Meteor.call('reset')
		}
	})

	// Sort event
	Template.sort.events({
		'change #sort'(event, template) {
			const sort = $(event.currentTarget).val()
			Session.set('currentSort', sort)
			// Warning, magic numbers below, indexs reference sort types above
			if (sort == settings.sort_types[0]) {
				// Alphabetical
				Session.set('movieSort', {sort: {name: 1}})
			} else if (sort == settings.sort_types[1]) {
				// Popularity
				Session.set('movieSort', {sort: {'info.popularity': -1}})
			} else if (sort == settings.sort_types[2]) {
				// Release Date
				Session.set('movieSort', {sort: {'info.release_date': -1}})
			} else if (sort == settings.sort_types[3]) {
				// Runtime
				Session.set('movieSort', {sort: {'intel.Runtime': 1}})
			} else if (sort == settings.sort_types[4]) {
				// Random
				Session.set('movieSort', {sort: {seed: 1}})
			} else if (sort == 'Ratings') {
				// Inactive, should use avg ratings
			}
		},
		'click #random'(event) {
			Meteor.call('updateRandom')
		}
	})

	// Handle page changes with filter
	Template.navigation.events({
		'click #links-panel li.link'(event) {
			const page = Session.get('currentPage')
			if (Session.get('currentSort') == 'Recent') {
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
			} else if (currentPage == 'New') {
				// Browse Recently Released
				Session.set('movieQuery', {})
			} else if (currentPage == 'Recent') {
				// Browse recently viewed: alphabetical  **** TODO: HAVENT FIGURED OUT SORTING
				const recent = []
				_.map(Recent.find().fetch(), e => {
					recent.push(e._id)
				})
				Session.set('currentSort', 'Recent')
				Session.set('movieQuery', {_id: {$in: recent}})
				Session.set('movieSort', {sort: {recent_time: -1}})
			} else if (currentPage == 'Watched') {
				// Browse watched: order of watched
				const watched = []
				_.map(Watched.find().fetch(), e => {
					watched.push(e._id)
				})
				Session.set('currentSort', 'Recent')
				Session.set('movieQuery', {_id: {$in: watched}})
				Session.set('movieSort', {sort: {watched_time: -1}})
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
			const url = event.currentTarget.dataset.src
			const mid = event.currentTarget.dataset.id
			Meteor.call('addWatched', mid)
			Meteor.call('openFile', url)
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
                trailers &&
                trailers.trailer &&
                trailers.trailer[0] &&
                trailers.trailer[0].key
			Session.set('currentTrailer', trailer)
			// Set current movie and add to recent
			Session.set('currentMovie', id)
			Meteor.call('addRecent', id)
			// Set timer to rotate ratings
			resetRatingInterval()
		},
		'keyup .movie-image'(event) {
			const magnitude = 3 // $(".keyboard-magnitude").data('id'); // this should equal the number of movies per row
			event.preventDefault()
			if (event.which == 37) {
				// Left
				var currTab =
                    parseInt($('.movie-image:focus').attr('tabIndex')) - 1
				$('.movie-image[tabIndex="' + currTab + '"]').click()
				$('.movie-image[tabIndex="' + currTab + '"]').focus()
			} else if (event.which == 39) {
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
			broadcast(event.target.files)

			// Broadcast
			for (let i = event.target.files.length - 1; i >= 0; i--) {
				Meteor.call('addMovie', event.target.files[i].name)
			}
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
			var path = _path.value
			if (path.slice(-1) != '/') {
				path += '/'
			}
		}

		Meteor.call('updatePath', path)
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

		ratingTimer = Meteor.setInterval(rotateRating, settings.rating_delay)
	}

	var resetSort = function () {
		// Default sort values
		Session.set('currentSort', settings.sort_types[0])
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
} // End Meteor.isClient

/*
 * SERVER
 */

if (Meteor.isServer) {
	const open = Meteor.npmRequire('open')
	const omdbApi = Meteor.npmRequire('omdb-client')
	// Var omdbApi = Meteor.npmRequire('lacymorrow-omdb-client');
	const movieInfo = Meteor.npmRequire('movie-info')
	const movieTrailer = Meteor.npmRequire('movie-trailer')
	const parseTorrentName = Meteor.npmRequire('parse-torrent-name')

	// Define observable collections
	Meteor.publish('log', () => {
		return Log.find()
	})
	Meteor.publish('state', () => {
		return State.find()
	})
	Meteor.publish('recent', () => {
		return Recent.find()
	})
	Meteor.publish('watched', () => {
		return Watched.find()
	})
	Meteor.publish('genres', () => {
		return Genres.find()
	})
	Meteor.publish('movies', () => {
		return Movies.find()
	})
	Meteor.publish('movieCache', () => {
		return MovieCache.find()
	})

	// Server globals
	// startup functions
	Meteor.startup(() => {
		// Setup db - optionally clear movies, log, and path
		Log.remove({})
		Movies.remove({})

		// Welcome message
		broadcast('\n----- Cinematic -----')

		// Set default path
		const dir = Meteor.call('findMovieDir')

		// Set up state
		const time = epoch()
		const state = State.findOne({_id: '0'})
		if (!state) {
			const sid = State.insert({
				_id: '0',
				path: dir,
				cwd: process.env.PWD
			})
		}

		// Grab genre list
		if (
			settings.cache &&
            state &&
            state.cache_genre &&
            time < state.cache_genre + settings.cache
		) {
			broadcast('Cinematic: Loading cached genre list.')
		} else {
			broadcast('Cinematic: Updating genre cache.')
			Meteor.call('updateGenres')
		}

		// Initial update
		Meteor.call('updatePath', dir)
	}) // End startup

	// number of concurrent api connections; currently doesn't distinguish between different api source limits
	// total, number left to process, currently processing
	let api_total = 0
	let api_queue = 0
	let api_current = 0

	// Server-side methods
	Meteor.methods({
		addGenre(gid, mid, name) {
			const id = String(gid)
			const genre = Genres.findOne({_id: id})
			if (genre && name) {
				Genres.update(id, {$set: {name}})
			} else if (genre && mid) {
				const items = genre.items || []
				items.push(mid)
				Genres.update(id, {$set: {items}})
			} else if (name) {
				Genres.insert({_id: id, id: gid, name})
			} else if (mid) {
				Genres.insert({_id: id, id: gid, name, items: [mid]})
			}
		},
		addRecent(mid) {
			const time = epoch()
			Recent.upsert({_id: mid}, {time})
			Movies.update({_id: mid}, {$set: {recent_time: time}})
		},
		addWatched(mid) {
			const time = epoch()
			Watched.upsert({_id: mid}, {time})
			Movies.update({_id: mid}, {$set: {watched_time: time}})
		},
		addMovie(file, options) {
			// Set options
			var options = options ? options : {}
			const ex = options.ext ?
				options.ext :
				file
					.split('.')
					.pop()
					.toLowerCase()
			const dirPath = options.dirPath ? options.dirPath : false

			const time = epoch()
			if (settings.parse_method == 'regex') {
				const regex = /^(.*?)(?:\[? ([\d]{4})?\]?|\(?([\d]{4})?\)?)$/g
				const match = regex.exec(path.basename(file, ex))
				var name = (year = null)
				if (match) {
					name = unescape(match[1])
					if (
						match.length > 1 &&
                        !isNaN(parseFloat(match[3])) &&
                        isFinite(match[3])
					) {
						year = match[3]
					}
				}
			} else {
				const fileName = file.substr(0, file.length - ex.length)
				if (fileName == '.') {
					return
				}

				const parsedName = parseTorrentName(
					file.substr(0, file.length - ex.length)
				)
				var name = parsedName.title ? parsedName.title : fileName
				name = parseName(name)
				var year = parsedName.year ? parsedName.year : null
			}

			if (
				name &&
                name != ex &&
                !_.contains(settings.ignore_list, name.toLowerCase())
			) {
				// Cache handling
				const hash = dirPath + file
				const movc = MovieCache.findOne({_id: hash})
				if (
					movc &&
                    movc.cached &&
                    settings.cache &&
                    movc.movie &&
                    time < movc.cache_date + settings.cache
				) {
					// Cached
					broadcast('Cinematic: Loading cached movie ' + name)
					var mid = movc.movie._id
					Movies.insert(movc.movie)
					_.each(movc.movie.info.genre_ids, (e, i) => {
						Meteor.call('addGenre', e, mid, null)
					})
				} else {
					// Not cached
					// add item to collection
					var mid = Movies.insert({
						ext: ex,
						file,
						name,
						path: dirPath,
						year,
						ratings: [],
						trailer: null,
						seed: Math.random(),
						recent_time: null,
						watched_time: null,
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
							release_date: year,
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
						release_date: year,
						title: name,
						cached: false
					})
					// Make api calls to gather info
					Meteor.call('getIntel', mid, name, year)
				}
			}
		},
		cacheMovies() {
			const movies = Movies.find()
			const time = epoch()
			movies.forEach(movie => {
				movie.cache_date = epoch()
				MovieCache.upsert({_id: movie.path + movie.file}, {cache_date: time, movie})
			})
			State.update('0', {$set: {cache_movies: time}})
		},
		cacheMovie(file) {
			const mov = Movies.findOne({file})
			mov.cache_date = epoch()
			// Only cache if it loaded properly
			if (mov && mov.intel.Title && mov.info.title) {
				MovieCache.insert(mov)
			}
		},
		directorySearch(output) {
			broadcast('Server adding files:' + '\n' + output)
		},
		findMovieDir() {
			// Get default media directory. Fetches ~/movies, ~/videos, ~

			let home = Meteor.npmRequire('os').homedir()
			if (home.slice(-1) != '/') {
				home += '/'
			}

			let dir = home
			const files = fs.readdirSync(home)
			files.forEach((file, i) => {
				const stats = fs.lstatSync(home + file)
				if (
					stats.isDirectory() &&
                    (file.toLowerCase().includes('movies') ||
                        file.toLowerCase().includes('videos'))
				) {
					dir = home + file + '/'
				}
			})
			broadcast('Cinematic: Using ' + dir + ' as movie directory')
			return dir
		},
		getIntel(mid, name, year) {
			// Updates to gather
			const jobs = [
				'updateTrailer', // We call trailer first, because we cache as soon as we get any info; if program stops before all info loaded, still cached
				'updateIntel',
				'updateInfo'
			]
			_.map(jobs, job => {
				api_queue += 1
				api_total += 1
				Meteor.call('queueIt', job, mid, name, year, (
					err,
					res
				) => {
					if (err) {
						broadcast('Cinematic/getIntel: ' + err)
					}
				})
			})
		},
		openFile(file) {
			broadcast('Cinematic: Opening ' + file)
			open('file://' + file)
		},
		populateMovies(dirPath, recurse_level) {
			try {
				// Start loading bar
				State.update('0', {$set: {loading: 100}})

				// Read from filesystem
				const files = fs.readdirSync(dirPath)
				files.forEach((file, i) => {
					const ex = path.extname(file)
					if (
						ex &&
                        _.contains(settings.valid_types, ex.toLowerCase())
					) {
						// Found a movie!
						// this is where the magic happens
						Meteor.call('addMovie', file, {
							dirPath,
							ext: ex
						})
					} else if (recurse_level < settings.recurse_level) {
						// Ok let's try recursing, were avoiding as many fs calls as possible
						// which is why i didn't call it in the condition above
						// first, is this a directory?
						fs.lstat(
							dirPath + file,
							Meteor.bindEnvironment((err, stats) => {
								if (err) {
									broadcast(
										'fs error: ' + name + ': ' + err,
										true
									)
									return false
								}

								if (stats.isDirectory()) {
									Meteor.call(
										'populateMovies',
										dirPath + file + '/',
										recurse_level + 1
									)
								}
							})
						)
					}

					const state = State.findOne({_id: '0'})
					// Invert percentage (0 is done, 100% complete, false, off; 100 is 0% complete)
					const loaded = state && 100 - state.loading
				}) // End file scan forEach

				if (api_queue === 0) {
					State.update('0', {$set: {loading: 0}})
				}
			} catch (error) {
				broadcast(
					'Error populating movies. ' + error.name + ' ' + error.message,
					true
				)
			}
		},
		updatePath(path) {
			try {
				if (fs.existsSync(path) && fs.statSync(path).isDirectory()) {
					Movies.remove({})
					State.update('0', {$set: {path}})
				} else {
					throw new Error('Error: Path is not a directory.')
				}

				Meteor.call('populateMovies', path, 0)
			} catch (error) {
				broadcast(
					'Error getting path. ' + error.name + ' ' + error.message,
					true
				)
			}
		},
		updateGenres() {
			Genres.remove({})
			HTTP.call(
				'GET',
				settings.genre_url + '?api_key=' + settings.tmdb_key,
				(err, res) => {
					if (err) {
						broadcast('Cinematic/updateGenres: ' + err)
					} else if (res.data.genres) {
						res.data.genres.forEach(genre => {
							Meteor.call('addGenre', genre.id, null, genre.name)
						})
						State.update('0', {$set: {cache_genre: epoch()}})
					} else {
						broadcast('Cinematic: Error getting genre list.', true)
					}
				}
			)
		},
		updateIntel(mid, name, year) {
			omdbApi.get({
				omdb_key: settings.omdb_key,
				apiKey: settings.omdb_key,
				title: name,
				plot: settings.overview_length === 'short' ? 'short' : 'full'
			},
			Meteor.bindEnvironment((err, res) => {
				Meteor.call('queueDone', 'updateIntel')
				if (err) {
					broadcast(
						'ombd-client error: ' + name + ': ' + err,
						true
					)
					return false
				}

				// Strip runtime characters
				res.Runtime = res.Runtime.replace(/\D/g, '')
				// Toss any "N/A" response
				for (const key in res) {
					if (res[key] == 'N/A') {
						res[key] = null
					}
				}

				// Lets parse this shit proper
				const mov = Movies.findOne({_id: mid})
				if (res.imdbRating) {
					// TODO: SAFE GET .ratings
					mov.ratings.push({
						name: 'IMDB RATING',
						score: parseFloat(res.imdbRating),
						count: Array.apply(
							null,
							new Array(Math.round(res.imdbRating))
						).map(() => {
							return {}
						})
					})
				}

				if (res.Metascore) {
					mov.ratings.push({
						name: 'METASCORE RATING',
						score: res.Metascore / 10,
						count: Array.apply(
							null,
							new Array(Math.round(res.Metascore / 10))
						).map(() => {
							return {}
						})
					})
				}

				mov.imdb_id = res.imdbID
				mov.plot = res.Plot
				mov.poster = res.Poster
				mov.release_date = Date.parse(res.Released)
				mov.title = res.Title
				if (!mov.poster) {
					mov.poster = res.Poster
				}

				if (!mov.year) {
					mov.year = res.Year
				}

				mov.intel = res
				mov.cached = true // WE CACHE HALF-LOADED FILES. BAD? PROBABLY
				Movies.update(mid, mov)
			})
			)
		},
		updateInfo(mid, name, year) {
			movieInfo(
				name,
				year,
				Meteor.bindEnvironment((err, res) => {
					Meteor.call('queueDone', 'updateInfo')
					if (err) {
						broadcast(
							'movie-info error: ' + name + ': ' + err,
							true
						)
						return false
					}

					_.each(res.genre_ids, (e, i) => {
						Meteor.call('addGenre', e, mid, null)
					})
					// Lets parse this shit proper
					const mov = Movies.findOne({_id: mid})
					res.backdrop =
                        settings.base_url +
                        settings.backdrop_size +
                        res.backdrop_path
					if (res.vote_average) {
						mov.ratings.push({
							name: 'TMDB RATING',
							score: parseFloat(res.vote_average),
							count: Array.apply(
								null,
								new Array(Math.round(res.vote_average))
							).map(() => {
								return {}
							})
						})
					}

					mov.imdb_id = res.imdb_id
					mov.poster =
                        settings.base_url +
                        settings.poster_size +
                        res.poster_path
					mov.title = res.title
					if (!mov.plot) {
						mov.plot = res.overview
					}

					if (!mov.release_date) {
						mov.release_date = Date.parse(res.release_date)
					}

					if (!mov.year) {
						mov.year = res.Year
					}

					mov.info = res
					mov.cached = true // WE CACHE HALF-LOADED FILES. BAD? PROBABLY
					Movies.update(mid, mov)
				})
			)
		},
		updateTrailer(mid, name, year) {
			movieTrailer(
				name, {
					year,
					multi: true
				},
				Meteor.bindEnvironment((err, res) => {
					Meteor.call('queueDone', 'updateTrailer')
					if (err) {
						broadcast(
							'movie-trailer error: ' + name + ': ' + err,
							true
						)
						return false
					}

					Movies.update(mid, {$set: {trailer: res}})
				})
			)
		},
		updateRandom() {
			const seeds = Movies.find({}, {fields: {seed: 1}})
			seeds.forEach(seed => {
				Movies.update(seed._id, {$set: {seed: Math.random()}})
			})
		},
		queueIt(job, mid, name, year) {
			if (api_current >= settings.max_connections) {
				// Too many concurrent connections
				Meteor.setTimeout(() => {
					Meteor.call('queueIt', job, mid, name, year, (
						err,
						res
					) => {
						if (err) {
							broadcast('Cinematic/queueIt/retryError: ' + err)
						}
					})
				}, settings.retry_delay)
			} else {
				api_current += 1
				Meteor.call(job, mid, name, year, (err, res) => {
					if (err) {
						broadcast('Cinematic/queueIt/jobError: ' + err)
					}
				})
			}
		},
		queueDone(job) {
			api_current -= 1
			api_queue -= 1
			// Update loading percent every set
			if (api_queue === 0) {
				State.update('0', {$set: {loading: 0}})
				if (settings.cache) {
					Meteor.call('cacheMovies')
				}
			} else if (api_queue % settings.max_connections === 0) {
				State.update('0', {
					$set: {loading: Math.round(api_queue / api_total * 100)}
				})
			}
		},
		reset() {
			broadcast('Cinematic: Resetting server...')
			State.remove({})
			Recent.remove({})
			Watched.remove({})
			Genres.remove({})
			Movies.remove({})
			MovieCache.remove({})

			// Set default path
			const dir = Meteor.call('findMovieDir')

			const time = epoch()
			const sid = State.insert({
				_id: '0',
				path: dir,
				cwd: process.env.PWD
			})

			// Grab genre list
			Meteor.call('updateGenres')

			// Initial update
			Meteor.call('updatePath', dir)
		}
	})
} // End Meteor.isServer

/*
 * UTILITIES
 */

// safe console.log which outputs in the called context - client/server
var broadcast = function (msg, err) {
	if (err === true) {
		// Log error
	}

	Log.insert({time: epoch(), msg: (msg || err), error: Boolean(err)})
	if (typeof console !== 'undefined') {
		console.log(msg)
	}
}

var epoch = function () {
	const d = new Date()
	return d.getTime() / 1000
}

function replaceAll(str, find, replace) {
	return str.replace(new RegExp(find, 'g'), replace)
}

var parseName = function (name) {
	name = replaceAll(name, '_', ' ') // Replace underscores with spaces
	name = replaceAll(name, '-', ' ')
	return name
}
