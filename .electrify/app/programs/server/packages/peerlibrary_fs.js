(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var blocking = Package['peerlibrary:blocking'].blocking;
var _ = Package.underscore._;
var assert = Package['peerlibrary:assert'].assert;

/* Package-scope variables */
var fs;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                //
// packages/peerlibrary_fs/packages/peerlibrary_fs.js                                             //
//                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                  //
(function () {                                                                                    // 1
                                                                                                  // 2
//////////////////////////////////////////////////////////////////////////////////////////////    // 3
//                                                                                          //    // 4
// packages/peerlibrary:fs/server.js                                                        //    // 5
//                                                                                          //    // 6
//////////////////////////////////////////////////////////////////////////////////////////////    // 7
                                                                                            //    // 8
var originalFs = Npm.require('fs');                                                         // 1  // 9
                                                                                            // 2  // 10
fs = _.clone(originalFs);                                                                   // 3  // 11
                                                                                            // 4  // 12
assert.ok(!fs._meteor);                                                                     // 5  // 13
                                                                                            // 6  // 14
// We set _meteor so that we can be sure and check we are getting our version of fs package // 7  // 15
fs._meteor = true;                                                                          // 8  // 16
                                                                                            // 9  // 17
// We change all *Sync functions to fibers-enabled synchronous (blocking) ones              // 10
_.each(fs, function (value, name, obj) {                                                    // 11
  var nonSyncName = name.replace(/Sync$/, '');                                              // 12
  if (name === nonSyncName || name === 'existsSync') {                                      // 13
    return;                                                                                 // 14
  }                                                                                         // 15
  obj[name] = blocking(obj[nonSyncName]);                                                   // 16
});                                                                                         // 17
                                                                                            // 18
// "existsSync" is a special case because "exists" has different signature                  // 19
fs.existsSync = blocking(function (path, cb) {                                              // 20
  fs.exists(path, function (exists) {                                                       // 21
    cb(null, exists);                                                                       // 22
  });                                                                                       // 23
});                                                                                         // 24
//////////////////////////////////////////////////////////////////////////////////////////////    // 33
                                                                                                  // 34
}).call(this);                                                                                    // 35
                                                                                                  // 36
////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['peerlibrary:fs'] = {
  fs: fs
};

})();

//# sourceMappingURL=peerlibrary_fs.js.map
