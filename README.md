Cinematic
===========

Do you store your movies on a hard drive? This is your tool.

![Cinematic](http://lacymorrow.com/images/cinematic.gif)

Cinematic takes the effort out of organizing your movies and finds information, photos, and trailers for you to make choosing what to watch a breeze. 

Point it to the movie folder on your hard drive and it will automatically find movie posters, ratings, trailers and more. Organize your movies by genre and sort by popularity, release date, or randomize things. It prefers tiles like `Elysium [2013].mp4` but will happily parse torrent-style `Movies.That.Look.Like.This.2015.HDRip.XviD.XXX-XXX.AVI`.

### What it finds

* Title
* Plot
* Release Date
* Multiple Trailers
* Poster + Backdrop
* Genres
* Ratings from IMDB, TMDB, and Metacritic, as well as current popularity
* MPAA Rating
* Actors, Director, Writer
* Awards
* Runtime

This app was created as an exploratory dive into the world of [Meteor](http://meteor.com). Currently Meteor version 1.1.0.3.

Uses TMDB and OMDB to look up release date, poster, description, rating, and trailer and display them in an organized fashion.

# Installation

Download or clone the repo `lacymorrow/cinematic`. 

You will need to have [nodejs](http://nodejs.org), NPM, and [Meteor](https://www.meteor.com/install) installed.


# Running Cinematic

From the `cinematic` directory run `meteor` to quickstart the application on [http://localhost:3000](http://localhost:3000).


# Features

* Read plotlines and summarys before watching
* Keeps track of recently viewed and recently watched
* Built-in network throttling for requests to avoid timeouts.
* Filter movies by genre
* Watch multiple trailers
* Cycle through ratings from IMDB, TMDB, and Metacritic
* Order movies randomly, roll the dice
* Built-in caching of genres and movies


#Design
User interface design by [Steve Hernandez](http://slhernandez.com/2013/09/10/Movie-App/)
