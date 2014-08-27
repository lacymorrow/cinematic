DEFAULT_PATH = '/Users/lmorrow/Desktop/';
Path = DEFAULT_PATH;
Movies = new Meteor.Collection('movies');

if (Meteor.isClient) {
  Template.movies.movies = function(){
    return Movies.find({}, { sort: { name: 1 }}).fetch() || '<p class="no-files">No movie files found.</p>';
  }

  Template.movies.path = function(){
    return Session.get('dirPath') || DEFAULT_PATH;
  }
  Template.path.path = function(){
    return Session.get('dirPath') || DEFAULT_PATH;
  }

  Template.path.events = {
    "keyup #path": function(event){
      if(event.which == 13){
        // On <enter> update path
        var dirPath = document.getElementById('path');
        if(dirPath.value != ''){
          Path = dirPath.value;
          if (Path.lastIndexOf('/') !== Path.length - 1){
            Path = Path + '/';
          }
        } else {
          Path = DEFAULT_PATH;
        }

        Meteor.call('updatePath', Path, function (err, res){
          if(err){
            console.error(err);
          } else {
            console.log(res);
          }
        });
      }
    }
  }
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    if (typeof console !== 'undefined')
      console.log('\n----- Cinematic -----');
  });
}


/*
 *
 * UTILITY METHODS
 *
 */
if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}