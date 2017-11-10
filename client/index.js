/*
 * Cinematic, (c) 2017 Lacy Morrow - http://github/lacmorrow/cinematic
 * @license GPL

 * TODO
 * - Ability to add individual files via dialog
 * - Tell me which way filters are sorted by
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


/*
 * CLIENT
 */


if (Meteor.isClient) {

    if (Meteor.isDesktop) {
        // Send settings
        Desktop.send('desktop', 'load-settings', settings)
        // Receive files from browser
        Desktop.on('desktop', 'selected-file', function(event, data) {
            console.log('Selected File Dialog Data:', event, data);
            if (data.length === 1) {
                // Single folder to open
                $('#path').val(data[0]);
                setPath();
            }
        });
    } // end Meteor.isDesktop
    
    var settings = {

        /* Defaults */
        DEFAULT_PATH: '/Users/',
        sort_types: ["Alphabetical", "Popularity", "Release Date", "Runtime", "Random" /*, "Ratings" */ ],
        recurse_level: 1, // how many directory levels to recursively search. higher is further down the rabbit hole === more processing time
        rating_delay: 5000 // milli-seconds of rating rotate interval; 5000 = 5 seconds

    }
    

    var ratingTimer;
    var totalRatings;

    // observe db collections
    Meteor.subscribe("log");
    Meteor.subscribe("state");
    Meteor.subscribe("recent");
    Meteor.subscribe("watched");
    Meteor.subscribe("genres");
    Meteor.subscribe("movies");
    Meteor.subscribe("movieCache");

    /* Third-Party Progress bar: NProgress */
    NProgress.configure({ trickleRate: 0.01, trickleSpeed: 1400 });

    /* onReady */
    Template.body.rendered = function() {
        if (Meteor.isDesktop) {
            // Desktop Loaded
            isDesktop();
            // init browse button IPC
            $("#browse-link").removeClass("hide");
        } else {
            $('#browse-input').removeClass('hide');
        }
        $('[data-toggle="tooltip"]').tooltip();
    }

    /*
     * HELPERS
     * Define nav helpers
     */

    Template.registerHelper('equals',
        function(v1, v2) {
            return (v1 === v2);
        }
    );
    Template.registerHelper('gt',
        function(v1, v2) {
            return (v1 > v2);
        }
    );

    Template.body.helpers({
        page: function() {
            return Session.get('currentPage');
        }
    });
    Template.navigation.helpers({
        page: function() {
            return Session.get('currentPage');
        },
        genres: function() {
            return Genres.find({ 'items': { $exists: true } }, { sort: { name: 1 } }).fetch();
        },
        movieCount: function() {
            return Movies.find().count();
        },
        recentCount: function() {
            return Recent.find().count();
        },
        watchedCount: function() {
            return Watched.find().count();
        },
    });

    // define loading indicatior
    Template.header.helpers({
        loading: function() {
            var state = State.findOne({ _id: "0" });
            // invert percentage (0 is done, 100% complete, false, off; 100 is 0% complete)
            var loaded = state && (100 - state.loading);
            setLoaded(loaded / 100);
            return loaded;
        }
    });

    // define path helpers
    Template.path.helpers({
        path: function() {
            var state = State.findOne({ _id: "0" });
            return state && state.path;
        }
    });

    // define details helpers
    Template.details.helpers({
        rating: function() {
            return Session.get('activeRating');
        },
        settings: function() {
            return settings;
        },
        movie: function() {
            var movie = Movies.findOne({ _id: Session.get('currentMovie') });
            if (movie) {
                movie.ratings.map(function(o, i) {
                    movie.ratings[i].index = i;
                    if (i == movie.ratings.length - 1) {
                        movie.ratings[i].indexPlus = 0;
                    } else {
                        movie.ratings[i].indexPlus = i + 1;
                    }
                });
            }
            return movie;
        },
        currentTrailer: function() {
            return Session.get('currentTrailer');
        }
    });

    // define movies helpers
    Template.movies.helpers({
        movies: function() {
            var movies = Movies.find(Session.get('movieQuery'), Session.get('movieSort')).fetch();
            var index = 0;
            movies.map(function(o, i) {
                movies[i].index = index++;
            })
            return movies;
        }
    });

    // sort helpers
    Template.sort.helpers({
        showSort: function() {
            var currentSort = Session.get('currentSort');
            return currentSort != 'Recent';
        },
        sort: function() {
            return settings.sort_types;
        },
        currentSort: function() {
            return Session.get('currentSort');
        }
    });


    /*
     * Events
     */

    Template.body.events({
        "click #refresh": function(event) {
            broadcast('Cinematic: Resetting client...');
            resetClient();
            Meteor.call('reset');
        }
    });

    // sort event
    Template.sort.events({
        "change #sort": function(event, template) {
            var sort = $(event.currentTarget).val();
            Session.set('currentSort', sort);
            // warning, magic numbers below, indexs reference sort types above
            if (sort == settings.sort_types[0]) { // Alphabetical
                Session.set('movieSort', { sort: { name: 1 } });
            } else if (sort == settings.sort_types[1]) { // Popularity
                Session.set('movieSort', { sort: { 'info.popularity': -1 } });
            } else if (sort == settings.sort_types[2]) { // Release Date
                Session.set('movieSort', { sort: { 'info.release_date': -1 } });
            } else if (sort == settings.sort_types[3]) { // Runtime
                Session.set('movieSort', { sort: { 'intel.Runtime': 1 } });
            } else if (sort == settings.sort_types[4]) { // Random
                Session.set('movieSort', { sort: { 'seed': 1 } });
            } else if (sort == 'Ratings') { // inactive, should use avg ratings

            }
        },
        "click #random": function(event) {
            Meteor.call('updateRandom');
        }
    });

    // handle page changes with filter
    Template.navigation.events({
        "click #links-panel li.link": function(event) {
            var page = Session.get('currentPage');
            if (Session.get('currentSort') == 'Recent') {
                resetSort();
            }
            var pid = String(event.currentTarget.dataset.id);
            var currentPage = $(event.currentTarget).text();
            Session.set('currentPage', currentPage);
            // hide right panel
            Session.set('currentMovie', 0);
            var genre = Genres.findOne(pid);
            if (genre) {
                // genre page - All: alphabetical
                Session.set('movieQuery', { _id: { $in: Genres.findOne(pid).items } });
            } else if (currentPage == 'New') {
                // browse Recently Released
                Session.set('movieQuery', {});
            } else if (currentPage == 'Recent') {
                // browse recently viewed: alphabetical  **** HAVENT FIGURED OUT SORTING
                var recent = [];
                _.map(Recent.find().fetch(), function(e) {
                    recent.push(e._id);
                });
                Session.set('currentSort', 'Recent');
                Session.set('movieQuery', { _id: { $in: recent } });
                Session.set('movieSort', { sort: { 'recent_time': -1 } });
            } else if (currentPage == 'Watched') {
                // browse watched: order of watched
                var watched = [];
                _.map(Watched.find().fetch(), function(e) {
                    watched.push(e._id);
                });
                Session.set('currentSort', 'Recent');
                Session.set('movieQuery', { _id: { $in: watched } });
                Session.set('movieSort', { sort: { 'watched_time': -1 } });
            } else {
                // main page - All: alphabetical
                Session.set('movieQuery', {});
            }
        }
    });


    Template.details.events({
        "click #rating": function(event) {
            // switch ratings
            if (ratingTimer)
                Meteor.clearInterval(ratingTimer);
            ratingTimer = Meteor.setInterval(rotateRating, 4000);
            rotateRating();
        },
        "click #open-link": function(event) {
            var url = event.currentTarget.dataset.src;
            var mid = event.currentTarget.dataset.id;
            Meteor.call('addWatched', mid);
            Meteor.call('openFile', url);
        },
        "click #trailer .trailer": function(event) {
            // switch trailers
            Session.set('currentTrailer', event.currentTarget.dataset.id);
        }
    });

    // define movie events
    Template.movies.events({
        // show right panel
        "click .movie-image": function(event) {
            // switch current movie in details panel
            var id = event.currentTarget.dataset.id;
            var trailers = Movies.findOne({ '_id': id }, { fields: { trailer: 1 } });
            var ratings = Movies.findOne({ '_id': id }, { fields: { ratings: 1 } }).ratings;
            totalRatings = ratings.length;
            // set initial trailer
            var trailer = trailers && trailers.trailer && trailers.trailer[0] && trailers.trailer[0].key;
            Session.set('currentTrailer', trailer);
            // set current movie and add to recent
            Session.set('currentMovie', id);
            Meteor.call('addRecent', id);
            // set timer to rotate ratings
            if (ratingTimer)
                Meteor.clearInterval(ratingTimer);
            ratingTimer = Meteor.setInterval(rotateRating, 4000);
        },
        // TODO: All the keyboard navigation
        "keyup .movie-image": function(event) {
            var magnitude = 3; // $(".keyboard-magnitude").data('id'); // this should equal the number of movies per row
            event.preventDefault();
            if (event.which == 37) {
                // left
                var currTab = parseInt($('.movie-image:focus').attr('tabIndex')) - 1;
                $('.movie-image[tabIndex="' + currTab + '"]').click();
                $('.movie-image[tabIndex="' + currTab + '"]').focus();
            } else if (event.which == 39) {
                // right
                var currTab = parseInt($('.movie-image:focus').attr('tabIndex')) + 1;
                $('.movie-image[tabIndex="' + currTab + '"]').click();
                $('.movie-image[tabIndex="' + currTab + '"]').focus();
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
    });

    // define path events
    Template.path.events({
        "change #browse-input-directory": function(event) {
            event.preventDefault();
            broadcast(event.target.files);

            // broadcast
            for (var i = event.target.files.length - 1; i >= 0; i--) {
                Meteor.call('addMovie', event.target.files[i].name);
            }
        },
        "click #browse-input-link": function(event) {
            $('#browse-input-directory').click();
        },
        "keyup #path": function(event) {
            if (event.which == 13) {
                // on <enter> set path
                setPath();
            }
        },
        "click #search-refresh": function(event) {
            setPath();
        },
        "click #browse-link": function(event) {
            if (Meteor.isDesktop) {
                Desktop.send('desktop', 'open-file-dialog');
            }
        }
    });

    // client-side methods

    var isDesktop = function() {
        $('html').addClass('desktop-app');
    };

    var setLoaded = function(percentage) {
        NProgress.start();
        NProgress.set(percentage);
    }

    var setPath = function() {
        resetClient();
        var _path = document.getElementById('path');
        if (_path.value != '') {
            var path = _path.value;
            if (path.slice(-1) != '/') {
                path = path + '/';
            }
        } else {
            path = settings.DEFAULT_PATH;
        }
        Meteor.call('updatePath', path);
    }

    var resetSort = function() {
        // default sort values
        Session.set('currentSort', settings.sort_types[0]);
        Session.set('movieSort', { sort: { name: 1 } });
    }

    var rotateRating = function() {
        // broadcast(totalRatings); // !important! number of ratings sources < ------------------- MAGIC NUMBER HERE
        var x = Session.get('activeRating');
        Session.set('activeRating', (x + 1 == totalRatings ? 0 : x + 1));
    }

    // defaults
    var resetClient = function() {
        resetSort();
        Session.set('activeRating', 0);
        Session.set('currentMovie', 0);
        Session.set('currentPage', 'Movies');
        Session.set('movieQuery', {});
    }
    resetClient();
} // end Meteor.isClient


/*
 * UTILITIES
 */

// safe console.log which outputs in the called context - client/server
var broadcast = function(msg) {
    Log.insert({ time: epoch(), msg: msg });
    if (typeof console !== 'undefined')
        console.log(msg);
}

var epoch = function() {
    var d = new Date();
    return d.getTime() / 1000;
}
