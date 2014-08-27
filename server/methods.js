var fs = Npm.require('fs');
var path = Npm.require('path');
var Future = Npm.require('fibers/future');
var open = Meteor.require('open');
var movieArt = Meteor.require('movie-art');
var movieInfo = Meteor.require('movie-info');
var movieTrailer = Meteor.require('movie-trailer');

Meteor.methods({
  updatePath: function(dirPath) {
    var fut = new Future();
    Meteor.call('isDir', dirPath, function (err, res) {
      if(err){
        console.log('err');
        fut.throw(err);
      } else if(res == false) {
        console.log('res false');
        fut.throw("Error: not a directory");
      } else {
        console.log('listing');
        Meteor.call('listDir', dirPath, function (err, res){
          if(err) {
            fut.throw(err);
          } else {
            Movies.remove({});
            res.forEach(function(file){
              var ex = path.extname(file);
              if (_.contains(['.avi', '.flv', '.mp4', '.m4v', '.mov', '.ogg', '.ogv', '.vob', '.wmv'], ex)){ // !file.startsWith('.') &&
                var re = /^(.*?)(?:\[?([\d]{4})?\]?|\(?([\d]{4})?\)?)$/g;
                var match = re.exec(path.basename(file, ex));
                var name = year = null;
                if(match){
                  var name = match[1];
                  if(match.length >1)
                    var year = match[3];

                  mid = Movies.insert({
                    ext: ex,
                    file: file,
                    name: name,
                    year: year,
                    image: "no-photo.png",
                    trailer: null,
                    description: 'No information.',
                    info: {
                      adult: false,
                      backdrop_path: null,
                      original_title: null,
                      release_date: null,
                      vote_average: null
                    }
                  });

                  Meteor.call('updateImage', name, year, function(err, res){
                    if(err){
                      console.error(err);
                    } else {
                      Movies.update(mid, { $set: {image: res}});
                    }
                  });

                  Meteor.call('updateInfo', name, year, function(err, res){
                    if(err){
                      console.error(err);
                    } else {
                      Movies.update(mid, { $set: {info: res}});
                    }
                  });

                  Meteor.call('updateTrailer', name, year, function(err, res){
                    if(err){
                      console.error(err);
                    } else {
                      Movies.update(mid, { $set: {trailer: res}});
                    }
                  });
                }
              }
            });
            fut.return(true);
          }
        });
      }
    });
    return fut.wait();
  },
  openFile: function (file) {
    console.log("I command you to open!");
    open(file);
  },
  updateImage: function(name, year) {
    var fut = new Future();
    updateImageAS(name, year, function (err, res) {
      if(err){
        fut.throw(err);
      } else {
        fut.return(res);
      }
    });
    return fut.wait();
  },
  updateInfo: function(name, year) {
    var fut = new Future();
    updateInfoAS(name, year, function (err, res) {
      if(err){
        fut.throw(err);
      } else {
        fut.return(res);
      }
    });
    return fut.wait();
  },
  updateTrailer: function(name, year) {
    var fut = new Future();
    updateTrailerAS(name, year, function (err, res) {
      if(err){
        fut.throw(err);
      } else {
        fut.return(res);
      }
    });
    return fut.wait();
  },
  listDir: function(dirPath) {
    var fut = new Future();
    listDirAS(dirPath, function (err, res) {
      if(err){
        fut.throw(err);
      } else {
        fut.return(res);
      }
    });
    return fut.wait();
  },

  isDir: function(dirPath) {
    var fut = new Future();
    isDirAS(dirPath, function (err, res) {
      if(err){
        fut.throw(err);
      } else {
        fut.return(res);
      }
    });
    return fut.wait();
  },

  isFile: function(file) {
    path.exists(file, function(exists){console.log("Does the file exist?", exists)});
  }
});

function isDirAS (dirPath, cb) {
  fs.exists(dirPath, function(exists) {
      console.log(exists + 'hihih ' + dirPath);
      if (exists) {
          cb(null, true);
      } else {
        console.error('FileSystem Error: Directory does not exist.');
      }
  });
}

function listDirAS(dirPath, cb) {
  console.log("Listing " + dirPath);
  fs.readdir(dirPath, function(err, files){
    if (err){
      cb(err, null);
      return false;
    }
    cb(null, files);
  });
}

function updateImageAS (name, year, cb) {
  movieArt(name, year, 'w185', function (err, res){
    if(err){
      // Error w/ year, try without
      movieArt(name, 'w185', function (err, res){
        if(err){
          cb(err, null);
          return false;
        }
        cb(null, res);
      });
      return false;
    }
    cb(null, res);
  });
}

function updateInfoAS (name, year, cb) {
  movieInfo(name, year, function (err, res){
    if(err){
      // Error w/ year, try without
      movieInfo(name, function (err, res){
        if(err){
          cb(err, null);
          return false;
        }
        cb(null, res);
      });
      return false;
    }
    cb(null, res);
  });
}

function updateTrailerAS (name, year, cb) {
  movieTrailer(name, year, false, function (err, res){
    if(err){
      // Error w/ year, try without
      movieTrailer(name, false, function (err, res){
        if(err){
          cb(err, null);
          return false;
        }
        cb(null, res);
      });
      return false;
    }
    cb(null, res);
  });
}