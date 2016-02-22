(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var EJSON = Package.ejson.EJSON;

/* Package-scope variables */
var check, Match;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                    //
// packages/check/match.js                                                                            //
//                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                      //
// XXX docs                                                                                           // 1
                                                                                                      // 2
// Things we explicitly do NOT support:                                                               // 3
//    - heterogenous arrays                                                                           // 4
                                                                                                      // 5
var currentArgumentChecker = new Meteor.EnvironmentVariable;                                          // 6
                                                                                                      // 7
/**                                                                                                   // 8
 * @summary Check that a value matches a [pattern](#matchpatterns).                                   // 9
 * If the value does not match the pattern, throw a `Match.Error`.                                    // 10
 *                                                                                                    // 11
 * Particularly useful to assert that arguments to a function have the right                          // 12
 * types and structure.                                                                               // 13
 * @locus Anywhere                                                                                    // 14
 * @param {Any} value The value to check                                                              // 15
 * @param {MatchPattern} pattern The pattern to match                                                 // 16
 * `value` against                                                                                    // 17
 */                                                                                                   // 18
check = function (value, pattern) {                                                                   // 19
  // Record that check got called, if somebody cared.                                                 // 20
  //                                                                                                  // 21
  // We use getOrNullIfOutsideFiber so that it's OK to call check()                                   // 22
  // from non-Fiber server contexts; the downside is that if you forget to                            // 23
  // bindEnvironment on some random callback in your method/publisher,                                // 24
  // it might not find the argumentChecker and you'll get an error about                              // 25
  // not checking an argument that it looks like you're checking (instead                             // 26
  // of just getting a "Node code must run in a Fiber" error).                                        // 27
  var argChecker = currentArgumentChecker.getOrNullIfOutsideFiber();                                  // 28
  if (argChecker)                                                                                     // 29
    argChecker.checking(value);                                                                       // 30
  var result = testSubtree(value, pattern);                                                           // 31
  if (result) {                                                                                       // 32
    var err = new Match.Error(result.message);                                                        // 33
    if (result.path) {                                                                                // 34
      err.message += " in field " + result.path;                                                      // 35
      err.path = result.path;                                                                         // 36
    }                                                                                                 // 37
    throw err;                                                                                        // 38
  }                                                                                                   // 39
};                                                                                                    // 40
                                                                                                      // 41
/**                                                                                                   // 42
 * @namespace Match                                                                                   // 43
 * @summary The namespace for all Match types and methods.                                            // 44
 */                                                                                                   // 45
Match = {                                                                                             // 46
  Optional: function (pattern) {                                                                      // 47
    return new Optional(pattern);                                                                     // 48
  },                                                                                                  // 49
  OneOf: function (/*arguments*/) {                                                                   // 50
    return new OneOf(_.toArray(arguments));                                                           // 51
  },                                                                                                  // 52
  Any: ['__any__'],                                                                                   // 53
  Where: function (condition) {                                                                       // 54
    return new Where(condition);                                                                      // 55
  },                                                                                                  // 56
  ObjectIncluding: function (pattern) {                                                               // 57
    return new ObjectIncluding(pattern);                                                              // 58
  },                                                                                                  // 59
  ObjectWithValues: function (pattern) {                                                              // 60
    return new ObjectWithValues(pattern);                                                             // 61
  },                                                                                                  // 62
  // Matches only signed 32-bit integers                                                              // 63
  Integer: ['__integer__'],                                                                           // 64
                                                                                                      // 65
  // XXX matchers should know how to describe themselves for errors                                   // 66
  Error: Meteor.makeErrorType("Match.Error", function (msg) {                                         // 67
    this.message = "Match error: " + msg;                                                             // 68
    // The path of the value that failed to match. Initially empty, this gets                         // 69
    // populated by catching and rethrowing the exception as it goes back up the                      // 70
    // stack.                                                                                         // 71
    // E.g.: "vals[3].entity.created"                                                                 // 72
    this.path = "";                                                                                   // 73
    // If this gets sent over DDP, don't give full internal details but at least                      // 74
    // provide something better than 500 Internal server error.                                       // 75
    this.sanitizedError = new Meteor.Error(400, "Match failed");                                      // 76
  }),                                                                                                 // 77
                                                                                                      // 78
  // Tests to see if value matches pattern. Unlike check, it merely returns true                      // 79
  // or false (unless an error other than Match.Error was thrown). It does not                        // 80
  // interact with _failIfArgumentsAreNotAllChecked.                                                  // 81
  // XXX maybe also implement a Match.match which returns more information about                      // 82
  //     failures but without using exception handling or doing what check()                          // 83
  //     does with _failIfArgumentsAreNotAllChecked and Meteor.Error conversion                       // 84
                                                                                                      // 85
  /**                                                                                                 // 86
   * @summary Returns true if the value matches the pattern.                                          // 87
   * @locus Anywhere                                                                                  // 88
   * @param {Any} value The value to check                                                            // 89
   * @param {MatchPattern} pattern The pattern to match `value` against                               // 90
   */                                                                                                 // 91
  test: function (value, pattern) {                                                                   // 92
    return !testSubtree(value, pattern);                                                              // 93
  },                                                                                                  // 94
                                                                                                      // 95
  // Runs `f.apply(context, args)`. If check() is not called on every element of                      // 96
  // `args` (either directly or in the first level of an array), throws an error                      // 97
  // (using `description` in the message).                                                            // 98
  //                                                                                                  // 99
  _failIfArgumentsAreNotAllChecked: function (f, context, args, description) {                        // 100
    var argChecker = new ArgumentChecker(args, description);                                          // 101
    var result = currentArgumentChecker.withValue(argChecker, function () {                           // 102
      return f.apply(context, args);                                                                  // 103
    });                                                                                               // 104
    // If f didn't itself throw, make sure it checked all of its arguments.                           // 105
    argChecker.throwUnlessAllArgumentsHaveBeenChecked();                                              // 106
    return result;                                                                                    // 107
  }                                                                                                   // 108
};                                                                                                    // 109
                                                                                                      // 110
var Optional = function (pattern) {                                                                   // 111
  this.pattern = pattern;                                                                             // 112
};                                                                                                    // 113
                                                                                                      // 114
var OneOf = function (choices) {                                                                      // 115
  if (_.isEmpty(choices))                                                                             // 116
    throw new Error("Must provide at least one choice to Match.OneOf");                               // 117
  this.choices = choices;                                                                             // 118
};                                                                                                    // 119
                                                                                                      // 120
var Where = function (condition) {                                                                    // 121
  this.condition = condition;                                                                         // 122
};                                                                                                    // 123
                                                                                                      // 124
var ObjectIncluding = function (pattern) {                                                            // 125
  this.pattern = pattern;                                                                             // 126
};                                                                                                    // 127
                                                                                                      // 128
var ObjectWithValues = function (pattern) {                                                           // 129
  this.pattern = pattern;                                                                             // 130
};                                                                                                    // 131
                                                                                                      // 132
var typeofChecks = [                                                                                  // 133
  [String, "string"],                                                                                 // 134
  [Number, "number"],                                                                                 // 135
  [Boolean, "boolean"],                                                                               // 136
  // While we don't allow undefined in EJSON, this is good for optional                               // 137
  // arguments with OneOf.                                                                            // 138
  [undefined, "undefined"]                                                                            // 139
];                                                                                                    // 140
                                                                                                      // 141
// Return `false` if it matches. Otherwise, return an object with a `message` and a `path` field.     // 142
var testSubtree = function (value, pattern) {                                                         // 143
  // Match anything!                                                                                  // 144
  if (pattern === Match.Any)                                                                          // 145
    return false;                                                                                     // 146
                                                                                                      // 147
  // Basic atomic types.                                                                              // 148
  // Do not match boxed objects (e.g. String, Boolean)                                                // 149
  for (var i = 0; i < typeofChecks.length; ++i) {                                                     // 150
    if (pattern === typeofChecks[i][0]) {                                                             // 151
      if (typeof value === typeofChecks[i][1])                                                        // 152
        return false;                                                                                 // 153
      return {                                                                                        // 154
        message: "Expected " + typeofChecks[i][1] + ", got " + typeof value,                          // 155
        path: ""                                                                                      // 156
      };                                                                                              // 157
    }                                                                                                 // 158
  }                                                                                                   // 159
  if (pattern === null) {                                                                             // 160
    if (value === null)                                                                               // 161
      return false;                                                                                   // 162
    return {                                                                                          // 163
      message: "Expected null, got " + EJSON.stringify(value),                                        // 164
      path: ""                                                                                        // 165
    };                                                                                                // 166
  }                                                                                                   // 167
                                                                                                      // 168
  // Strings, numbers, and booleans match literally. Goes well with Match.OneOf.                      // 169
  if (typeof pattern === "string" || typeof pattern === "number" || typeof pattern === "boolean") {   // 170
    if (value === pattern)                                                                            // 171
      return false;                                                                                   // 172
    return {                                                                                          // 173
      message: "Expected " + pattern + ", got " + EJSON.stringify(value),                             // 174
      path: ""                                                                                        // 175
    };                                                                                                // 176
  }                                                                                                   // 177
                                                                                                      // 178
  // Match.Integer is special type encoded with array                                                 // 179
  if (pattern === Match.Integer) {                                                                    // 180
    // There is no consistent and reliable way to check if variable is a 64-bit                       // 181
    // integer. One of the popular solutions is to get reminder of division by 1                      // 182
    // but this method fails on really large floats with big precision.                               // 183
    // E.g.: 1.348192308491824e+23 % 1 === 0 in V8                                                    // 184
    // Bitwise operators work consistantly but always cast variable to 32-bit                         // 185
    // signed integer according to JavaScript specs.                                                  // 186
    if (typeof value === "number" && (value | 0) === value)                                           // 187
      return false;                                                                                   // 188
    return {                                                                                          // 189
      message: "Expected Integer, got " + (value instanceof Object ? EJSON.stringify(value) : value),
      path: ""                                                                                        // 191
    };                                                                                                // 192
  }                                                                                                   // 193
                                                                                                      // 194
  // "Object" is shorthand for Match.ObjectIncluding({});                                             // 195
  if (pattern === Object)                                                                             // 196
    pattern = Match.ObjectIncluding({});                                                              // 197
                                                                                                      // 198
  // Array (checked AFTER Any, which is implemented as an Array).                                     // 199
  if (pattern instanceof Array) {                                                                     // 200
    if (pattern.length !== 1) {                                                                       // 201
      return {                                                                                        // 202
        message: "Bad pattern: arrays must have one type element" + EJSON.stringify(pattern),         // 203
        path: ""                                                                                      // 204
      };                                                                                              // 205
    }                                                                                                 // 206
    if (!_.isArray(value) && !_.isArguments(value)) {                                                 // 207
      return {                                                                                        // 208
        message: "Expected array, got " + EJSON.stringify(value),                                     // 209
        path: ""                                                                                      // 210
      };                                                                                              // 211
    }                                                                                                 // 212
                                                                                                      // 213
    for (var i = 0, length = value.length; i < length; i++) {                                         // 214
      var result = testSubtree(value[i], pattern[0]);                                                 // 215
      if (result) {                                                                                   // 216
        result.path = _prependPath(i, result.path);                                                   // 217
        return result;                                                                                // 218
      }                                                                                               // 219
    }                                                                                                 // 220
    return false;                                                                                     // 221
  }                                                                                                   // 222
                                                                                                      // 223
  // Arbitrary validation checks. The condition can return false or throw a                           // 224
  // Match.Error (ie, it can internally use check()) to fail.                                         // 225
  if (pattern instanceof Where) {                                                                     // 226
    var result;                                                                                       // 227
    try {                                                                                             // 228
      result = pattern.condition(value);                                                              // 229
    } catch (err) {                                                                                   // 230
      if (!(err instanceof Match.Error))                                                              // 231
        throw err;                                                                                    // 232
      return {                                                                                        // 233
        message: err.message,                                                                         // 234
        path: err.path                                                                                // 235
      };                                                                                              // 236
    }                                                                                                 // 237
    if (pattern.condition(value))                                                                     // 238
      return false;                                                                                   // 239
    // XXX this error is terrible                                                                     // 240
    return {                                                                                          // 241
      message: "Failed Match.Where validation",                                                       // 242
      path: ""                                                                                        // 243
    };                                                                                                // 244
  }                                                                                                   // 245
                                                                                                      // 246
                                                                                                      // 247
  if (pattern instanceof Optional)                                                                    // 248
    pattern = Match.OneOf(undefined, pattern.pattern);                                                // 249
                                                                                                      // 250
  if (pattern instanceof OneOf) {                                                                     // 251
    for (var i = 0; i < pattern.choices.length; ++i) {                                                // 252
      var result = testSubtree(value, pattern.choices[i]);                                            // 253
      if (!result) {                                                                                  // 254
        // No error? Yay, return.                                                                     // 255
        return false;                                                                                 // 256
      }                                                                                               // 257
      // Match errors just mean try another choice.                                                   // 258
    }                                                                                                 // 259
    // XXX this error is terrible                                                                     // 260
    return {                                                                                          // 261
      message: "Failed Match.OneOf or Match.Optional validation",                                     // 262
      path: ""                                                                                        // 263
    };                                                                                                // 264
  }                                                                                                   // 265
                                                                                                      // 266
  // A function that isn't something we special-case is assumed to be a                               // 267
  // constructor.                                                                                     // 268
  if (pattern instanceof Function) {                                                                  // 269
    if (value instanceof pattern)                                                                     // 270
      return false;                                                                                   // 271
    return {                                                                                          // 272
      message: "Expected " + (pattern.name ||"particular constructor"),                               // 273
      path: ""                                                                                        // 274
    };                                                                                                // 275
  }                                                                                                   // 276
                                                                                                      // 277
  var unknownKeysAllowed = false;                                                                     // 278
  var unknownKeyPattern;                                                                              // 279
  if (pattern instanceof ObjectIncluding) {                                                           // 280
    unknownKeysAllowed = true;                                                                        // 281
    pattern = pattern.pattern;                                                                        // 282
  }                                                                                                   // 283
  if (pattern instanceof ObjectWithValues) {                                                          // 284
    unknownKeysAllowed = true;                                                                        // 285
    unknownKeyPattern = [pattern.pattern];                                                            // 286
    pattern = {};  // no required keys                                                                // 287
  }                                                                                                   // 288
                                                                                                      // 289
  if (typeof pattern !== "object") {                                                                  // 290
    return {                                                                                          // 291
      message: "Bad pattern: unknown pattern type",                                                   // 292
      path: ""                                                                                        // 293
    };                                                                                                // 294
  }                                                                                                   // 295
                                                                                                      // 296
  // An object, with required and optional keys. Note that this does NOT do                           // 297
  // structural matches against objects of special types that happen to match                         // 298
  // the pattern: this really needs to be a plain old {Object}!                                       // 299
  if (typeof value !== 'object') {                                                                    // 300
    return {                                                                                          // 301
      message: "Expected object, got " + typeof value,                                                // 302
      path: ""                                                                                        // 303
    };                                                                                                // 304
  }                                                                                                   // 305
  if (value === null) {                                                                               // 306
    return {                                                                                          // 307
      message: "Expected object, got null",                                                           // 308
      path: ""                                                                                        // 309
    };                                                                                                // 310
  }                                                                                                   // 311
  if (value.constructor !== Object) {                                                                 // 312
    return {                                                                                          // 313
      message: "Expected plain object",                                                               // 314
      path: ""                                                                                        // 315
    };                                                                                                // 316
  }                                                                                                   // 317
                                                                                                      // 318
  var requiredPatterns = {};                                                                          // 319
  var optionalPatterns = {};                                                                          // 320
  _.each(pattern, function (subPattern, key) {                                                        // 321
    if (subPattern instanceof Optional)                                                               // 322
      optionalPatterns[key] = subPattern.pattern;                                                     // 323
    else                                                                                              // 324
      requiredPatterns[key] = subPattern;                                                             // 325
  });                                                                                                 // 326
                                                                                                      // 327
  for (var keys = _.keys(value), i = 0, length = keys.length; i < length; i++) {                      // 328
    var key = keys[i];                                                                                // 329
    var subValue = value[key];                                                                        // 330
    if (_.has(requiredPatterns, key)) {                                                               // 331
      var result = testSubtree(subValue, requiredPatterns[key]);                                      // 332
      if (result) {                                                                                   // 333
        result.path = _prependPath(key, result.path);                                                 // 334
        return result;                                                                                // 335
      }                                                                                               // 336
      delete requiredPatterns[key];                                                                   // 337
    } else if (_.has(optionalPatterns, key)) {                                                        // 338
      var result = testSubtree(subValue, optionalPatterns[key]);                                      // 339
      if (result) {                                                                                   // 340
        result.path = _prependPath(key, result.path);                                                 // 341
        return result;                                                                                // 342
      }                                                                                               // 343
    } else {                                                                                          // 344
      if (!unknownKeysAllowed) {                                                                      // 345
        return {                                                                                      // 346
          message: "Unknown key",                                                                     // 347
          path: key                                                                                   // 348
        };                                                                                            // 349
      }                                                                                               // 350
      if (unknownKeyPattern) {                                                                        // 351
        var result = testSubtree(subValue, unknownKeyPattern[0]);                                     // 352
        if (result) {                                                                                 // 353
          result.path = _prependPath(key, result.path);                                               // 354
          return result;                                                                              // 355
        }                                                                                             // 356
      }                                                                                               // 357
    }                                                                                                 // 358
  }                                                                                                   // 359
                                                                                                      // 360
  var keys = _.keys(requiredPatterns);                                                                // 361
  if (keys.length) {                                                                                  // 362
    return {                                                                                          // 363
      message: "Missing key '" + keys[0] + "'",                                                       // 364
      path: ""                                                                                        // 365
    };                                                                                                // 366
  }                                                                                                   // 367
};                                                                                                    // 368
                                                                                                      // 369
var ArgumentChecker = function (args, description) {                                                  // 370
  var self = this;                                                                                    // 371
  // Make a SHALLOW copy of the arguments. (We'll be doing identity checks                            // 372
  // against its contents.)                                                                           // 373
  self.args = _.clone(args);                                                                          // 374
  // Since the common case will be to check arguments in order, and we splice                         // 375
  // out arguments when we check them, make it so we splice out from the end                          // 376
  // rather than the beginning.                                                                       // 377
  self.args.reverse();                                                                                // 378
  self.description = description;                                                                     // 379
};                                                                                                    // 380
                                                                                                      // 381
_.extend(ArgumentChecker.prototype, {                                                                 // 382
  checking: function (value) {                                                                        // 383
    var self = this;                                                                                  // 384
    if (self._checkingOneValue(value))                                                                // 385
      return;                                                                                         // 386
    // Allow check(arguments, [String]) or check(arguments.slice(1), [String])                        // 387
    // or check([foo, bar], [String]) to count... but only if value wasn't                            // 388
    // itself an argument.                                                                            // 389
    if (_.isArray(value) || _.isArguments(value)) {                                                   // 390
      _.each(value, _.bind(self._checkingOneValue, self));                                            // 391
    }                                                                                                 // 392
  },                                                                                                  // 393
  _checkingOneValue: function (value) {                                                               // 394
    var self = this;                                                                                  // 395
    for (var i = 0; i < self.args.length; ++i) {                                                      // 396
      // Is this value one of the arguments? (This can have a false positive if                       // 397
      // the argument is an interned primitive, but it's still a good enough                          // 398
      // check.)                                                                                      // 399
      // (NaN is not === to itself, so we have to check specially.)                                   // 400
      if (value === self.args[i] || (_.isNaN(value) && _.isNaN(self.args[i]))) {                      // 401
        self.args.splice(i, 1);                                                                       // 402
        return true;                                                                                  // 403
      }                                                                                               // 404
    }                                                                                                 // 405
    return false;                                                                                     // 406
  },                                                                                                  // 407
  throwUnlessAllArgumentsHaveBeenChecked: function () {                                               // 408
    var self = this;                                                                                  // 409
    if (!_.isEmpty(self.args))                                                                        // 410
      throw new Error("Did not check() all arguments during " +                                       // 411
                      self.description);                                                              // 412
  }                                                                                                   // 413
});                                                                                                   // 414
                                                                                                      // 415
var _jsKeywords = ["do", "if", "in", "for", "let", "new", "try", "var", "case",                       // 416
  "else", "enum", "eval", "false", "null", "this", "true", "void", "with",                            // 417
  "break", "catch", "class", "const", "super", "throw", "while", "yield",                             // 418
  "delete", "export", "import", "public", "return", "static", "switch",                               // 419
  "typeof", "default", "extends", "finally", "package", "private", "continue",                        // 420
  "debugger", "function", "arguments", "interface", "protected", "implements",                        // 421
  "instanceof"];                                                                                      // 422
                                                                                                      // 423
// Assumes the base of path is already escaped properly                                               // 424
// returns key + base                                                                                 // 425
var _prependPath = function (key, base) {                                                             // 426
  if ((typeof key) === "number" || key.match(/^[0-9]+$/))                                             // 427
    key = "[" + key + "]";                                                                            // 428
  else if (!key.match(/^[a-z_$][0-9a-z_$]*$/i) || _.contains(_jsKeywords, key))                       // 429
    key = JSON.stringify([key]);                                                                      // 430
                                                                                                      // 431
  if (base && base[0] !== "[")                                                                        // 432
    return key + '.' + base;                                                                          // 433
  return key + base;                                                                                  // 434
};                                                                                                    // 435
                                                                                                      // 436
                                                                                                      // 437
////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.check = {
  check: check,
  Match: Match
};

})();

//# sourceMappingURL=check.js.map
