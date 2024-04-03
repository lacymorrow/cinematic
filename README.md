Cinematic
===========
> 🎥  A gorgeous Desktop UI for your digital movie collection, works on Mac, Windows, and Linux!

**Have a digital movie collection?**

Cinematic is a desktop app to beautifully organize and automatically retrieve information about your digital movie collection, so you can spend less time searching and more time watching.

<p align="center">
  <img width="720" height="450" src="https://raw.githubusercontent.com/lacymorrow/cinematic/main/public/demo.gif">
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

### [Visit the Releases page to download Cinematic for Windows, OSX, and Linux](https://github.com/lacymorrow/cinematic/releases)

# Design

UI design by [ShadCN](https://ui.shadcn.com)

Original interface design by [Steve Hernandez](http://slhernandez.com/2013/09/10/Movie-App/).

* Built with [Electron](https://electronjs.org/)
* APIs provided by TMDB and OMDB


# Road map

**Update Oct. 27, 2019:** Currently refactoring the codebase to make a clear upgrade path to faster, leaner product.

 - [ ] Save images to cache
 - [X] A11y - tab index, keyboard controls
 - [X] Speed boost
 - [X] File open dialog
 - [X] Windows Release


### Need help?

Please post any questions or issues you come across to our [issues page](https://github.com/lacymorrow/cinematic/issues).

## Development

```bash
# Run dev app
yarn start

# Build app for production
yarn package
```

### Main Process

Imports must be relative (the alias `@` is only available in the renderer process).

#### Order of operations

1. `main/main` is run.

If there is a previous session it will be restored. The directory is scanned again, and new files are added, missing files are marked deleted, and existing files are loaded from cache, checked for:

- Cache expiration;
- Missing tmdb/omdb/trailers metadata
- basic equality checks (file size, last modified date)

If any of the above are true, the file is sent to the queue to fetch updated metadata.

### Renderer Process

You may use the alias `@` to import from the `src` directory.

Entry is `src/renderer/App`, which contains the router. Routing is handled by [react-router](https://reacttraining.com/react-router/web/guides/quick-start). Instead of `<a>` elements, use `<Link to={"/my/path"}>` elements from `react-router-dom`.

To open links in the user's default browser, use the `<ExternalLink>` component from `src/renderer/components/ExternalLink`.

❤️ **Based on [electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate/).** ❤️

#### Debugging

https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/400
