# Cinematic 🎥

A gorgeous Desktop UI for your digital movie collection, powered by Electron and React. Works on Mac, Windows, and Linux!

<div align="center">

[![Build Status][github-actions-status]][github-actions-url]
[![Github Tag][github-tag-image]][github-tag-url]

</div>

## ✨ Features

- 🎭 Filter movies by genre
- 🚥 Read plotlines and summaries before watching
- 🎬 Watch multiple trailers
- 🥃 Jump straight to the IMDB page
- 🍱 Keep track of recently viewed and watched movies
- 🍅 Cycle through ratings from IMDB, TMDB, and Metacritic
- ☔️ Network throttled requests to avoid timeouts
- 🐠 Built-in caching of genres and movies
- 🖇 Sort movies by name, popularity, release date, runtime, or randomly
- 🌙 Dark Mode support
- 🔄 Auto Updater
- 💾 Built-in Store with electron-store
- 🖱️ Context Menu
- ⌨️ Keyboard Shortcut Manager
- 🀱 Menu Bar for macOS, Windows, and Linux
- 🖥️ System Tray

[![Cinematic Light UI](https://raw.githubusercontent.com/lacymorrow/cinematic/main/public/demo.png)](https://github.com/lacymorrow/cinematic/releases)

### [Download for Windows, OSX, and Linux](https://github.com/lacymorrow/cinematic/releases)

Point Cinematic to the movie folder on your computer to scan and retrieve movie posters, ratings, trailers and much more about any movie files found.
Organize your movies by genre and sort by popularity, release date, runtime, or randomize things.

Cinematic prefers filenames like `Independence Day [1996].mp4` but will happily parse torrent-style `Movies.That.Look.Like.This.2015.HDRip.XviD.XXX-XXX.AVI`.

<p align="center">
  <img width="815" height="578" src="https://raw.githubusercontent.com/lacymorrow/cinematic/main/public/cinematic.gif">
</p>

## 🚀 Getting Started

1. Clone this repository
   ```bash
   git clone https://github.com/lacymorrow/cinematic.git
   ```

2. Go into the repository
   ```bash
   cd cinematic
   ```

3. Install dependencies
   ```bash
   yarn
   ```

4. Start the development server
   ```bash
   yarn start
   ```

## 📁 Project Structure

- `src/main`: Contains the main process code
- `src/renderer`: Contains the renderer process code (React components)
- `src/config`: Contains configuration files
- `src/utils`: Contains utility functions

## 📜 Available Scripts

- `yarn start`: Start the app in development mode
- `yarn build`: Build the app for production
- `yarn lint`: Run the linter
- `yarn test`: Run tests

## Built With

- [Electron](https://electronjs.org/)
- [React](https://reactjs.org/)
- [React Router](https://reacttraining.com/react-router/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn](https://ui.shadcn.com/)
- [TypeScript](https://www.typescriptlang.org/)

## Development

### Tailwind CSS

We use Tailwind CSS for styling. See the [Tailwind CSS docs](https://tailwindcss.com/docs) for more information.

Some Tailwind plugins have been added for convenience:

- [Tailwind Animate](https://github.com/jamiebuilds/tailwindcss-animate)
- [Tailwind Container Queries](https://github.com/tailwindlabs/tailwindcss-container-queries)
- Child selectors to target immediate children like `child:w-xl`
- Group selectors: `group` (Parent) `group-hover:bg-gray-100` (Child)

### Shadcn

Shadcn is a UI component library for React. See the [Shadcn docs](https://ui.shadcn.com/) for more information.
Use `npx shadcn-ui@latest add accordion ...` to add a component to your project.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

[github-actions-status]: https://github.com/lacymorrow/cinematic/workflows/Build/badge.svg
[github-actions-url]: https://github.com/lacymorrow/cinematic/actions
[github-tag-image]: https://img.shields.io/github/tag/lacymorrow/cinematic.svg?label=version
[github-tag-url]: https://github.com/lacymorrow/cinematic/releases/latest
