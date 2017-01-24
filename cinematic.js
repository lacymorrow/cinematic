/*
 * TODO
 * - account for missing sort params
 * - Unused data: popularity, country, language, awards
 * - auto rename files
 * - limit, possibly paginate
 * - file browser
 * - TV Shows
 * - Filter by Director
 * - Ambiguous search


 parse intel genres
 scroll anywhere

 */


var settings = {
  DEMO: false,
  DEFAULT_PATH: '/Users/lacymorrow/',
  valid_types: ['.avi', '.flv', '.mp4', '.m4v', '.mov', '.ogg', '.ogv', '.vob', '.wmv', '.mkv'],
  sort_types: ["Alphabetical", "Popularity", "Release Date", "Runtime", "Random" /*, "Ratings" */ ],
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
  recurse_level: 1, // how many directory levels to recursively search. higher is further down the rabbit hole.
  ignore_list: ['sample', 'etrg'] // a lowercase list of movie titles to ignore
}

// define db collections
Log = new Mongo.Collection("log");
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

  // third-party
  NProgress.configure({ trickleRate: 0.01, trickleSpeed: 1400 });
  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
  });

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
    recentCount: function () {
      return Recent.find().count();
    },
    watchedCount: function () {
      return Watched.find().count();
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
      var movie = Movies.findOne({_id: Session.get('currentMovie')});
      if(movie){
        movie.ratings.map(function(o, i) {
          movie.ratings[i].index = i;
          if(i == movie.ratings.length - 1) {
            movie.ratings[i].indexPlus = 0;
          } else {
            movie.ratings[i].indexPlus = i + 1;
          }
        });
      }
      return movie;
    },
    currentTrailer: function () {
      return Session.get('currentTrailer');
    }
  });

  // define movies helpers
  Template.movies.helpers({
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
    showSort: function () {
      var currentSort = Session.get('currentSort');
      return currentSort != 'Recent';
    },
    sort: function(){
        return settings.sort_types;
    },
    currentSort: function () {
      return Session.get('currentSort');
    }
  });

  Template.body.events({
    "click #refresh": function (event) {
      broadcast('Cinematic: Resetting client...');
      resetClient();
      Meteor.call('reset');
    }
  });

  // sort event
  Template.sort.events({
      "change #sort": function (event, template) {
        var sort = $(event.currentTarget).val();
        Session.set('currentSort', sort);
        // warning, magic numbers below, indexs reference sort types above
        if(sort == settings.sort_types[0]) { // Alphabetical
          Session.set('movieSort', { sort: { name: 1 }});
        } else if (sort == settings.sort_types[1]) { // Popularity
          Session.set('movieSort', { sort: { 'info.popularity': -1 }});
        } else if (sort == settings.sort_types[2]) { // Release Date
          Session.set('movieSort', { sort: { 'info.release_date': -1 }});
        } else if (sort == settings.sort_types[3]) { // Runtime
          Session.set('movieSort', { sort: { 'intel.Runtime': 1 }});
        } else if (sort == settings.sort_types[4]) { // Random
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
      var page = Session.get('currentPage');
      if(Session.get('currentSort') == 'Recent'){
        resetSort();
      }
      var pid = String(event.currentTarget.dataset.id);
      var currentPage = $(event.currentTarget).text();
      Session.set('currentPage', currentPage);
      // hide right panel
      Session.set('currentMovie', 0);
      var genre = Genres.findOne(pid);
      if(genre) {
        // genre page - All: alphabetical
        Session.set('movieQuery', {_id: { $in: Genres.findOne(pid).items}});
      } else if(currentPage == 'New') {
        // browse Recently Released
        Session.set('movieQuery', {});
      }  else if(currentPage == 'Recent') {
        // browse recently viewed: alphabetical  **** HAVENT FIGURED OUT SORTING
        var recent = [];
        _.map(Recent.find().fetch(), function(e){
          recent.push(e._id);
        });
        Session.set('currentSort', 'Recent');
        Session.set('movieQuery', {_id: { $in: recent }});
        Session.set('movieSort', { sort: { 'recent_time': -1 }});
      } else if(currentPage == 'Watched') {
        // browse watched: order of watched
        var watched = [];
        _.map(Watched.find().fetch(), function(e){
          watched.push(e._id);
        });
        Session.set('currentSort', 'Recent');
        Session.set('movieQuery', {_id: { $in: watched}});
        Session.set('movieSort', { sort: { 'watched_time': -1 }});
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
      var url = event.currentTarget.dataset.src;
      var mid = event.currentTarget.dataset.id;
      Meteor.call('addWatched', mid);
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
      var ratings = Movies.findOne({'_id': id}, {fields: {ratings: 1}}).ratings;
      totalRatings = ratings.length;
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

    "change #path click #path": function (event){
      // Choosse files to load
      choosePath('#fileDialog');
    },
    "keyup #path": function (event){
      if(event.which == 13){
        // on <enter> set path
        setPath();
      }
    },
    "click #search-refresh": function (event) {
      setPath();
    }
  }

  // client-side methods
  var choosePath = function(name) {
    var chooser = document.querySelector(name);
    chooser.addEventListener("change", function(evt) {
      // console.log(this.value);
      var files = $('#fileDialog')[0].files;
      for (var i = 0; i < files.length; ++i)
        broa(files[i].path); 
    }, false);

    chooser.click();
  }
  var setLoaded = function(percentage) {
    NProgress.start();
    NProgress.set(percentage);
  }
  var setPath = function () {
    resetClient();
    var _path = document.getElementById('path');
    if(_path.value != ''){
      var path = _path.value;
      if (path.slice(-1) != '/'){
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
    // broadcast(totalRatings); // !important! number of ratings sources < ------------------- MAGIC NUMBER HERE
    var x =  Session.get('activeRating');
    Session.set('activeRating',(x + 1 == totalRatings ? 0: x + 1));
  }

  // defaults
  var resetClient = function () {
    resetSort();
    Session.set('activeRating', 0);
    Session.set('currentMovie', 0);
    Session.set('currentPage', 'Movies');
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
  Meteor.publish("log", function () { return Log.find(); });
  Meteor.publish("state", function () { return State.find(); });
  Meteor.publish("recent", function () { return Recent.find(); });
  Meteor.publish("watched", function () { return Watched.find(); });
  Meteor.publish("genres", function () { return Genres.find(); });
  Meteor.publish("movies", function () { return Movies.find(); });
  Meteor.publish("movieCache", function () { return MovieCache.find(); });

  // server globals
  // startup functions
  Meteor.startup(function () {
    // setup db - optionally clear movies, log, and path
    Log.remove({});
    Movies.remove({});

    // welcome message
    broadcast('\n----- Cinematic -----');

    // set default path
    var dir = Meteor.call('findMovieDir');

    // set up state
    var time = epoch();
    var state = State.findOne({_id:"0"});
    if (!state) {
      var sid = State.insert({_id: '0', path: dir, cwd: process.env.PWD});
    }

    // grab genre list
    if(settings.cache && state && state.cache_genre && time < state.cache_genre+settings.cache) {
      broadcast('Cinematic: Loading cached genre list.');
    } else {
      broadcast('Cinematic: Updating genre cache.');
      Meteor.call('updateGenres');
    }

    // initial update
    Meteor.call('updatePath', dir);
  }); // end startup

  // number of concurrent api connections; currently doesn't distinguish between different api source limits
  // total, number left to process, currently processing
  var api_total = 0, api_queue = 0, api_current = 0;

  // server-side methods
  Meteor.methods({
    addGenre: function (gid, mid, name) {
      var id = String(gid);
      var genre = Genres.findOne({"_id": id});
      if(genre && name) {
        Genres.update(id, { $set: {name: name}});
      } else if(genre && mid) {
        var items = genre.items || [];
        items.push(mid);
        Genres.update(id, { $set: {items: items}});
      } else if(name){
        Genres.insert({_id: id, id: gid, name: name});
      } else if (mid){
        Genres.insert({_id: id, id: gid, name: name, items: [mid]});
      }
    },
    addRecent: function (mid) {
      var time = epoch();
      Recent.upsert({ '_id': mid }, {'time': time});
      Movies.update({'_id': mid}, {$set: {'recent_time': time}})
    },
    addWatched: function (mid) {
      var time = epoch();
      Watched.upsert({ '_id': mid }, {'time': time});
      Movies.update({'_id': mid}, {$set: {'watched_time': time}})
    },
    cacheMovies: function () {
      var movies = Movies.find();
      var time = epoch();
      movies.forEach(function(movie){
        movie.cache_date = epoch();
        MovieCache.upsert({'_id': movie.path+movie.file}, {cache_date: time, movie: movie});
      });
      State.update("0", {$set: {cache_movies: time}});
    },
    cacheMovie: function (file) {
      var mov = Movies.findOne({'file': file});
      mov.cache_date = epoch();
      // only cache if it loaded properly
      if(mov && mov.intel.Title && mov.info.title){
        MovieCache.insert(mov);
      }
    },

    // Uses best practice to support old browsers vvv
    findMovieDir: function(){
      var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
      if(home.slice(-1) != '/'){
        home = home + '/';
      }

      // dir is the directoy containimg movie files; use DEMO if you'd  trefer to test with dummy data
      var dir = (settings.DEMO) ?  settings.DEMO : home;
      

      // read home directory
      var files = fs.readdirSync(dir);
      files.forEach(function(file, i){
        //sync with internal db
        // console.log(home+file); 
        var stats = fs.lstatSync(home+file);
        if(stats.isDirectory() && (file.toLowerCase().indexOf('movies') != -1 || file.toLowerCase().indexOf('videos') != -1) ) {
          dir = (settings.DEMO) ? settings.DEMO : home+'/'+file+'/'; //DEMO
        }
      });
      broadcast('Cinematic: Using ' + dir + ' as movie directory');
      return dir;
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
            broadcast('Cinematic/getIntel: ' + err);
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
              if(match){
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

            if(name && !_.contains(settings.ignore_list, name.toLowerCase())){
              // cache handling
              var hash = dirPath+file;
              var movc = MovieCache.findOne({'_id': hash});
              if(movc && settings.cache && movc.movie && time < movc.cache_date+settings.cache){
                // cached
                broadcast('Cinematic: Loading cached movie ' + name);
                var mid = movc.movie._id;
                Movies.insert(movc.movie);
                _.each(movc.movie.info.genre_ids, function (e, i) {
                  Meteor.call('addGenre', e, mid, null);
                });
              } else {
                //not cached
                // add item to collection
                var mid = Movies.insert({
                  ext: ex,
                  file: file,
                  name: name,
                  path: dirPath,
                  year: year,
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
                  // combined info
                  imdb_id: null,
                  plot: null,
                  poster: null,
                  release_date: year,
                  title: name,
                });
                // make api calls to gather info
                Meteor.call('getIntel', mid, name, year);
              }
            }
          } else if (recurse_level < settings.recurse_level) {
            // ok let's try recursing, were avoiding as many fs calls as possible
            // which is why i didn't call it in the condition above
            // first, is this a directory?
            fs.lstat(dirPath+file, Meteor.bindEnvironment(function(err, stats) {
              if(err){
                broadcast(name + ': ' + err);
                return false;
              }
              if(stats.isDirectory()) {
                Meteor.call('populateMovies', dirPath + file + '/', recurse_level+1);
              }
            }));
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
                    broadcast('Cinematic/updateGenres: ' + err);
                  } else if (res.data.genres){
                    res.data.genres.forEach(function(genre){
                      Meteor.call('addGenre', genre.id, null, genre.name);
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
        // strip runtime characters
        res.Runtime = res.Runtime.replace(/\D/g,'');
        // toss any "N/A" response
        for (var key in res) {
          if(res[key] == "N/A"){
            res[key] = null;
          }
        }
        // lets parse this shit proper
        var mov = Movies.findOne({_id: mid});
        if(res.imdbRating){
          mov.ratings.push({name: 'IMDB RATING', score: parseFloat(res.imdbRating), 
            count: Array.apply(null, Array(Math.round(res.imdbRating))).map(function(){return {};})});
        }
        if(res.Metascore){
          mov.ratings.push({name: 'METASCORE RATING', score: res.Metascore/10,
            count: Array.apply(null, Array(Math.round(res.Metascore/10))).map(function(){return {};})});
        }
        mov.imdb_id = res.imdbID;
        mov.plot = res.Plot
        mov.poster = res.Poster;
        mov.release_date = Date.parse(res.Released);
        mov.title = res.Title;
        if(!mov.poster){
          mov.poster = res.Poster;
        }
        if(!mov.year){
          mov.year = res.Year;
        }
        mov.intel = res;
        Movies.update(mid, mov);
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
          Meteor.call('addGenre', e, mid, null);
        });
        // lets parse this shit proper
        var mov = Movies.findOne({_id: mid});
        res.backdrop = settings.secure_base_url + settings.backdrop_size + res.backdrop_path;
        if(res.vote_average) {
          mov.ratings.push({name: 'TMDB RATING', score: parseFloat(res.vote_average),
            count: Array.apply(null, Array(Math.round(res.vote_average))).map(function(){return {};})});
        }
        mov.imdb_id = res.imdb_id;
        mov.poster = settings.secure_base_url + settings.poster_size + res.poster_path;
        mov.title = res.title;
        if(!mov.plot) {
          mov.plot = res.overview;
        }
        if(!mov.release_date){
          mov.release_date = Date.parse(res.release_date);
        }
        if(!mov.year){
          mov.year = res.Year;
        }
        mov.info = res;
        Movies.update(mid, mov);
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
              broadcast('Cinematic/queueIt: ' + err);
            }
          });
        }, settings.retry_delay);
      } else { 
        api_current += 1;
        Meteor.call(job, mid, name, year, function (err, res) {
          if(err){
            broadcast('Cinematic/queueIt: ' + err);
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
    },
    reset: function () {
      broadcast('Cinematic: Resetting server...');
      State.remove({});
      Recent.remove({});
      Watched.remove({});
      Genres.remove({});
      Movies.remove({});
      MovieCache.remove({});

      // set default path
      var dir = Meteor.call('findMovieDir');

      var time = epoch();
      var sid = State.insert({_id: '0', path: dir, cwd: process.env.PWD});

      // grab genre list
      Meteor.call('updateGenres');

      // initial update
      Meteor.call('updatePath', dir);
    }
  });

} // end Meteor.isServer


/*
 * UTILITIES
 */

// safe console.log which outputs in the called context - client/server
var broadcast = function (msg) {
  Log.insert({time: epoch(), msg: msg});
  if (typeof console !== 'undefined')
    console.log(msg);
}

var epoch = function () {
  var d = new Date();
  return d.getTime() / 1000;
}
