Cinematic
===========
> 🎥  A gorgeous Desktop UI for your digital movie collection.

**Have a digital movie collection?**

Cinematic is a desktop app to beautifully organize and automatically retrieve information about your digital movie collection, so you can spend less time searching and more time watching 

### [Download for Windows, OSX, and Linux](https://github.com/lacymorrow/cinematic/releases)

![Cinematic](http://lacymorrow.com/images/github/cinematic/demo.gif)


Point Cinematic to the movie folder on your computer to scan and retrieve movie posters, ratings, trailers and much more about any movie files found. 
Organize your movies by genre and sort by popularity, release date, runtime, or randomize things.

Cinematic prefers filenames like `Elysium [2013].mp4` but will happily parse torrent-style `Movies.That.Look.Like.This.2015.HDRip.XviD.XXX-XXX.AVI`.


### Features

* 🎭   Filter movies by genre
* 🖇   Sort movies by name, popularity, release date, runtime, or randomly
* 🚥   Read plotlines and summarys before watching
* 🎬   Watch multiple trailers
* 🥃   Jump straight to the IMDB page
* 🍱   Keep track of recently viewed and recently watched
* 🍅   Cycle through ratings from IMDB, TMDB, and Metacritic
* ☔️    Network throttled requests to avoid timeouts
* 🐠   Built-in caching of genres and movies

### What it finds

* Title
* Plot summary
* Release date
* Multiple trailers
* Poster + backdrop images
* Genres
* Ratings from IMDB, TMDB, and Metacritic, and current popularity
* MPAA rating
* Actors, Director, Writer
* Awards
* Runtime


# Installation

_Recently packaged for Windows!_

### [Visit the Releases page to download Cinematic for Windows, OSX, and Linux](https://github.com/lacymorrow/cinematic/releases)


# Running & Developing Cinematic _(from source)_

Anyone else can run Cinematic on any OS by downloading or cloning the repo `lacymorrow/cinematic`. 

You will need to have [nodejs](http://nodejs.org), NPM, and [Meteor](https://www.meteor.com/install) installed.

```bash
cd cinematic
npm install    # or `yarn install`!
npm start         # http://localhost:3000
```

Running `meteor` from the `cinematic` directory quickstarts the application on [http://localhost:3000](http://localhost:3000).

### Packaging

To package Cinematic for your machine architecture:

###### YOU MUST HAVE A METEOR INSTANCE RUNNING WITH MOBILE ARCHITECTURE ENABLED IN A SEPARATE TERMINAL

`npm run serve` - _is an alias for: `meteor --mobile-server=127.0.0.1:3000`_

#### Build and test Desktop version. 

In your main terminal:

`npm run desktop`


#### Full Cross-platform build

To build for a Windows target from a MacOS host, you must have wine and [XQuartz](https://www.xquartz.org/) installed
```bash
# Using Homebrew
brew cask install xquartz && brew install wine
```


```bash
# The magic script. Builds for macOS and ia32 and x64 for Windows and Linux.
# Get some coffee, this takes awhile.

npm run build 
# alias: npm run desktop -- build-installer --buil-meteor --all-archs --win --mac --linux --production

# Or, to build for a specific platform:

npm run build-mac
# alias: npm run desktop -- build-installer --build-meteor --mac --production"

npm build-win
# alias: npm run desktop -- build-installer --build-meteor --all-archs --win --production"

npm run build-linux
# alias: npm run desktop -- build-installer --build-meteor --all-archs --linux --production"
```

To only build for current architecture: `npm run build-current`


##### Other Notes

```
# deploy server for hosted media server use
DEPLOY_HOSTNAME=galaxy.meteor.com meteor deploy myapp.meteorapp.com --settings settings.json

# build the project for the local machine, with a connection to the production server
meteor --settings settings.json --mobile-server https://myapp.meteorapp.com  
```


See [wojtkowiak/meteor-desktop](https://github.com/wojtkowiak/meteor-desktop) for more information.

_As of v1.1.0, we no longer use [arboleya/electrify](https://github.com/arboleya/electrify) for packaging_


# Design
User interface design by [Steve Hernandez](http://slhernandez.com/2013/09/10/Movie-App/).

Thanks to:

* [jzjzjzj/parse-torrent-name](https://github.com/jzjzjzj/parse-torrent-name)
* [bbraithwaite/omdb-client](https://github.com/bbraithwaite/omdb-client)
* [pwnall/node-open](https://github.com/pwnall/node-open)
* Made with [Meteor](http://meteor.com) v1.8.0.2
* Packaged with [Electron](https://electronjs.org/)
* APIs provided by TMDB and OMDB


# Improvements

 - [ ] Batch request data to save http connections
 - [ ] Boost the cache to hold images
 - [ ] Force HTTPS
 - [X] File browser
 - [X] Release for Windows


### Need help?

Please post any questions or issues you come across to our [issues page](https://github.com/lacymorrow/cinematic/issues).

### Want to help?

Pull requests welcome!

[![dependencies Status](https://david-dm.org/lacymorrow/cinematic/status.svg)](https://david-dm.org/lacymorrow/cinematic) [![devDependencies Status](https://david-dm.org/lacymorrow/cinematic/dev-status.svg)](https://david-dm.org/lacymorrow/cinematic?type=dev)
