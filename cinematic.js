/*
 * TODO
 * - Additional Movie filters
 * - Watch/IMDB links nicer
 * - combine info & allow preferences between sources (look out for null/'N/A' values)
 * - Documentation
 ########## Bulletproof
 * - cache movies (or urls?)
 * - Random refresh button -> add a random field and refresh it; use it as sort
 * - average rating
 * - account for missing sort params
 * - Unused data: popularity, country, language, awards
 * - auto rename files
 * - limit, possibly paginate
 * - sorting by runtime, ratings
 * - file browser
 */


var settings = {
  DEFAULT_PATH: '/Users/lacymorrow/Downloads/',
  valid_types: ['.avi', '.flv', '.mp4', '.m4v', '.mov', '.ogg', '.ogv', '.vob', '.wmv'],
  sort_types: ["Alphabetical", "Popularity", "Recently Released", "Random"/* , "Runtime", "Ratings" */ ],
  cache: 3600, // seconds; 604800 = 7 days
  overview_length: 'short', // "short", "full" - from omdb

  // http://docs.themoviedb.apiary.io/ config
  key: '9d2bff12ed955c7f1f74b83187f188ae',
  base_url: "http://image.tmdb.org/t/p/",
  secure_base_url: "https://image.tmdb.org/t/p/",
  genre_url: "http://api.themoviedb.org/3/genre/movie/list",
  backdrop_size: 'w1280', // "w300", "w780", "w1280", "original"
  poster_size: 'w185', //"w92", "w154", "w185", "w342", "w500", "w780", "original",

  // app-specific -- affects how app is run and may affect performance
  max_connections: 5, // max number of simultaneous
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
  // observe db collections
  Meteor.subscribe("state");
  Meteor.subscribe("recent");
  Meteor.subscribe("watched");
  Meteor.subscribe("genres");
  Meteor.subscribe("movies");
  Meteor.subscribe("movieCache");

  var ratingTimer;
  NProgress.configure({ trickleRate: 0.01, trickleSpeed: 800 });

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

  // define loading indicatior
  Template.header.helpers({
    loading: function () {
      var state = State.findOne({_id: "0"});
      // invert percentage (0 is done, 100% complete, false, off; 100 is 0% complete)
      var loaded = state && (100-state.loading);
      setLoaded(loaded/100);
      return loaded;
    }
  });

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
    currentTrailer: function () {
      return Session.get('currentTrailer');
    }
  });

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

  // define path helpers
  Template.path.helpers({
    path: function () {
      var state = State.findOne({_id: "0"});
      return state && state.path;
    }
  });

  // sort helpers
  Template.sort.helpers({
      sort: function(){
          return settings.sort_types;
      },
      currentSort: function () {
        return Session.get('currentSort');
      }
  });

  // sort event
  Template.sort.events({
      "change #sort": function (event, template) {
        var sort = $(event.currentTarget).val();
        Session.set('currentSort', sort);
        if(sort == 'Alphabetical') {
          Session.set('movieSort', { sort: { name: 1 }});
        } else if (sort == 'Popularity') {
          Session.set('movieSort', { sort: { 'info.popularity': -1 }});
        } else if (sort == 'Recently Released') {
          Session.set('movieSort', { sort: { 'info.release_date': -1 }});
        } else if (sort == 'Runtime') { // inactive
          Session.set('movieSort', { sort: { 'Intel.Runtime': -1 }});
        } else if (sort == 'Random') {
          Session.set('movieSort', { sort: { 'seed': 1 }});
        } else if (sort == 'Ratings') { // inactive, should use avg ratings

        }
      },
      "click #random": function (event) {
        Meteor.call('updateRandom');
      }
  });

  // handle page changes with filter
  Template.navigation.events = {
    "click #links-panel li.link": function (event) {
      var pid = $(event.currentTarget).data('id');
      var currentPage = $(event.currentTarget).text();
      Session.set('currentPage', currentPage);
      // hide right panel
      Session.set('currentMovie', 0);
      var genre = Genres.findOne(pid);
      if(!!genre) {
        // genre page - All: alphabetical
        Session.set('movieQuery', {_id: { $in: Genres.findOne(pid).items}});
      } else if(currentPage == 'Popular') {
        // browse popular: Popularity
        Session.set('movieQuery', {});
      }  else if(currentPage == 'Random') {
        // browse random: Random
        Session.set('movieQuery', {});
      }  else if(currentPage == 'New') {
        // browse Recently Released
        Session.set('movieQuery', {});
      }  else if(currentPage == 'Recent') {
        // browse recently viewed: alphabetical  **** HAVENT FIGURED OUT SORTING
        var recent = [];
        _.map(Recent.find().fetch(), function(e){
          recent.push(e._id);
        });
        Session.set('movieQuery', {_id: { $in: recent }});
      } else if(currentPage == 'Watched') {
        // browse watched: order of watched
        Session.set('movieQuery', {_id: { $in: Watched.find().fetch()}});
      }  else {
        // main page - All: alphabetical
        Session.set('movieQuery', {});
      }
    }
  }


  Template.details.events = {
    "click #rating" : function (event) {
      // switch ratings
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
    },
    "click #trailer .trailer" : function (event) {
      // switch trailers
      Session.set('currentTrailer', event.currentTarget.dataset.id);
    }
  }

  // define movie events
  Template.movies.events = {
    // show right panel
    "click .movie-image": function (event){
      // switch current movie in details panel
      var id = event.currentTarget.dataset.id;
      var trailers = Movies.findOne({'_id': id}, {fields: {trailer: 1}});
      // set initial trailer
      var trailer = trailers && trailers.trailer && trailers.trailer[0] && trailers.trailer[0].key;
      Session.set('currentTrailer', trailer);
      // set current movie and add to recent
      Session.set('currentMovie', id);
      Meteor.call('addRecent', id);
      // set timer to rotate ratings
      if(ratingTimer)
        Meteor.clearInterval(ratingTimer);
      ratingTimer = Meteor.setInterval(rotateRating, 4000);
    },
    "keyup .movie-image": function (event){
      var magnitude = 3; // $(".keyboard-magnitude").data('id'); // this should equal the number of movies per row
      event.preventDefault();
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
  }

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

  var setLoaded = function (percentage) {
    NProgress.start();
    NProgress.set(percentage);
  }
  var setPath = function () {
    resetClient();
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

  var resetSort = function () {
    // default sort values
    Session.set('currentSort', settings.sort_types[0]);
    Session.set('movieSort', { sort: { name: 1 }});
  }

  var rotateRating = function () {
    var totalRatings = 3; // !important! number of ratings sources < ------------------- MAGIC NUMBER HERE
    var x =  Session.get('activeRating');
    Session.set('activeRating',(x + 1 == totalRatings ? 0: x + 1));
  }

  // defaults
  var resetClient = function () {
    resetSort();
    Session.set('activeRating', 0);
    Session.set('currentMovie', 0);
    Session.set('currentPage', 'All');
    Session.set('movieQuery', {});
  }
  resetClient();
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

  // startup functions
  Meteor.startup(function () {
    Future = Npm.require('fibers/future');
    // setup db - optionally clear movies and path
    Movies.remove({});
    // State.remove({});

    // welcome message
    broadcast('\n----- Cinematic -----');

    // set default path
    var time = epoch();
    var sid = State.upsert('0', {path: settings.DEFAULT_PATH, cache_genre: time - 1});

    // grab genre list
    var state = State.findOne({_id:"0"});
    if(!!state && time < state.cache_genre+settings.cache) {
      broadcast('Cinematic: Updating genre cache.');
      Meteor.call('updateGenres');
    } else {
      broadcast('Cinematic: Loading cached genre list.')
    }
    // initial update
    Meteor.call('updatePath', settings.DEFAULT_PATH);
  }); // end startup

  // number of concurrent api connections; currently doesn't distinguish between different api source limits
  // total, number left to process, currently processing
  var api_total = 0, api_queue = 0, api_current = 0;

  // server-side methods
  Meteor.methods({
    addRecent: function (mid) {
      var recent = Recent.find({'_id': mid});
      if(recent){
        Recent.remove({'_id': mid});
      }
      Recent.insert({ '_id':mid, 'time': epoch() });
      // Recent.upsert({ '_id': mid });
    },
    addWatched: function (mid) {
      Watched.update({},{ $push: { 'mid': mid }});
    },
    cacheMovies: function () {
      var movies = Movies.find();
      var time = epoch();
      movies.forEach(function(movie){
        if(!movie.cache_date)
        MovieCache.upsert({'_id': movie.path+movie.file}, {cache_date: time, movie: movie});
      });
      State.update("0", {$set: {cache_movies: time}});
    },
    cacheMovie: function (file) {
      var mov = Movies.findOne({'file': file});
      mov.cache_date = epoch();
      if(!!mov){
        MovieCache.insert(mov);
      }
    },
    getIntel: function(mid, name, year) {

      // updates to gather
      var jobs = [
        'updateIntel',
        'updateInfo',
        'updateTrailer'
      ];
      _.map(jobs, function(job){
        api_queue += 1;
        api_total += 1;
        Meteor.call('queueIt', job, mid, name, year, function(err, res) {
          if(err)
            broadcast(err);
        });
      });
    },
    openFile: function (file) {
      broadcast('Cinematic: Opening ' + file);
      open('file://' + file);
    },
    populateMovies: function (dirPath, recurse_level) {
      try {
        // start loading bar
        State.update("0", {$set: {loading: 100}});

        // read from filesystem
        var files = fs.readdirSync(dirPath);
        var time = epoch();
        files.forEach(function(file, i){
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
              var hash = dirPath+file;
              var movc = MovieCache.findOne({'_id': hash});
              if(!!movc && settings.cache && movc.movie && time < movc.cache_date+settings.cache){
                broadcast('cached: ' + movc._id);
                // cached
                var mid = movc._id;
                Movies.insert(movc.movie);
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
                  seed: Math.random(),
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
                Meteor.call('getIntel', mid, name, year);
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
          var state = State.findOne({_id: "0"});
          // invert percentage (0 is done, 100% complete, false, off; 100 is 0% complete)
          var loaded = state && (100-state.loading);
        }); // end file scan forEach
        if(api_queue === 0){
          State.update("0", {$set: {loading: 0}});
        }
      } catch (e) {
        broadcast('Error populating movies. ' + e.name + ' ' + e.message);
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
        broadcast('Error getting path. ' + e.name + ' ' + e.message);
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
        Meteor.call('queueDone', 'updateIntel');
        if(err){
          broadcast(name + ': ' + err);
          return false;
        }
        Movies.update(mid, { $set: {intel: res}});
      }));
    },
    updateInfo: function (mid, name, year) {
      movieInfo(name, year, Meteor.bindEnvironment(function (err, res){
        Meteor.call('queueDone', 'updateInfo');
        if(err){
          broadcast(name + ': ' + err);
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
    updateTrailer: function (mid, name, year) {
      movieTrailer(name, year, true, Meteor.bindEnvironment(function (err, res){
        Meteor.call('queueDone', 'updateTrailer');
        if(err){
          broadcast(name + ': ' + err);
          return false;
        }
        Movies.update(mid, { $set: {trailer: res}});
      }));
    },
    updateRandom: function () {
      var seeds = Movies.find({}, {fields: {'seed':1}});
      seeds.forEach(function(seed){
        Movies.update(seed._id, {$set: {'seed': Math.random()}});
      });
    },
    queueIt: function (job, mid, name, year) {
      if(api_current >= settings.max_connections){
        // too many concurrent connections 
        Meteor.setTimeout(function() {
          Meteor.call('queueIt', job, mid, name, year, function (err, res) {
            if(err){
              broadcast(err);
            }
          });
        }, settings.retry_delay);
      } else { 
        api_current += 1;
        Meteor.call(job, mid, name, year, function (err, res) {
          if(err){
            broadcast(err);
          } 
        });
      }
    },
    queueDone: function (job) {
      api_current -= 1;
      api_queue -= 1;
      // update loading percent every set
      if(api_queue === 0) {
        State.update("0", {$set: {loading: 0}});
        if(settings.cache){
          Meteor.call('cacheMovies');
        }
      } else if(api_queue % settings.max_connections === 0) {
        State.update("0", {$set: {loading: Math.round((api_queue/api_total)*100)}});
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