(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var Symbol, Map, Set;

(function(){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/ecmascript-runtime/runtime.js                            //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
var runtime = Npm.require("meteor-ecmascript-runtime");              // 1
                                                                     // 2
Symbol = runtime.Symbol;                                             // 3
Map = runtime.Map;                                                   // 4
Set = runtime.Set;                                                   // 5
                                                                     // 6
///////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['ecmascript-runtime'] = {
  Symbol: Symbol,
  Map: Map,
  Set: Set
};

})();

//# sourceMappingURL=ecmascript-runtime.js.map
