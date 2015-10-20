/*
 * TODO
 * - Watch/IMDB links nicer
 * - Documentation
 * - Node-webkit
 * - keyboard on small screens
 * - popularity, country, language, awards
 * - auto rename files
 * - watched
 * - newly added
 * - cache movies
 * - cache photos
 * - cooler rating animation
 * - combine info & allow preferences between sources
 * - show all availale trailers
 * - scrolling chrome bug
 * - sorting
 * - file browser
 */


var settings = {
  DEFAULT_PATH: '/Users/lacymorrow/Downloads/',
  cache: 0, // seconds; 604800 = 7 days
  valid_types: ['.avi', '.flv', '.mp4', '.m4v', '.mov', '.ogg', '.ogv', '.vob', '.wmv'],
  overview_length: 'short', // "short", "full" - from omdb

  // http://docs.themoviedb.apiary.io/ config
  key: '9d2bff12ed955c7f1f74b83187f188ae',
  base_url: "http://image.tmdb.org/t/p/",
  secure_base_url: "https://image.tmdb.org/t/p/",
  genre_url: "http://api.themoviedb.org/3/genre/movie/list",
  backdrop_size: 'w1280', // "w300", "w780", "w1280", "original"
  poster_size: 'w185', //"w92", "w154", "w185", "w342", "w500", "w780", "original",

  // app-specific -- affects how app is run and may affect performance
  max_connections: 30, // max number of simultaneous
  parse_method: "parse", // "regex", "parse"
  rating_delay: 5000, // milli-seconds of rating rotate interval; 5000 = 5 seconds
  retry_delay: 3000, // milli-seconds delay of retrying failed api requests to alieviate thousands of simultaneous requests;
  recurse_level: 2 // how many directory levels to recursively search. higher is further down the rabbit hole.
}

// define db collections
State = new Mongo.Collection("state");
Recent = new Mongo.Collection("recent");
Watched = new Mongo.Collection("watched");
Genres = new Mongo.Collection("genres");
Movies = new Mongo.Collection("movies");
MovieCache = new Mongo.Collection("movieCache");



/*
 * CLIENT
 */
 
 if (Meteor.isClient) {
  // start page
  Session.set('activeRating', 0);
  Session.set('currentPage', 'All');
  Session.set('movieQuery', {});
  Session.set('movieSort', { sort: { name: 1 }});

  // observe db collections
  Meteor.subscribe("state");
  Meteor.subscribe("recent");
  Meteor.subscribe("watched");
  Meteor.subscribe("genres");
  Meteor.subscribe("movies");
  Meteor.subscribe("movieCache");

  var ratingTimer;

  Template.registerHelper('equals',
      function(v1, v2) {
          return (v1 === v2);
      }
  );
  Template.registerHelper('gt',
      function(v1, v2) {
          broadcast(v1 +'   '+ v2);
          return (v1 > v2);
      }
  );

  // define nav helpers
  Template.body.helpers({
    page: function () {
      return Session.get('currentPage');
    }
  });
  Template.navigation.helpers({
    page: function () {
      return Session.get('currentPage');
    },
    genres: function () {
      return Genres.find({'items': {$exists : true }},{ sort: { name: 1 }}).fetch();
    },
    movieCount: function () {
      return Movies.find().count();
    },
  });

  // handle page changes with filter/sort
  Template.navigation.events = {
    "click #links-panel li.link": function (event) {
      var pid = $(event.currentTarget).data('id');
      var currentPage = $(event.currentTarget).text();
      Session.set('currentPage', currentPage);
      Session.set('movieSort', { sort: { name: 1 }});
      var genre = Genres.findOne(pid);
      if(!!genre) {
        // genre page - All: alphabetical
        Session.set('movieQuery', {_id: { $in: Genres.findOne(pid).items}});
        Session.set('movieSort', { sort: { name: 1 }});
      } else if(currentPage == 'Popular') {
        // browse popular: Popularity
        Session.set('movieQuery', {});
        Session.set('movieSort', { sort: { 'info.popularity': -1 }});
      }  else if(currentPage == 'Random') {
        // browse random: Random
        Session.set('movieQuery', {});
        Session.set('movieSort', { sort: { '_id': 1 }});
      }  else if(currentPage == 'New') {
        // browse release date
        Session.set('movieQuery', {});
        Session.set('movieSort', { sort: { 'year': -1, 'info.release_date': -1 }});
      }  else if(currentPage == 'Recent') {
        // browse recently viewed: alphabetical
        Session.set('movieQuery', {});
      } else if(currentPage == 'Watched') {
        // browse watched: order of watched
        Session.set('movieQuery', {_id: { $in: Watched.find().fetch()}});
      }  else {
        // main page - All: alphabetical
        Session.set('movieQuery', {});
        Session.set('movieSort', { sort: { name: 1 }});
      }
    }
  }

  // define details helpers
  Template.details.helpers({
    rating: function () {
      return Session.get('activeRating');
    },
    settings: function () {
      return settings;
    },
    movie: function () {
      var mov = Movies.findOne({_id: Session.get('currentMovie')});
      if(!!mov) {
        var tmdbCount = [];
        var metaCount = [];
        var imdbCount = [];
        if(mov.info.vote_average){
          for(var i = 0; i < Math.round(mov.info.vote_average); i++) {
            tmdbCount.push({});
          }
          mov.tmdb_rank = tmdbCount;
          mov.itmdb_rank = 10 - tmdbCount.length;
        }
        if(mov.intel.Metascore){
          for(var i = 0; i < Math.round(mov.intel.Metascore/10); i++) {
            metaCount.push({});
          }
          mov.meta_rank = metaCount;
          mov.imeta_rank = 10 - metaCount.length;
        }
        if(mov.intel.imdbRating){
          for(var i = 0; i < Math.round(mov.intel.imdbRating); i++) {
            imdbCount.push({});
          }
          mov.imdb_rank = imdbCount;
          mov.iimdb_rank = 10 - imdbCount.length;
        }
      }
      return mov;
    },

  });

  Template.details.events = {
    "click #rating" : function (event) {
      if(ratingTimer)
        Meteor.clearInterval(ratingTimer);
      ratingTimer = Meteor.setInterval(rotateRating, 4000);
      rotateRating();
    }, 
    "click #open-link": function (event) {
      var url = $(event.currentTarget).data('src');
      Meteor.call('openFile', url);
    },
    "click #imdb-link": function (event) {
      var url = $(event.currentTarget).data('id');
      Meteor.call('openFile', url);
    }
  }

  // define movies helpers
  Template.movies.helpers({
    settings: function () {
      return settings;
    },
    movies: function () {
      var movies = Movies.find(Session.get('movieQuery'), Session.get('movieSort')).fetch();
      var index = 0;
      movies.map(function(o, i) {
        movies[i].index = index++;
      })

      return movies;
    }
  });

  // define movie events
  Template.movies.events = {
    // show right panel
    "click .movie-image": function (event){
      Session.set('currentMovie', event.currentTarget.dataset.id);
      Meteor.call('addRecent', event.currentTarget.dataset.id);
      // set timer to rotate ratings
      if(ratingTimer)
        Meteor.clearInterval(ratingTimer);
      ratingTimer = Meteor.setInterval(rotateRating, 4000);
    },
    // hide right panel
    "blur .movie-image": function (event){

    },
    "keyup .movie-image": function (event){
      var magnitude = 3; // $(".keyboard-magnitude").data('id');
      if(event.which == 37){
        // left
        var currTab = parseInt($('.movie-image:focus').attr('tabIndex')) - 1;
        $('.movie-image[tabIndex="'+currTab+'"]').click();
        $('.movie-image[tabIndex="'+currTab+'"]').focus();
      } else if(event.which == 39){
        // right
        var currTab = parseInt($('.movie-image:focus').attr('tabIndex')) + 1;
        $('.movie-image[tabIndex="'+currTab+'"]').click();
        $('.movie-image[tabIndex="'+currTab+'"]').focus();
      } else if(event.which == 38){
        // up
        var currTab = parseInt($('.movie-image:focus').attr('tabIndex')) - magnitude;
        $('.movie-image[tabIndex="'+currTab+'"]').click();
        $('.movie-image[tabIndex="'+currTab+'"]').focus();
      } else if(event.which == 40){
        // down
        var currTab = parseInt($('.movie-image:focus').attr('tabIndex')) + magnitude;
        $('.movie-image[tabIndex="'+currTab+'"]').click();
        $('.movie-image[tabIndex="'+currTab+'"]').focus();
      }
    }
  }

  // define path helpers
  Template.path.helpers({
    path: function () {
      state = State.findOne({_id: "0"});
      return state && state.path;
    }
  });

  // define path events
  Template.path.events = {
    "keyup #path": function (event){
      if(event.which == 13){
        // on <enter> set path
        setPath();
      }
    }
  }

  // client-side methods
  var setPath = function () {
    var _path = document.getElementById('path');
    if(_path.value != ''){
      var path = _path.value;
      if (path.lastIndexOf('/') !== path.length - 1){
        path = path + '/';
      }
    } else {
      path = settings.DEFAULT_PATH;
    }
    Meteor.call('updatePath', path);
  }

  var rotateRating = function () {
    var totalRatings = 3; // !important! number of ratings sources < ------------------- MAGIC NUMBER HERE
    var x =  Session.get('activeRating');
    Session.set('activeRating',(x + 1 == totalRatings ? 0: x + 1));
  }
} // end Meteor.isClient


/*
 * SERVER
 */

if (Meteor.isServer) {
  // import npm packages
  var open = Meteor.npmRequire('open');
  var omdbApi = Meteor.npmRequire('omdb-client');
  var movieInfo = Meteor.npmRequire('movie-info');
  var movieTrailer = Meteor.npmRequire('movie-trailer');
  var parseTorrentName = Meteor.npmRequire('parse-torrent-name');

  // define observable collections
  Meteor.publish("state", function () { return State.find(); });
  Meteor.publish("recent", function () { return Recent.find(); });
  Meteor.publish("watched", function () { return Watched.find(); });
  Meteor.publish("genres", function () { return Genres.find(); });
  Meteor.publish("movies", function () { return Movies.find(); });
  Meteor.publish("movieCache", function () { return MovieCache.find(); });

  // server globals
  var api_queue = 0; // number of concurrent api connections; currently doesn't distinguish between different api source limits

  // startup functions
  Meteor.startup(function () {
    Future = Npm.require('fibers/future');
    // setup db - optionally clear movies and path
    Movies.remove({});
    // State.remove({});

    // welcome message
    broadcast('\n----- Cinematic -----');

    // set default path
    var currtime = epoch();
    var sid = State.upsert('0', {path: settings.DEFAULT_PATH, cache_genre: currtime - 1});

    // grab genre list
    var state = State.findOne({_id:"0"});
    if(!!state && currtime > state.cache_genre+settings.cache) {
      broadcast('Cinematic: Updating genre cache.');
      Meteor.call('updateGenres');
    } else {
      broadcast('Cinematic: Loading cached genre list.')
    }
    // initial update
    Meteor.call('updatePath', settings.DEFAULT_PATH);
  }); // end startup

  // server-side methods
  Meteor.methods({
    addRecent: function (mid) {
      Recent.insert(mid);
    },
    addWatched: function (mid) {

    },
    cacheMovie: function (file) {
      var mov = Movies.findOne({file: file});
      mov.cache_date = epoch();
      if(!!mov){
        MovieCache.insert(mov);
      }
    },
    getIntel: function(mid, name, year) {

      // updates to gather
      Meteor.call('updateIntel', {mid, name, year}, function(err, res) {

      }
      var jobs = [
        'updateIntel',
        'updateInfo',
        'updateTrailer'
      ];
      _.map(jobs, function(job){
        Meteor.call('queueIt', job, {mid, name, year}, function(err, res) {
          if(err)
            broadcast(err);
        });
      });


      // // Keep track of each job in an array
      // var futures = _.map(jobs, function(job) {

      //   // Set up a future for the current job
      //   var future = new Future();

      //   // a callback so the job can signal completion
      //   var onComplete = future.resolver();
      //   Meteor.call(job, mid, name, year, function(err, res) {
      //     // Inform the future that we're done with it
      //     onComplete(err, res);
      //   });
        // Return the future
      //   return future;
      // });

      // return Future.wait(futures);
    },
    openFile: function (file) {
      broadcast('Cinematic: Opening ' + file);
      open('file://' + file);
    },
    populateMovies: function (dirPath, recurse_level) {
      try {
        var files = fs.readdirSync(dirPath);
        files.forEach(function(file){
          var ex = path.extname(file);
          if (ex && _.contains(settings.valid_types, ex)) {
            // found a movie!
            // this is where the magic happens

            if(settings.parse_method == "regex") {
              var regex = /^(.*?)(?:\[? ([\d]{4})?\]?|\(?([\d]{4})?\)?)$/g;
              var match = regex.exec(path.basename(file, ex));
              var name = year = null;
              if(!!match){
                name = unescape(match[1]);
                if(match.length > 1 && !isNaN(parseFloat(match[3])) && isFinite(match[3])){
                  year = match[3];
                }
              }
            } else {
              var fileName = file.substr(0, file.length-ex.length);
              var parsedName = parseTorrentName(file.substr(0, file.length-ex.length));
              var name = (parsedName.title) ? parsedName.title : null;
              var year = (parsedName.year) ? parsedName.year : null;
            }

            if(name){
              // cache handling
              var movc = MovieCache.findOne({file: file});
              if(settings.cache && epoch() > movc.cache_date+settings.cache && !!movc){
                // cached
                var mid = movc._id;
                Movies.insert(movc);
              } else {
                //not cached
                // add item to collection
                var mid = Movies.insert({
                  ext: ex,
                  file: file,
                  name: name,
                  path: dirPath,
                  year: year,
                  trailer: null,
                  info: {
                    adult: false,
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
                  }
                });
                // make api calls to gather info
                Meteor.call('getIntel', mid, name, year, function(err, res){
                  // store movie to cache
                  Meteor.call('cacheMovie', file);
                });
              }
            }
          } else if (recurse_level < settings.recurse_level) {
            // ok let's try recursing, were avoiding as many fs calls as possible
            // which is why i didn't call it in the condition above
            // fs.lstat(dirPath+file, function(err, stats) {
            //   if(stats.isDirectory()) {
            //     broadcast('recurse' + recurse_level);
            //     Meteor.call('populateMovies', dirPath + file, recurse_level+1);
            //   }
            // });
          }
        });
      } catch (e) {
        broadcast(e.name + ' ' + e.message);
      }
    },
    updatePath: function (path) {
      try {
        if(fs.statSync(path).isDirectory()) {
          Movies.remove({});
          State.update("0", {$set: {path: path}});
        } else {
          throw new Error("Error: Path is not a directory.");
        }
        Meteor.call('populateMovies', path, 0);
      } catch (e) {
        broadcast(e.name + ' ' + e.message);
      }
    },
    updateGenres: function () {
      Genres.remove({});
      HTTP.call("GET", settings.genre_url+'?api_key='+settings.key,
                      function (err, res) {
                        if (err) {
                          broadcast(err);
                        } else if (!!res.data.genres){
                          res.data.genres.forEach(function(genre){
                            Genres.upsert({"_id": genre.id}, {id: genre.id, name: genre.name});
                          });
                          State.update("0", {$set: {cache_genre: epoch()}});
                        } else {
                          broadcast('Cinematic: Error getting genre list.')
                        }
                      });
    },
    updateIntel: function (mid, name, year) {
      omdbApi.get({title: name, plot: (settings.overview_length === 'short') ? 'short' : 'full'}, Meteor.bindEnvironment(function (err, res){
        if(err){
          broadcast(err);
          return false;
        }
        Movies.update(mid, { $set: {intel: res}});
      }));
    },
    updateInfo: function (mid, name, year) {

      movieInfo(name, year, Meteor.bindEnvironment(function (err, res){
        if(err){
          broadcast(err);
          return false;
        }
        _.each(res.genre_ids, function (e, i) {
          var genre = Genres.findOne({"_id": e});
          if(!!genre) {
            var items = genre.items || [];
            items.push(mid);
            Genres.update(e, { $set: {items: items}});
          } else {
            Genres.insert({_id: e, id: null, name: null, items: [mid]});
          }
        });
        Movies.update(mid, { $set: {info: res}});
      }));
    },
    updateTrailer: function (params.mid, params.name, year) {
      movieTrailer(params.name, year, true, Meteor.bindEnvironment(function (err, res){
        if(err){
          broadcast(err);
          return false;
        }
        Movies.update(params.mid, { $set: {trailer: res}});
      }));
    },
    queueIt: function (job, params) {
      if(api_queue >= settings.max_connections){ 
        // too many concurrent connections 
        Meteor.setTimeout(function() {
          Meteor.call(queueIt, job, params, function (err, res) {
            if(err){
              broadcast(err);
            }
          });
        }, settings.retry_delay);
      } else { 
        Meteor.call(job, params, function (err, res) {
          if(err){
            broadcast(err);
          } 
        });
      }
    }
  });

} // end Meteor.isServer


/*
 * UTILITIES
 */

// safe console.log which outputs in the called context - client/server
broadcast = function (msg) {
  if (typeof console !== 'undefined')
    console.log(msg);
}

var epoch = function () {
  var d = new Date();
  return d.getTime() / 1000;
}