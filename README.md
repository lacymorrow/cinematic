Cinematic
===========

Have a digital movie collection?

Cinematic is a desktop app to beautifully organize and automatically retrieve information about your digital movie collection. 

#### [Download for Windows, OSX, and Linux](https://github.com/lacymorrow/cinematic/releases)

![Cinematic](http://lacymorrow.com/images/github/cinematic/demo.gif)


Point Cinematic to the movie folder on your computer to scan and retrieve movie posters, ratings, trailers and much more about any movie files found. Organize your movies by genre and sort by popularity, release date, runtime, or randomize things. It prefers filenames like `Elysium [2013].mp4` but will happily parse torrent-style `Movies.That.Look.Like.This.2015.HDRip.XviD.XXX-XXX.AVI`.

### What it finds

* Title
* Plot
* Release Date
* Multiple Trailers
* Poster + Backdrop
* Genres
* Ratings from IMDB, TMDB, and Metacritic, and current popularity
* MPAA Rating
* Actors, Director, Writer
* Awards
* Runtime

### Features

* Filter movies by genre
* Sort movies by name, popularity, release date, runtime, or randomly
* Read plotlines and summarys before watching
* Watch multiple trailers
* Jump straight to the IMDB page
* Keep track of recently viewed and recently watched
* Cycle through ratings from IMDB, TMDB, and Metacritic
* Built-in caching of genres and movies
* Built-in network throttling of requests to avoid timeouts

This app was created as an exploratory dive into the world of [Meteor](http://meteor.com). Currently Meteor version 1.2.1.

Uses TMDB and OMDB to look up movie information and display in an organized fashion.

# Installation

_Recently packaged for Windows!_

#### [Visit the Releases page to download Cinematic for Windows, OSX, and Linux](https://github.com/lacymorrow/cinematic/releases)


### Running & Developing Cinematic _(from source)_

Anyone else can run Cinematic on any OS by downloading or cloning the repo `lacymorrow/cinematic`. 

You will need to have [nodejs](http://nodejs.org), NPM, and [Meteor](https://www.meteor.com/install) installed.

From the `cinematic` directory run `meteor` to quickstart the application on [http://localhost:3000](http://localhost:3000).

### Packaging

To package Cinematic for your machine architecture:

###### YOU MUST HAVE A METEOR INSTANCE RUNNING WITH MOBILE ARCHITECTURE ENABLED IN A SEPARATE TERMINAL

`npm run serve` - _is an alias for: `meteor --mobile-server=127.0.0.1:3000`_

In your main terminal:


#### Build and test Desktop version. 

`npm run desktop`


#### Full Cross-platform build

```bash
# The magic script. Builds for osx and ia32 and x64 for windows and linux. 

npm run desktop -- build-installer --all-archs --win --mac --linux --production

```

To only build for current architecture: `npm run desktop -- build-installer --production`



##### Other Notes

```
# deploy server for hosted media server use
DEPLOY_HOSTNAME=galaxy.meteor.com meteor deploy myapp.meteorapp.com --settings settings.json

# build the calculator for the local machine, with a connection to the production server
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


# Improvements
* batch send data to save http requests (force https?)
* Boost that cache


### Need help?

Please post any questions or issues you come across to our [issues page](https://github.com/lacymorrow/cinematic/issues).

### Want to help?

Pull requests welcome!
