/*
 * TODO
 * - auto rename files
 * - popular movies
 * - recent
 * - watched
 * - cache movies
 * - cache photos
 * - newly added
 * - keyboard on small screen
 */


var settings = {
  DEFAULT_PATH: '/Users/lacymorrow/Downloads/',
  cache: 0, // seconds; 604800 = 7 days
  valid_types: ['.avi', '.flv', '.mp4', '.m4v', '.mov', '.ogg', '.ogv', '.vob', '.wmv'],
  overview_length: 'short', // short, full
  // http://docs.themoviedb.apiary.io/ config
  key: '9d2bff12ed955c7f1f74b83187f188ae',
  base_url: "http://image.tmdb.org/t/p/",
  secure_base_url: "https://image.tmdb.org/t/p/",
  genre_url: "http://api.themoviedb.org/3/genre/movie/list",
  backdrop_size: 'w1280', // "w300", "w780", "w1280", "original"
  poster_size: 'w185' //"w92", "w154", "w185", "w342", "w500", "w780", "original"
}

// define db collections
State = new Mongo.Collection("state");
Genres = new Mongo.Collection("genres");
Movies = new Mongo.Collection("movies");
MovieCache = new Mongo.Collection("movieCache");



/*
 * CLIENT
 */
 
 if (Meteor.isClient) {
  // start page
  Session.set('currentPage', 'All');
  Session.set('movieQuery', {});

  // observe db collections
  Meteor.subscribe("state");
  Meteor.subscribe("genres");
  Meteor.subscribe("movies");
  Meteor.subscribe("movieCache");

  Template.registerHelper('equals',
      function(v1, v2) {
          return (v1 === v2);
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

  Template.navigation.events = {
    "click #links-panel li.link": function (event) {
      var pid = $(event.currentTarget).data('id');
      var currentPage = $(event.currentTarget).text();
      Session.set('currentPage', currentPage);
      var genre = Genres.findOne(pid);
      if(!!genre) {
        Session.set('movieQuery', {_id: { $in: Genres.findOne(pid).items}});
      } else if(currentPage == 'Popular') {
        Session.set('movieQuery', {});
      }  else if(currentPage == 'Random') {
        Session.set('movieQuery', {});
      }  else if(currentPage == 'New') {
        Session.set('movieQuery', {});
      }  else if(currentPage == 'Recent') {
        Session.set('movieQuery', {});
      } else if(currentPage == 'Watched') {
        Session.set('movieQuery', {});
      }  else {
        Session.set('movieQuery', {});
      }
    }
  }

  // define details helpers
  Template.details.helpers({
    settings: function () {
      return settings;
    },
    movie: function () {
      return Movies.findOne({_id: Session.get('currentMovie')});
    },
  });

  Template.details.events = {
    "click #open": function (event) {
      $(event).preventDefault();
      var url = $(event.currentTarget).data('src');
      Meteor.call('openFile', url);
    }
  }

  // define movies helpers
  Template.movies.helpers({
    settings: function () {
      return settings;
    },
    movies: function () {
      var movies = Movies.find(Session.get('movieQuery'), { sort: { name: 1 }}).fetch();
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
    },
    // hide right panel
    "blur .movie-image": function (event){

    },
    "keyup .movie-image": function (event){
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
        var currTab = parseInt($('.movie-image:focus').attr('tabIndex')) - 3;
        $('.movie-image[tabIndex="'+currTab+'"]').click();
        $('.movie-image[tabIndex="'+currTab+'"]').focus();
      } else if(event.which == 40){
        // down
        var currTab = parseInt($('.movie-image:focus').attr('tabIndex')) + 3;
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

  // setup event handlers
  // window.load(function () {
  //   var movieLinks = document.getElementByClassName('movie-link');
  //   for (var i = 0; i < movieLinks.length; i++) {
  //     var url = movieLinks[i].dataset.src;
  //     movieLinks[i].addEventListner('click', function () { Meteor.call('openFile', url); });
  //   };
  // });
  /*
  $(document).ready(function(){
    $(document).on("click", 'img.movie', function (e) {
        var url = $(this).attr('data-src');
        Meteor.call('openFile', url);
    });
    $(document).on("click", 'a.movie', function (e) {
      e.preventDefault();
        var url = $(this).attr('href');
        Meteor.call('openFile', url);
    });
  });
  */
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
  try {
      Meteor.npmRequire('node-apple-remote')
          .on('left', function(e) {
            console.log('yayayaya');
          })
  } catch (e) {
      // an exception is thrown if the apple remote 
      //  device was not found on the system 
  }

  // define observable collections
  Meteor.publish("state", function () { return State.find(); });
  Meteor.publish("genres", function () { return Genres.find(); });
  Meteor.publish("movies", function () { return Movies.find(); });
  Meteor.publish("movieCache", function () { return MovieCache.find(); });

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
    if(currtime > State.findOne({_id:"0"}).cache_genre+settings.cache) {
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
      // var state = State.findOne("0");
      // if(!!state) {
      //   var recents = state.recents || [];
      //   recents.push(mid);
      //   State.update('0', { $set: {recents: recents}});
      // } else {
      //   State.insert({_id: '0', recents: [mid]});
      // }
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
      var jobs = [
        'updateIntel',
        'updateInfo',
        'updateTrailer'
      ];
      _.map(jobs, function(job){
        Meteor.call(job, mid, name, year, function(err, res) {

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
    populateMovies: function (dirPath) {
      try {
        var files = fs.readdirSync(dirPath);
        files.forEach(function(file){
          var ex = path.extname(file);
          if (_.contains(settings.valid_types, ex)) { //!file.startsWith('.') &&
            // this is where the magic happens
            var regex = /^(.*?)(?:\[?([\d]{4})?\]?|\(?([\d]{4})?\)?)$/g;
            var match = regex.exec(path.basename(file, ex));
            var name = year = null;
            if(!!match){
              name = match[1];
              if(match.length > 1 && !isNaN(parseFloat(match[3])) && isFinite(match[3])){
                year = match[3];
              }

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
                    Released: year,
                    Runtime: null,
                    Title: null,
                    Type: null,
                    Writer: null,
                    Year: year,
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
        Meteor.call('populateMovies', path);
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
    updateTrailer: function (mid, name, year) {
      movieTrailer(name, year, true, Meteor.bindEnvironment(function (err, res){
        if(err){
          broadcast(err);
          return false;
        }
        Movies.update(mid, { $set: {trailer: res}});
      }));
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