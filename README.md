Cinematic
===========
> 🎥  A gorgeous Desktop UI for your digital movie collection.

**Have a digital movie collection?**

Cinematic is a desktop app to beautifully organize and automatically retrieve information about your digital movie collection, so you can spend less time searching and more time watching

<p align="center">
  <img width="720" height="450" src="http://lacymorrow.com/images/github/cinematic/demo.gif">
</p>

### [Download for Windows, OSX, and Linux](https://github.com/lacymorrow/cinematic/releases)

Point Cinematic to the movie folder on your computer to scan and retrieve movie posters, ratings, trailers and much more about any movie files found.
Organize your movies by genre and sort by popularity, release date, runtime, or randomize things.

Cinematic prefers filenames like `Independence Day [1996].mp4` but will happily parse torrent-style `Movies.That.Look.Like.This.2015.HDRip.XviD.XXX-XXX.AVI`.


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

### Information provided

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

### Or build and [run from source](https://github.com/lacymorrow/cinematic/blob/master/docs/build.md)


# Design
User interface design by [Steve Hernandez](http://slhernandez.com/2013/09/10/Movie-App/).

Thanks to:

* [jzjzjzj/parse-torrent-name](https://github.com/jzjzjzj/parse-torrent-name)
* [bbraithwaite/omdb-client](https://github.com/bbraithwaite/omdb-client)
* [pwnall/node-open](https://github.com/pwnall/node-open)
* Built with [Meteor](http://meteor.com)
* Running on [Electron](https://electronjs.org/)
* APIs provided by TMDB and OMDB


# Road map

**Update Oct. 27, 2019:** Currently refactoring the codebase to make a clear upgrade path to faster, leaner product.

 - [ ] Speed boost
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
