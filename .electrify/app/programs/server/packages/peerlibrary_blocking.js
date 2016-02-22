(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;

/* Package-scope variables */
var blocking;

(function(){

/////////////////////////////////////////////////////////////////////////////////////
//                                                                                 //
// packages/peerlibrary_blocking/packages/peerlibrary_blocking.js                  //
//                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////
                                                                                   //
(function () {                                                                     // 1
                                                                                   // 2
///////////////////////////////////////////////////////////////////////////////    // 3
//                                                                           //    // 4
// packages/peerlibrary:blocking/server.js                                   //    // 5
//                                                                           //    // 6
///////////////////////////////////////////////////////////////////////////////    // 7
                                                                             //    // 8
var Future = Npm.require('fibers/future');                                   // 1  // 9
                                                                             // 2  // 10
// Inside blocking context functions should not be throwing exceptions but   // 3  // 11
// call callback with first argument an error. Exceptions will not propagate // 4  // 12
// and will only be printed to the console.                                  // 5  // 13
blocking = function (obj, fun) {                                             // 6  // 14
  if (!fun) {                                                                // 7  // 15
    fun = obj;                                                               // 8  // 16
    obj = undefined;                                                         // 9  // 17
  }                                                                          // 10
  var f = function () {                                                      // 11
    if (_.isUndefined(obj)) {                                                // 12
      obj = this;                                                            // 13
    }                                                                        // 14
    var args = _.toArray(arguments);                                         // 15
    var future = new Future();                                               // 16
    fun.apply(obj, args.concat(future.resolver()));                          // 17
    return future.wait();                                                    // 18
  };                                                                         // 19
  f._blocking = true;                                                        // 20
  return f;                                                                  // 21
};                                                                           // 22
                                                                             // 23
///////////////////////////////////////////////////////////////////////////////    // 32
                                                                                   // 33
}).call(this);                                                                     // 34
                                                                                   // 35
/////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['peerlibrary:blocking'] = {
  blocking: blocking
};

})();

//# sourceMappingURL=peerlibrary_blocking.js.map
