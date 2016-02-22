(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// packages/npm-container/index.js                                                     //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
Meteor.npmRequire = function(moduleName) {                                             // 1
  var module = Npm.require(moduleName);                                                // 2
  return module;                                                                       // 3
};                                                                                     // 4
                                                                                       // 5
Meteor.require = function(moduleName) {                                                // 6
  console.warn('Meteor.require is deprecated. Please use Meteor.npmRequire instead!');
  return Meteor.npmRequire(moduleName);                                                // 8
};                                                                                     // 9
/////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['npm-container'] = {};

})();

//# sourceMappingURL=npm-container.js.map
