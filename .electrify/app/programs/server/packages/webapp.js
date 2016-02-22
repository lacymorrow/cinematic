(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Log = Package.logging.Log;
var _ = Package.underscore._;
var RoutePolicy = Package.routepolicy.RoutePolicy;
var Boilerplate = Package['boilerplate-generator'].Boilerplate;
var WebAppHashing = Package['webapp-hashing'].WebAppHashing;

/* Package-scope variables */
var WebApp, WebAppInternals, main;

(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/webapp/webapp_server.js                                                                                  //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
////////// Requires //////////                                                                                       // 1
                                                                                                                     // 2
var fs = Npm.require("fs");                                                                                          // 3
var http = Npm.require("http");                                                                                      // 4
var os = Npm.require("os");                                                                                          // 5
var path = Npm.require("path");                                                                                      // 6
var url = Npm.require("url");                                                                                        // 7
var crypto = Npm.require("crypto");                                                                                  // 8
                                                                                                                     // 9
var connect = Npm.require('connect');                                                                                // 10
var useragent = Npm.require('useragent');                                                                            // 11
var send = Npm.require('send');                                                                                      // 12
                                                                                                                     // 13
var Future = Npm.require('fibers/future');                                                                           // 14
var Fiber = Npm.require('fibers');                                                                                   // 15
                                                                                                                     // 16
var SHORT_SOCKET_TIMEOUT = 5*1000;                                                                                   // 17
var LONG_SOCKET_TIMEOUT = 120*1000;                                                                                  // 18
                                                                                                                     // 19
WebApp = {};                                                                                                         // 20
WebAppInternals = {};                                                                                                // 21
                                                                                                                     // 22
WebAppInternals.NpmModules = {                                                                                       // 23
  connect: {                                                                                                         // 24
    version: Npm.require('connect/package.json').version,                                                            // 25
    module: connect                                                                                                  // 26
  }                                                                                                                  // 27
};                                                                                                                   // 28
                                                                                                                     // 29
WebApp.defaultArch = 'web.browser';                                                                                  // 30
                                                                                                                     // 31
// XXX maps archs to manifests                                                                                       // 32
WebApp.clientPrograms = {};                                                                                          // 33
                                                                                                                     // 34
// XXX maps archs to program path on filesystem                                                                      // 35
var archPath = {};                                                                                                   // 36
                                                                                                                     // 37
var bundledJsCssPrefix;                                                                                              // 38
                                                                                                                     // 39
var sha1 = function (contents) {                                                                                     // 40
  var hash = crypto.createHash('sha1');                                                                              // 41
  hash.update(contents);                                                                                             // 42
  return hash.digest('hex');                                                                                         // 43
};                                                                                                                   // 44
                                                                                                                     // 45
var readUtf8FileSync = function (filename) {                                                                         // 46
  return Meteor.wrapAsync(fs.readFile)(filename, 'utf8');                                                            // 47
};                                                                                                                   // 48
                                                                                                                     // 49
// #BrowserIdentification                                                                                            // 50
//                                                                                                                   // 51
// We have multiple places that want to identify the browser: the                                                    // 52
// unsupported browser page, the appcache package, and, eventually                                                   // 53
// delivering browser polyfills only as needed.                                                                      // 54
//                                                                                                                   // 55
// To avoid detecting the browser in multiple places ad-hoc, we create a                                             // 56
// Meteor "browser" object. It uses but does not expose the npm                                                      // 57
// useragent module (we could choose a different mechanism to identify                                               // 58
// the browser in the future if we wanted to).  The browser object                                                   // 59
// contains                                                                                                          // 60
//                                                                                                                   // 61
// * `name`: the name of the browser in camel case                                                                   // 62
// * `major`, `minor`, `patch`: integers describing the browser version                                              // 63
//                                                                                                                   // 64
// Also here is an early version of a Meteor `request` object, intended                                              // 65
// to be a high-level description of the request without exposing                                                    // 66
// details of connect's low-level `req`.  Currently it contains:                                                     // 67
//                                                                                                                   // 68
// * `browser`: browser identification object described above                                                        // 69
// * `url`: parsed url, including parsed query params                                                                // 70
//                                                                                                                   // 71
// As a temporary hack there is a `categorizeRequest` function on WebApp which                                       // 72
// converts a connect `req` to a Meteor `request`. This can go away once smart                                       // 73
// packages such as appcache are being passed a `request` object directly when                                       // 74
// they serve content.                                                                                               // 75
//                                                                                                                   // 76
// This allows `request` to be used uniformly: it is passed to the html                                              // 77
// attributes hook, and the appcache package can use it when deciding                                                // 78
// whether to generate a 404 for the manifest.                                                                       // 79
//                                                                                                                   // 80
// Real routing / server side rendering will probably refactor this                                                  // 81
// heavily.                                                                                                          // 82
                                                                                                                     // 83
                                                                                                                     // 84
// e.g. "Mobile Safari" => "mobileSafari"                                                                            // 85
var camelCase = function (name) {                                                                                    // 86
  var parts = name.split(' ');                                                                                       // 87
  parts[0] = parts[0].toLowerCase();                                                                                 // 88
  for (var i = 1;  i < parts.length;  ++i) {                                                                         // 89
    parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].substr(1);                                                // 90
  }                                                                                                                  // 91
  return parts.join('');                                                                                             // 92
};                                                                                                                   // 93
                                                                                                                     // 94
var identifyBrowser = function (userAgentString) {                                                                   // 95
  var userAgent = useragent.lookup(userAgentString);                                                                 // 96
  return {                                                                                                           // 97
    name: camelCase(userAgent.family),                                                                               // 98
    major: +userAgent.major,                                                                                         // 99
    minor: +userAgent.minor,                                                                                         // 100
    patch: +userAgent.patch                                                                                          // 101
  };                                                                                                                 // 102
};                                                                                                                   // 103
                                                                                                                     // 104
// XXX Refactor as part of implementing real routing.                                                                // 105
WebAppInternals.identifyBrowser = identifyBrowser;                                                                   // 106
                                                                                                                     // 107
WebApp.categorizeRequest = function (req) {                                                                          // 108
  return {                                                                                                           // 109
    browser: identifyBrowser(req.headers['user-agent']),                                                             // 110
    url: url.parse(req.url, true)                                                                                    // 111
  };                                                                                                                 // 112
};                                                                                                                   // 113
                                                                                                                     // 114
// HTML attribute hooks: functions to be called to determine any attributes to                                       // 115
// be added to the '<html>' tag. Each function is passed a 'request' object (see                                     // 116
// #BrowserIdentification) and should return null or object.                                                         // 117
var htmlAttributeHooks = [];                                                                                         // 118
var getHtmlAttributes = function (request) {                                                                         // 119
  var combinedAttributes  = {};                                                                                      // 120
  _.each(htmlAttributeHooks || [], function (hook) {                                                                 // 121
    var attributes = hook(request);                                                                                  // 122
    if (attributes === null)                                                                                         // 123
      return;                                                                                                        // 124
    if (typeof attributes !== 'object')                                                                              // 125
      throw Error("HTML attribute hook must return null or object");                                                 // 126
    _.extend(combinedAttributes, attributes);                                                                        // 127
  });                                                                                                                // 128
  return combinedAttributes;                                                                                         // 129
};                                                                                                                   // 130
WebApp.addHtmlAttributeHook = function (hook) {                                                                      // 131
  htmlAttributeHooks.push(hook);                                                                                     // 132
};                                                                                                                   // 133
                                                                                                                     // 134
// Serve app HTML for this URL?                                                                                      // 135
var appUrl = function (url) {                                                                                        // 136
  if (url === '/favicon.ico' || url === '/robots.txt')                                                               // 137
    return false;                                                                                                    // 138
                                                                                                                     // 139
  // NOTE: app.manifest is not a web standard like favicon.ico and                                                   // 140
  // robots.txt. It is a file name we have chosen to use for HTML5                                                   // 141
  // appcache URLs. It is included here to prevent using an appcache                                                 // 142
  // then removing it from poisoning an app permanently. Eventually,                                                 // 143
  // once we have server side routing, this won't be needed as                                                       // 144
  // unknown URLs with return a 404 automatically.                                                                   // 145
  if (url === '/app.manifest')                                                                                       // 146
    return false;                                                                                                    // 147
                                                                                                                     // 148
  // Avoid serving app HTML for declared routes such as /sockjs/.                                                    // 149
  if (RoutePolicy.classify(url))                                                                                     // 150
    return false;                                                                                                    // 151
                                                                                                                     // 152
  // we currently return app HTML on all URLs by default                                                             // 153
  return true;                                                                                                       // 154
};                                                                                                                   // 155
                                                                                                                     // 156
                                                                                                                     // 157
// We need to calculate the client hash after all packages have loaded                                               // 158
// to give them a chance to populate __meteor_runtime_config__.                                                      // 159
//                                                                                                                   // 160
// Calculating the hash during startup means that packages can only                                                  // 161
// populate __meteor_runtime_config__ during load, not during startup.                                               // 162
//                                                                                                                   // 163
// Calculating instead it at the beginning of main after all startup                                                 // 164
// hooks had run would allow packages to also populate                                                               // 165
// __meteor_runtime_config__ during startup, but that's too late for                                                 // 166
// autoupdate because it needs to have the client hash at startup to                                                 // 167
// insert the auto update version itself into                                                                        // 168
// __meteor_runtime_config__ to get it to the client.                                                                // 169
//                                                                                                                   // 170
// An alternative would be to give autoupdate a "post-start,                                                         // 171
// pre-listen" hook to allow it to insert the auto update version at                                                 // 172
// the right moment.                                                                                                 // 173
                                                                                                                     // 174
Meteor.startup(function () {                                                                                         // 175
  var calculateClientHash = WebAppHashing.calculateClientHash;                                                       // 176
  WebApp.clientHash = function (archName) {                                                                          // 177
    archName = archName || WebApp.defaultArch;                                                                       // 178
    return calculateClientHash(WebApp.clientPrograms[archName].manifest);                                            // 179
  };                                                                                                                 // 180
                                                                                                                     // 181
  WebApp.calculateClientHashRefreshable = function (archName) {                                                      // 182
    archName = archName || WebApp.defaultArch;                                                                       // 183
    return calculateClientHash(WebApp.clientPrograms[archName].manifest,                                             // 184
      function (name) {                                                                                              // 185
        return name === "css";                                                                                       // 186
      });                                                                                                            // 187
  };                                                                                                                 // 188
  WebApp.calculateClientHashNonRefreshable = function (archName) {                                                   // 189
    archName = archName || WebApp.defaultArch;                                                                       // 190
    return calculateClientHash(WebApp.clientPrograms[archName].manifest,                                             // 191
      function (name) {                                                                                              // 192
        return name !== "css";                                                                                       // 193
      });                                                                                                            // 194
  };                                                                                                                 // 195
  WebApp.calculateClientHashCordova = function () {                                                                  // 196
    var archName = 'web.cordova';                                                                                    // 197
    if (! WebApp.clientPrograms[archName])                                                                           // 198
      return 'none';                                                                                                 // 199
                                                                                                                     // 200
    return calculateClientHash(                                                                                      // 201
      WebApp.clientPrograms[archName].manifest, null, _.pick(                                                        // 202
        __meteor_runtime_config__, 'PUBLIC_SETTINGS'));                                                              // 203
  };                                                                                                                 // 204
});                                                                                                                  // 205
                                                                                                                     // 206
                                                                                                                     // 207
                                                                                                                     // 208
// When we have a request pending, we want the socket timeout to be long, to                                         // 209
// give ourselves a while to serve it, and to allow sockjs long polls to                                             // 210
// complete.  On the other hand, we want to close idle sockets relatively                                            // 211
// quickly, so that we can shut down relatively promptly but cleanly, without                                        // 212
// cutting off anyone's response.                                                                                    // 213
WebApp._timeoutAdjustmentRequestCallback = function (req, res) {                                                     // 214
  // this is really just req.socket.setTimeout(LONG_SOCKET_TIMEOUT);                                                 // 215
  req.setTimeout(LONG_SOCKET_TIMEOUT);                                                                               // 216
  // Insert our new finish listener to run BEFORE the existing one which removes                                     // 217
  // the response from the socket.                                                                                   // 218
  var finishListeners = res.listeners('finish');                                                                     // 219
  // XXX Apparently in Node 0.12 this event is now called 'prefinish'.                                               // 220
  // https://github.com/joyent/node/commit/7c9b6070                                                                  // 221
  res.removeAllListeners('finish');                                                                                  // 222
  res.on('finish', function () {                                                                                     // 223
    res.setTimeout(SHORT_SOCKET_TIMEOUT);                                                                            // 224
  });                                                                                                                // 225
  _.each(finishListeners, function (l) { res.on('finish', l); });                                                    // 226
};                                                                                                                   // 227
                                                                                                                     // 228
                                                                                                                     // 229
// Will be updated by main before we listen.                                                                         // 230
// Map from client arch to boilerplate object.                                                                       // 231
// Boilerplate object has:                                                                                           // 232
//   - func: XXX                                                                                                     // 233
//   - baseData: XXX                                                                                                 // 234
var boilerplateByArch = {};                                                                                          // 235
                                                                                                                     // 236
// Given a request (as returned from `categorizeRequest`), return the                                                // 237
// boilerplate HTML to serve for that request. Memoizes on HTML                                                      // 238
// attributes (used by, eg, appcache) and whether inline scripts are                                                 // 239
// currently allowed.                                                                                                // 240
// XXX so far this function is always called with arch === 'web.browser'                                             // 241
var memoizedBoilerplate = {};                                                                                        // 242
var getBoilerplate = function (request, arch) {                                                                      // 243
                                                                                                                     // 244
  var htmlAttributes = getHtmlAttributes(request);                                                                   // 245
                                                                                                                     // 246
  // The only thing that changes from request to request (for now) are                                               // 247
  // the HTML attributes (used by, eg, appcache) and whether inline                                                  // 248
  // scripts are allowed, so we can memoize based on that.                                                           // 249
  var memHash = JSON.stringify({                                                                                     // 250
    inlineScriptsAllowed: inlineScriptsAllowed,                                                                      // 251
    htmlAttributes: htmlAttributes,                                                                                  // 252
    arch: arch                                                                                                       // 253
  });                                                                                                                // 254
                                                                                                                     // 255
  if (! memoizedBoilerplate[memHash]) {                                                                              // 256
    memoizedBoilerplate[memHash] = boilerplateByArch[arch].toHTML({                                                  // 257
      htmlAttributes: htmlAttributes                                                                                 // 258
    });                                                                                                              // 259
  }                                                                                                                  // 260
  return memoizedBoilerplate[memHash];                                                                               // 261
};                                                                                                                   // 262
                                                                                                                     // 263
WebAppInternals.generateBoilerplateInstance = function (arch,                                                        // 264
                                                        manifest,                                                    // 265
                                                        additionalOptions) {                                         // 266
  additionalOptions = additionalOptions || {};                                                                       // 267
                                                                                                                     // 268
  var runtimeConfig = _.extend(                                                                                      // 269
    _.clone(__meteor_runtime_config__),                                                                              // 270
    additionalOptions.runtimeConfigOverrides || {}                                                                   // 271
  );                                                                                                                 // 272
                                                                                                                     // 273
  var jsCssPrefix;                                                                                                   // 274
  if (arch === 'web.cordova') {                                                                                      // 275
    // in cordova we serve assets up directly from disk so it doesn't make                                           // 276
    // sense to use the prefix (ordinarily something like a CDN) and go out                                          // 277
    // to the internet for those files.                                                                              // 278
    jsCssPrefix = '';                                                                                                // 279
  } else {                                                                                                           // 280
    jsCssPrefix = bundledJsCssPrefix ||                                                                              // 281
      __meteor_runtime_config__.ROOT_URL_PATH_PREFIX || '';                                                          // 282
  }                                                                                                                  // 283
                                                                                                                     // 284
  return new Boilerplate(arch, manifest,                                                                             // 285
    _.extend({                                                                                                       // 286
      pathMapper: function (itemPath) {                                                                              // 287
        return path.join(archPath[arch], itemPath); },                                                               // 288
      baseDataExtension: {                                                                                           // 289
        additionalStaticJs: _.map(                                                                                   // 290
          additionalStaticJs || [],                                                                                  // 291
          function (contents, pathname) {                                                                            // 292
            return {                                                                                                 // 293
              pathname: pathname,                                                                                    // 294
              contents: contents                                                                                     // 295
            };                                                                                                       // 296
          }                                                                                                          // 297
        ),                                                                                                           // 298
        // Convert to a JSON string, then get rid of most weird characters, then                                     // 299
        // wrap in double quotes. (The outermost JSON.stringify really ought to                                      // 300
        // just be "wrap in double quotes" but we use it to be safe.) This might                                     // 301
        // end up inside a <script> tag so we need to be careful to not include                                      // 302
        // "</script>", but normal {{spacebars}} escaping escapes too much! See                                      // 303
        // https://github.com/meteor/meteor/issues/3730                                                              // 304
        meteorRuntimeConfig: JSON.stringify(                                                                         // 305
          encodeURIComponent(JSON.stringify(runtimeConfig))),                                                        // 306
        rootUrlPathPrefix: __meteor_runtime_config__.ROOT_URL_PATH_PREFIX || '',                                     // 307
        bundledJsCssPrefix: jsCssPrefix,                                                                             // 308
        inlineScriptsAllowed: WebAppInternals.inlineScriptsAllowed(),                                                // 309
        inline: additionalOptions.inline                                                                             // 310
      }                                                                                                              // 311
    }, additionalOptions)                                                                                            // 312
  );                                                                                                                 // 313
};                                                                                                                   // 314
                                                                                                                     // 315
// A mapping from url path to "info". Where "info" has the following fields:                                         // 316
// - type: the type of file to be served                                                                             // 317
// - cacheable: optionally, whether the file should be cached or not                                                 // 318
// - sourceMapUrl: optionally, the url of the source map                                                             // 319
//                                                                                                                   // 320
// Info also contains one of the following:                                                                          // 321
// - content: the stringified content that should be served at this path                                             // 322
// - absolutePath: the absolute path on disk to the file                                                             // 323
                                                                                                                     // 324
var staticFiles;                                                                                                     // 325
                                                                                                                     // 326
// Serve static files from the manifest or added with                                                                // 327
// `addStaticJs`. Exported for tests.                                                                                // 328
WebAppInternals.staticFilesMiddleware = function (staticFiles, req, res, next) {                                     // 329
  if ('GET' != req.method && 'HEAD' != req.method) {                                                                 // 330
    next();                                                                                                          // 331
    return;                                                                                                          // 332
  }                                                                                                                  // 333
  var pathname = connect.utils.parseUrl(req).pathname;                                                               // 334
  try {                                                                                                              // 335
    pathname = decodeURIComponent(pathname);                                                                         // 336
  } catch (e) {                                                                                                      // 337
    next();                                                                                                          // 338
    return;                                                                                                          // 339
  }                                                                                                                  // 340
                                                                                                                     // 341
  var serveStaticJs = function (s) {                                                                                 // 342
    res.writeHead(200, {                                                                                             // 343
      'Content-type': 'application/javascript; charset=UTF-8'                                                        // 344
    });                                                                                                              // 345
    res.write(s);                                                                                                    // 346
    res.end();                                                                                                       // 347
  };                                                                                                                 // 348
                                                                                                                     // 349
  if (pathname === "/meteor_runtime_config.js" &&                                                                    // 350
      ! WebAppInternals.inlineScriptsAllowed()) {                                                                    // 351
    serveStaticJs("__meteor_runtime_config__ = " +                                                                   // 352
                  JSON.stringify(__meteor_runtime_config__) + ";");                                                  // 353
    return;                                                                                                          // 354
  } else if (_.has(additionalStaticJs, pathname) &&                                                                  // 355
              ! WebAppInternals.inlineScriptsAllowed()) {                                                            // 356
    serveStaticJs(additionalStaticJs[pathname]);                                                                     // 357
    return;                                                                                                          // 358
  }                                                                                                                  // 359
                                                                                                                     // 360
  if (!_.has(staticFiles, pathname)) {                                                                               // 361
    next();                                                                                                          // 362
    return;                                                                                                          // 363
  }                                                                                                                  // 364
                                                                                                                     // 365
  // We don't need to call pause because, unlike 'static', once we call into                                         // 366
  // 'send' and yield to the event loop, we never call another handler with                                          // 367
  // 'next'.                                                                                                         // 368
                                                                                                                     // 369
  var info = staticFiles[pathname];                                                                                  // 370
                                                                                                                     // 371
  // Cacheable files are files that should never change. Typically                                                   // 372
  // named by their hash (eg meteor bundled js and css files).                                                       // 373
  // We cache them ~forever (1yr).                                                                                   // 374
  //                                                                                                                 // 375
  // We cache non-cacheable files anyway. This isn't really correct, as users                                        // 376
  // can change the files and changes won't propagate immediately. However, if                                       // 377
  // we don't cache them, browsers will 'flicker' when rerendering                                                   // 378
  // images. Eventually we will probably want to rewrite URLs of static assets                                       // 379
  // to include a query parameter to bust caches. That way we can both get                                           // 380
  // good caching behavior and allow users to change assets without delay.                                           // 381
  // https://github.com/meteor/meteor/issues/773                                                                     // 382
  var maxAge = info.cacheable                                                                                        // 383
        ? 1000 * 60 * 60 * 24 * 365                                                                                  // 384
        : 1000 * 60 * 60 * 24;                                                                                       // 385
                                                                                                                     // 386
  // Set the X-SourceMap header, which current Chrome, FireFox, and Safari                                           // 387
  // understand.  (The SourceMap header is slightly more spec-correct but FF                                         // 388
  // doesn't understand it.)                                                                                         // 389
  //                                                                                                                 // 390
  // You may also need to enable source maps in Chrome: open dev tools, click                                        // 391
  // the gear in the bottom right corner, and select "enable source maps".                                           // 392
  if (info.sourceMapUrl) {                                                                                           // 393
    res.setHeader('X-SourceMap',                                                                                     // 394
                  __meteor_runtime_config__.ROOT_URL_PATH_PREFIX +                                                   // 395
                  info.sourceMapUrl);                                                                                // 396
  }                                                                                                                  // 397
                                                                                                                     // 398
  if (info.type === "js") {                                                                                          // 399
    res.setHeader("Content-Type", "application/javascript; charset=UTF-8");                                          // 400
  } else if (info.type === "css") {                                                                                  // 401
    res.setHeader("Content-Type", "text/css; charset=UTF-8");                                                        // 402
  } else if (info.type === "json") {                                                                                 // 403
    res.setHeader("Content-Type", "application/json; charset=UTF-8");                                                // 404
    // XXX if it is a manifest we are serving, set additional headers                                                // 405
    if (/\/manifest.json$/.test(pathname)) {                                                                         // 406
      res.setHeader("Access-Control-Allow-Origin", "*");                                                             // 407
    }                                                                                                                // 408
  }                                                                                                                  // 409
                                                                                                                     // 410
  if (info.content) {                                                                                                // 411
    res.write(info.content);                                                                                         // 412
    res.end();                                                                                                       // 413
  } else {                                                                                                           // 414
    send(req, info.absolutePath)                                                                                     // 415
      .maxage(maxAge)                                                                                                // 416
      .hidden(true)  // if we specified a dotfile in the manifest, serve it                                          // 417
      .on('error', function (err) {                                                                                  // 418
        Log.error("Error serving static file " + err);                                                               // 419
        res.writeHead(500);                                                                                          // 420
        res.end();                                                                                                   // 421
      })                                                                                                             // 422
      .on('directory', function () {                                                                                 // 423
        Log.error("Unexpected directory " + info.absolutePath);                                                      // 424
        res.writeHead(500);                                                                                          // 425
        res.end();                                                                                                   // 426
      })                                                                                                             // 427
      .pipe(res);                                                                                                    // 428
  }                                                                                                                  // 429
};                                                                                                                   // 430
                                                                                                                     // 431
var getUrlPrefixForArch = function (arch) {                                                                          // 432
  // XXX we rely on the fact that arch names don't contain slashes                                                   // 433
  // in that case we would need to uri escape it                                                                     // 434
                                                                                                                     // 435
  // We add '__' to the beginning of non-standard archs to "scope" the url                                           // 436
  // to Meteor internals.                                                                                            // 437
  return arch === WebApp.defaultArch ?                                                                               // 438
    '' : '/' + '__' + arch.replace(/^web\./, '');                                                                    // 439
};                                                                                                                   // 440
                                                                                                                     // 441
// parse port to see if its a Windows Server style named pipe. If so, return as-is (String), otherwise return as Int
WebAppInternals.parsePort = function (port) {                                                                        // 443
  if( /\\\\?.+\\pipe\\?.+/.test(port) ) {                                                                            // 444
    return port;                                                                                                     // 445
  }                                                                                                                  // 446
                                                                                                                     // 447
  return parseInt(port);                                                                                             // 448
};                                                                                                                   // 449
                                                                                                                     // 450
var runWebAppServer = function () {                                                                                  // 451
  var shuttingDown = false;                                                                                          // 452
  var syncQueue = new Meteor._SynchronousQueue();                                                                    // 453
                                                                                                                     // 454
  var getItemPathname = function (itemUrl) {                                                                         // 455
    return decodeURIComponent(url.parse(itemUrl).pathname);                                                          // 456
  };                                                                                                                 // 457
                                                                                                                     // 458
  WebAppInternals.reloadClientPrograms = function () {                                                               // 459
    syncQueue.runTask(function() {                                                                                   // 460
      staticFiles = {};                                                                                              // 461
      var generateClientProgram = function (clientPath, arch) {                                                      // 462
        // read the control for the client we'll be serving up                                                       // 463
        var clientJsonPath = path.join(__meteor_bootstrap__.serverDir,                                               // 464
                                   clientPath);                                                                      // 465
        var clientDir = path.dirname(clientJsonPath);                                                                // 466
        var clientJson = JSON.parse(readUtf8FileSync(clientJsonPath));                                               // 467
        if (clientJson.format !== "web-program-pre1")                                                                // 468
          throw new Error("Unsupported format for client assets: " +                                                 // 469
                          JSON.stringify(clientJson.format));                                                        // 470
                                                                                                                     // 471
        if (! clientJsonPath || ! clientDir || ! clientJson)                                                         // 472
          throw new Error("Client config file not parsed.");                                                         // 473
                                                                                                                     // 474
        var urlPrefix = getUrlPrefixForArch(arch);                                                                   // 475
                                                                                                                     // 476
        var manifest = clientJson.manifest;                                                                          // 477
        _.each(manifest, function (item) {                                                                           // 478
          if (item.url && item.where === "client") {                                                                 // 479
            staticFiles[urlPrefix + getItemPathname(item.url)] = {                                                   // 480
              absolutePath: path.join(clientDir, item.path),                                                         // 481
              cacheable: item.cacheable,                                                                             // 482
              // Link from source to its map                                                                         // 483
              sourceMapUrl: item.sourceMapUrl,                                                                       // 484
              type: item.type                                                                                        // 485
            };                                                                                                       // 486
                                                                                                                     // 487
            if (item.sourceMap) {                                                                                    // 488
              // Serve the source map too, under the specified URL. We assume all                                    // 489
              // source maps are cacheable.                                                                          // 490
              staticFiles[urlPrefix + getItemPathname(item.sourceMapUrl)] = {                                        // 491
                absolutePath: path.join(clientDir, item.sourceMap),                                                  // 492
                cacheable: true                                                                                      // 493
              };                                                                                                     // 494
            }                                                                                                        // 495
          }                                                                                                          // 496
        });                                                                                                          // 497
                                                                                                                     // 498
        var program = {                                                                                              // 499
          manifest: manifest,                                                                                        // 500
          version: WebAppHashing.calculateClientHash(manifest, null, _.pick(                                         // 501
            __meteor_runtime_config__, 'PUBLIC_SETTINGS')),                                                          // 502
          PUBLIC_SETTINGS: __meteor_runtime_config__.PUBLIC_SETTINGS                                                 // 503
        };                                                                                                           // 504
                                                                                                                     // 505
        WebApp.clientPrograms[arch] = program;                                                                       // 506
                                                                                                                     // 507
        // Serve the program as a string at /foo/<arch>/manifest.json                                                // 508
        // XXX change manifest.json -> program.json                                                                  // 509
        staticFiles[path.join(urlPrefix, 'manifest.json')] = {                                                       // 510
          content: JSON.stringify(program),                                                                          // 511
          cacheable: true,                                                                                           // 512
          type: "json"                                                                                               // 513
        };                                                                                                           // 514
      };                                                                                                             // 515
                                                                                                                     // 516
      try {                                                                                                          // 517
        var clientPaths = __meteor_bootstrap__.configJson.clientPaths;                                               // 518
        _.each(clientPaths, function (clientPath, arch) {                                                            // 519
          archPath[arch] = path.dirname(clientPath);                                                                 // 520
          generateClientProgram(clientPath, arch);                                                                   // 521
        });                                                                                                          // 522
                                                                                                                     // 523
        // Exported for tests.                                                                                       // 524
        WebAppInternals.staticFiles = staticFiles;                                                                   // 525
      } catch (e) {                                                                                                  // 526
        Log.error("Error reloading the client program: " + e.stack);                                                 // 527
        process.exit(1);                                                                                             // 528
      }                                                                                                              // 529
    });                                                                                                              // 530
  };                                                                                                                 // 531
                                                                                                                     // 532
  WebAppInternals.generateBoilerplate = function () {                                                                // 533
    // This boilerplate will be served to the mobile devices when used with                                          // 534
    // Meteor/Cordova for the Hot-Code Push and since the file will be served by                                     // 535
    // the device's server, it is important to set the DDP url to the actual                                         // 536
    // Meteor server accepting DDP connections and not the device's file server.                                     // 537
    var defaultOptionsForArch = {                                                                                    // 538
      'web.cordova': {                                                                                               // 539
        runtimeConfigOverrides: {                                                                                    // 540
          // XXX We use absoluteUrl() here so that we serve https://                                                 // 541
          // URLs to cordova clients if force-ssl is in use. If we were                                              // 542
          // to use __meteor_runtime_config__.ROOT_URL instead of                                                    // 543
          // absoluteUrl(), then Cordova clients would immediately get a                                             // 544
          // HCP setting their DDP_DEFAULT_CONNECTION_URL to                                                         // 545
          // http://example.meteor.com. This breaks the app, because                                                 // 546
          // force-ssl doesn't serve CORS headers on 302                                                             // 547
          // redirects. (Plus it's undesirable to have clients                                                       // 548
          // connecting to http://example.meteor.com when force-ssl is                                               // 549
          // in use.)                                                                                                // 550
          DDP_DEFAULT_CONNECTION_URL: process.env.MOBILE_DDP_URL ||                                                  // 551
            Meteor.absoluteUrl(),                                                                                    // 552
          ROOT_URL: process.env.MOBILE_ROOT_URL ||                                                                   // 553
            Meteor.absoluteUrl()                                                                                     // 554
        }                                                                                                            // 555
      }                                                                                                              // 556
    };                                                                                                               // 557
                                                                                                                     // 558
    syncQueue.runTask(function() {                                                                                   // 559
      _.each(WebApp.clientPrograms, function (program, archName) {                                                   // 560
        boilerplateByArch[archName] =                                                                                // 561
          WebAppInternals.generateBoilerplateInstance(                                                               // 562
            archName, program.manifest,                                                                              // 563
            defaultOptionsForArch[archName]);                                                                        // 564
      });                                                                                                            // 565
                                                                                                                     // 566
      // Clear the memoized boilerplate cache.                                                                       // 567
      memoizedBoilerplate = {};                                                                                      // 568
                                                                                                                     // 569
      // Configure CSS injection for the default arch                                                                // 570
      // XXX implement the CSS injection for all archs?                                                              // 571
      WebAppInternals.refreshableAssets = {                                                                          // 572
        allCss: boilerplateByArch[WebApp.defaultArch].baseData.css                                                   // 573
      };                                                                                                             // 574
    });                                                                                                              // 575
  };                                                                                                                 // 576
                                                                                                                     // 577
  WebAppInternals.reloadClientPrograms();                                                                            // 578
                                                                                                                     // 579
  // webserver                                                                                                       // 580
  var app = connect();                                                                                               // 581
                                                                                                                     // 582
  // Auto-compress any json, javascript, or text.                                                                    // 583
  app.use(connect.compress());                                                                                       // 584
                                                                                                                     // 585
  // Packages and apps can add handlers that run before any other Meteor                                             // 586
  // handlers via WebApp.rawConnectHandlers.                                                                         // 587
  var rawConnectHandlers = connect();                                                                                // 588
  app.use(rawConnectHandlers);                                                                                       // 589
                                                                                                                     // 590
  // We're not a proxy; reject (without crashing) attempts to treat us like                                          // 591
  // one. (See #1212.)                                                                                               // 592
  app.use(function(req, res, next) {                                                                                 // 593
    if (RoutePolicy.isValidUrl(req.url)) {                                                                           // 594
      next();                                                                                                        // 595
      return;                                                                                                        // 596
    }                                                                                                                // 597
    res.writeHead(400);                                                                                              // 598
    res.write("Not a proxy");                                                                                        // 599
    res.end();                                                                                                       // 600
  });                                                                                                                // 601
                                                                                                                     // 602
  // Strip off the path prefix, if it exists.                                                                        // 603
  app.use(function (request, response, next) {                                                                       // 604
    var pathPrefix = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX;                                                 // 605
    var url = Npm.require('url').parse(request.url);                                                                 // 606
    var pathname = url.pathname;                                                                                     // 607
    // check if the path in the url starts with the path prefix (and the part                                        // 608
    // after the path prefix must start with a / if it exists.)                                                      // 609
    if (pathPrefix && pathname.substring(0, pathPrefix.length) === pathPrefix &&                                     // 610
       (pathname.length == pathPrefix.length                                                                         // 611
        || pathname.substring(pathPrefix.length, pathPrefix.length + 1) === "/")) {                                  // 612
      request.url = request.url.substring(pathPrefix.length);                                                        // 613
      next();                                                                                                        // 614
    } else if (pathname === "/favicon.ico" || pathname === "/robots.txt") {                                          // 615
      next();                                                                                                        // 616
    } else if (pathPrefix) {                                                                                         // 617
      response.writeHead(404);                                                                                       // 618
      response.write("Unknown path");                                                                                // 619
      response.end();                                                                                                // 620
    } else {                                                                                                         // 621
      next();                                                                                                        // 622
    }                                                                                                                // 623
  });                                                                                                                // 624
                                                                                                                     // 625
  // Parse the query string into res.query. Used by oauth_server, but it's                                           // 626
  // generally pretty handy..                                                                                        // 627
  app.use(connect.query());                                                                                          // 628
                                                                                                                     // 629
  // Serve static files from the manifest.                                                                           // 630
  // This is inspired by the 'static' middleware.                                                                    // 631
  app.use(function (req, res, next) {                                                                                // 632
    Fiber(function () {                                                                                              // 633
     WebAppInternals.staticFilesMiddleware(staticFiles, req, res, next);                                             // 634
    }).run();                                                                                                        // 635
  });                                                                                                                // 636
                                                                                                                     // 637
  // Packages and apps can add handlers to this via WebApp.connectHandlers.                                          // 638
  // They are inserted before our default handler.                                                                   // 639
  var packageAndAppHandlers = connect();                                                                             // 640
  app.use(packageAndAppHandlers);                                                                                    // 641
                                                                                                                     // 642
  var suppressConnectErrors = false;                                                                                 // 643
  // connect knows it is an error handler because it has 4 arguments instead of                                      // 644
  // 3. go figure.  (It is not smart enough to find such a thing if it's hidden                                      // 645
  // inside packageAndAppHandlers.)                                                                                  // 646
  app.use(function (err, req, res, next) {                                                                           // 647
    if (!err || !suppressConnectErrors || !req.headers['x-suppress-error']) {                                        // 648
      next(err);                                                                                                     // 649
      return;                                                                                                        // 650
    }                                                                                                                // 651
    res.writeHead(err.status, { 'Content-Type': 'text/plain' });                                                     // 652
    res.end("An error message");                                                                                     // 653
  });                                                                                                                // 654
                                                                                                                     // 655
  app.use(function (req, res, next) {                                                                                // 656
    if (! appUrl(req.url))                                                                                           // 657
      return next();                                                                                                 // 658
                                                                                                                     // 659
    var headers = {                                                                                                  // 660
      'Content-Type':  'text/html; charset=utf-8'                                                                    // 661
    };                                                                                                               // 662
    if (shuttingDown)                                                                                                // 663
      headers['Connection'] = 'Close';                                                                               // 664
                                                                                                                     // 665
    var request = WebApp.categorizeRequest(req);                                                                     // 666
                                                                                                                     // 667
    if (request.url.query && request.url.query['meteor_css_resource']) {                                             // 668
      // In this case, we're requesting a CSS resource in the meteor-specific                                        // 669
      // way, but we don't have it.  Serve a static css file that indicates that                                     // 670
      // we didn't have it, so we can detect that and refresh.  Make sure                                            // 671
      // that any proxies or CDNs don't cache this error!  (Normally proxies                                         // 672
      // or CDNs are smart enough not to cache error pages, but in order to                                          // 673
      // make this hack work, we need to return the CSS file as a 200, which                                         // 674
      // would otherwise be cached.)                                                                                 // 675
      headers['Content-Type'] = 'text/css; charset=utf-8';                                                           // 676
      headers['Cache-Control'] = 'no-cache';                                                                         // 677
      res.writeHead(200, headers);                                                                                   // 678
      res.write(".meteor-css-not-found-error { width: 0px;}");                                                       // 679
      res.end();                                                                                                     // 680
      return undefined;                                                                                              // 681
    }                                                                                                                // 682
                                                                                                                     // 683
    if (request.url.query && request.url.query['meteor_js_resource']) {                                              // 684
      // Similarly, we're requesting a JS resource that we don't have.                                               // 685
      // Serve an uncached 404. (We can't use the same hack we use for CSS,                                          // 686
      // because actually acting on that hack requires us to have the JS                                             // 687
      // already!)                                                                                                   // 688
      headers['Cache-Control'] = 'no-cache';                                                                         // 689
      res.writeHead(404, headers);                                                                                   // 690
      res.end("404 Not Found");                                                                                      // 691
      return undefined;                                                                                              // 692
    }                                                                                                                // 693
                                                                                                                     // 694
    // /packages/asdfsad ... /__cordova/dafsdf.js                                                                    // 695
    var pathname = connect.utils.parseUrl(req).pathname;                                                             // 696
    var archKey = pathname.split('/')[1];                                                                            // 697
    var archKeyCleaned = 'web.' + archKey.replace(/^__/, '');                                                        // 698
                                                                                                                     // 699
    if (! /^__/.test(archKey) || ! _.has(archPath, archKeyCleaned)) {                                                // 700
      archKey = WebApp.defaultArch;                                                                                  // 701
    } else {                                                                                                         // 702
      archKey = archKeyCleaned;                                                                                      // 703
    }                                                                                                                // 704
                                                                                                                     // 705
    var boilerplate;                                                                                                 // 706
    try {                                                                                                            // 707
      boilerplate = getBoilerplate(request, archKey);                                                                // 708
    } catch (e) {                                                                                                    // 709
      Log.error("Error running template: " + e);                                                                     // 710
      res.writeHead(500, headers);                                                                                   // 711
      res.end();                                                                                                     // 712
      return undefined;                                                                                              // 713
    }                                                                                                                // 714
                                                                                                                     // 715
    res.writeHead(200, headers);                                                                                     // 716
    res.write(boilerplate);                                                                                          // 717
    res.end();                                                                                                       // 718
    return undefined;                                                                                                // 719
  });                                                                                                                // 720
                                                                                                                     // 721
  // Return 404 by default, if no other handlers serve this URL.                                                     // 722
  app.use(function (req, res) {                                                                                      // 723
    res.writeHead(404);                                                                                              // 724
    res.end();                                                                                                       // 725
  });                                                                                                                // 726
                                                                                                                     // 727
                                                                                                                     // 728
  var httpServer = http.createServer(app);                                                                           // 729
  var onListeningCallbacks = [];                                                                                     // 730
                                                                                                                     // 731
  // After 5 seconds w/o data on a socket, kill it.  On the other hand, if                                           // 732
  // there's an outstanding request, give it a higher timeout instead (to avoid                                      // 733
  // killing long-polling requests)                                                                                  // 734
  httpServer.setTimeout(SHORT_SOCKET_TIMEOUT);                                                                       // 735
                                                                                                                     // 736
  // Do this here, and then also in livedata/stream_server.js, because                                               // 737
  // stream_server.js kills all the current request handlers when installing its                                     // 738
  // own.                                                                                                            // 739
  httpServer.on('request', WebApp._timeoutAdjustmentRequestCallback);                                                // 740
                                                                                                                     // 741
                                                                                                                     // 742
  // start up app                                                                                                    // 743
  _.extend(WebApp, {                                                                                                 // 744
    connectHandlers: packageAndAppHandlers,                                                                          // 745
    rawConnectHandlers: rawConnectHandlers,                                                                          // 746
    httpServer: httpServer,                                                                                          // 747
    // For testing.                                                                                                  // 748
    suppressConnectErrors: function () {                                                                             // 749
      suppressConnectErrors = true;                                                                                  // 750
    },                                                                                                               // 751
    onListening: function (f) {                                                                                      // 752
      if (onListeningCallbacks)                                                                                      // 753
        onListeningCallbacks.push(f);                                                                                // 754
      else                                                                                                           // 755
        f();                                                                                                         // 756
    }                                                                                                                // 757
  });                                                                                                                // 758
                                                                                                                     // 759
  // Let the rest of the packages (and Meteor.startup hooks) insert connect                                          // 760
  // middlewares and update __meteor_runtime_config__, then keep going to set up                                     // 761
  // actually serving HTML.                                                                                          // 762
  main = function (argv) {                                                                                           // 763
    WebAppInternals.generateBoilerplate();                                                                           // 764
                                                                                                                     // 765
    // only start listening after all the startup code has run.                                                      // 766
    var localPort = WebAppInternals.parsePort(process.env.PORT) || 0;                                                // 767
    var host = process.env.BIND_IP;                                                                                  // 768
    var localIp = host || '0.0.0.0';                                                                                 // 769
    httpServer.listen(localPort, localIp, Meteor.bindEnvironment(function() {                                        // 770
      if (process.env.METEOR_PRINT_ON_LISTEN)                                                                        // 771
        console.log("LISTENING"); // must match run-app.js                                                           // 772
                                                                                                                     // 773
      var callbacks = onListeningCallbacks;                                                                          // 774
      onListeningCallbacks = null;                                                                                   // 775
      _.each(callbacks, function (x) { x(); });                                                                      // 776
                                                                                                                     // 777
    }, function (e) {                                                                                                // 778
      console.error("Error listening:", e);                                                                          // 779
      console.error(e && e.stack);                                                                                   // 780
    }));                                                                                                             // 781
                                                                                                                     // 782
    return 'DAEMON';                                                                                                 // 783
  };                                                                                                                 // 784
};                                                                                                                   // 785
                                                                                                                     // 786
                                                                                                                     // 787
runWebAppServer();                                                                                                   // 788
                                                                                                                     // 789
                                                                                                                     // 790
var inlineScriptsAllowed = true;                                                                                     // 791
                                                                                                                     // 792
WebAppInternals.inlineScriptsAllowed = function () {                                                                 // 793
  return inlineScriptsAllowed;                                                                                       // 794
};                                                                                                                   // 795
                                                                                                                     // 796
WebAppInternals.setInlineScriptsAllowed = function (value) {                                                         // 797
  inlineScriptsAllowed = value;                                                                                      // 798
  WebAppInternals.generateBoilerplate();                                                                             // 799
};                                                                                                                   // 800
                                                                                                                     // 801
WebAppInternals.setBundledJsCssPrefix = function (prefix) {                                                          // 802
  bundledJsCssPrefix = prefix;                                                                                       // 803
  WebAppInternals.generateBoilerplate();                                                                             // 804
};                                                                                                                   // 805
                                                                                                                     // 806
// Packages can call `WebAppInternals.addStaticJs` to specify static                                                 // 807
// JavaScript to be included in the app. This static JS will be inlined,                                             // 808
// unless inline scripts have been disabled, in which case it will be                                                // 809
// served under `/<sha1 of contents>`.                                                                               // 810
var additionalStaticJs = {};                                                                                         // 811
WebAppInternals.addStaticJs = function (contents) {                                                                  // 812
  additionalStaticJs["/" + sha1(contents) + ".js"] = contents;                                                       // 813
};                                                                                                                   // 814
                                                                                                                     // 815
// Exported for tests                                                                                                // 816
WebAppInternals.getBoilerplate = getBoilerplate;                                                                     // 817
WebAppInternals.additionalStaticJs = additionalStaticJs;                                                             // 818
                                                                                                                     // 819
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.webapp = {
  WebApp: WebApp,
  main: main,
  WebAppInternals: WebAppInternals
};

})();

//# sourceMappingURL=webapp.js.map
