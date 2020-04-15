import React, { useEffect, useState } from 'react'
import Head from 'next/head'

import { ThemeProvider } from 'styled-components'
import { IoIosShuffle as ShuffleIcon } from 'react-icons/io'

import config from '../config'
import strings from '../helpers/strings'

import { GlobalStyle } from '../styled/global'
import { dark, light } from '../styled/themes'
import {
	ContainerX,
	HeaderX,
	MainX,
	DisplayX,
	NoMoviesTextX,
	ShuffleButtonX,
	SortWrapperX,
	WrapperX
} from '../styled/components'

import ipc, { randomizeMovies, syncState } from '../helpers/safe-ipc'
import { getElByKeyValue, isPageVsGenreId } from '../helpers/util'

import Directory from '../components/directory'
import FileInput from '../components/file-input'
import Loader from '../components/loader'
import Logo from '../components/logo'
import Messagebox from '../components/messagebox'
import MovieInfo from '../components/movie-info'
import MovieList from '../components/movie-list'
import Progress from '../components/progress'
import Sidebar from '../components/sidebar'
import Sort from '../components/sort'
import ThemeToggle from '../components/theme-toggle'

// TODO addRecent, addWatched, reset

const Home = () => {

	// TODO - set initial state from electron store vals

	// State defaults
	const [ movies, setMovies ] = useState( [] )
	const [ genres, setGenres ] = useState( [] )

	const [ currentMovie, setCurrentMovie ] = useState( {} )
	const [ currentSort, setCurrentSort ] = useState( '' )
	const [ currentPage, setCurrentPage ] = useState( config.DEFAULT_STATE.currentPage )
	const [ currentTheme, setCurrentTheme ] = useState( light )

	const [ state, setState ] = useState( config.DEFAULT_STATE )

	// State properties
	const { dirpath, isShuffling, loading, message } = state

	// Merge state
	const assignState = newState => {

		setState( prevState => {

			return { ...prevState, ...newState }

		} )

	}

	/* HANDLERS */
	const onChangePath = dirpath => {

		// Set new directory
		assignState( { dirpath } )
		syncState( { dirpath } )

	}

	const onChangeSort = sort => {

		setCurrentSort( sort )

	}

	const onChangePage = page => {

		if ( isPageVsGenreId( page ) ) {

			setCurrentPage( page )

		} else {

			for ( const genre of genres ) {

				if ( genre._id === page.toString() ) {

					setCurrentPage( genre._id )

				}

			}

		}

	}

	const onChangeTheme = () => setCurrentTheme( theme => {

		// Todo save theme and reload
		if ( theme === light ) {

			return dark

		}

		return light

	} )

	const onChangeCurrentMovie = mid => {

		const movie = getElByKeyValue( movies, '_id', mid )
		setCurrentMovie( movie )

	}

	const onClickResetButton = () => {

		console.log( strings.resetBtn.click )
		syncState() // Send state back to worker

	}

	const onClickShuffleButton = () => randomizeMovies()

	/* Render methods */
	const isMoviePanelOpen = () => Object.prototype.hasOwnProperty.call( currentMovie, 'title' )

	// TODO HELP: Is this how to do work on data before passing it to a component to render?
	const getOrganizedMovieList = () => {

		// Filter
		const paged = movies.filter( movie => {

			switch ( currentPage ) {

				case config.DEFAULT_STATE.currentPage:
					// Main (all)
					return true // No break needed

				default:
					// Filter genres
					return movie.genre_ids && movie.genre_ids.includes( parseInt( currentPage, 10 ) ) // No break needed

			}

		} )

		// Sort
		switch ( currentSort ) {

			case 'popularity':
				paged.sort( ( x, y ) => y.popularity - x.popularity )
				break
			case 'ratings':
				// IMDB Rating
				paged.sort( ( x, y ) => parseFloat( y.imdbRating ) - parseFloat( x.imdbRating ) )
				break
			case 'release':
				// Release date
				paged.sort( ( x, y ) => parseInt( y.releaseDate, 10 ) - parseInt( x.releaseDate, 10 ) )
				break
			case 'runtime':
				// Runtime
				paged.sort( ( x, y ) => x.runtime - y.runtime )
				break
			case 'shuffled':
				paged.sort( ( x, y ) => x.seed - y.seed )
				break
			case 'alphabetical':
			default:
				// Title
				paged.sort( ( x, y ) => x.name.localeCompare( y.name ) )
				break

		}

		return paged

	}

	/* State Effect Functions */

	// State change callback
	useEffect( () => {

	}, [ state ] )

	// Setup and tear-down communication
	useEffect( () => {

		// Depends on [], so never re-run
		// componentDidMount()
		// register ipc events
		ipc.on( 'to-renderer', ( event, arg ) => {

			if ( typeof arg === 'object' ) {

				const { command, data } = arg
				switch ( command ) {

					case 'genres':
						// Sort alphabetically
						setGenres( data.sort( ( x, y ) => x.name && x.name.localeCompare( y.name ) ) )
						break
					case 'movies':
						setMovies( data )
						break
					case 'state':
						assignState( data )
						break
					default:
						console.log( `${strings.error.ipc}: ${arg}` )
						break

				}

			}

		} )

		// Send values back to worker for store (dirpath mainly)
		syncState()

		return () => {

			// ComponentWillUnmount()
			// Unregister things
			ipc.removeAllListeners( 'to-renderer' )

		}

	}, [] )

	/* Template */

	const backdropHeight = 280

	const organizedMovieList = getOrganizedMovieList()
	const hasMovies = organizedMovieList.length !== 0

	return (
		<ThemeProvider theme={currentTheme}>
			<GlobalStyle/>
			<Head>
				<title>Home - Nextron (ipc-communication)</title>
			</Head>
			<Progress data={loading}/>
			<ContainerX>
				<WrapperX isVisible={isMoviePanelOpen()}>
					<HeaderX>

						<Logo/>

						<Directory
							data={dirpath}
							handleChange={onChangePath}
						/>

						<FileInput/>

						<ThemeToggle isActive={currentTheme === light} handleChange={onChangeTheme}/>

					</HeaderX>

					<MainX>
						<Sidebar current={currentPage} data={genres} handleChange={onChangePage} handleRefresh={onClickResetButton} movieCount={movies.length}/>

						{( hasMovies && (
							<DisplayX>
								<SortWrapperX>
									<Sort current={currentSort} data={config.FILTERS} handleChange={onChangeSort}/>
									{currentSort === 'shuffled' && (
										<ShuffleButtonX data="shuffle" handleChange={onClickShuffleButton}><ShuffleIcon size={32}/></ShuffleButtonX>
									)}
									<Loader isActive={isShuffling}/>
								</SortWrapperX>

								<MovieList current={currentMovie._id} data={organizedMovieList} handleChange={onChangeCurrentMovie} height={backdropHeight}/>
							</DisplayX>
						) ) || (
							<NoMoviesTextX>{strings.movie.noMovies}</NoMoviesTextX>
						)}

					</MainX>

				</WrapperX>

				<MovieInfo data={currentMovie} isVisible={isMoviePanelOpen()}/>

				{message && <Messagebox data={message}/>}

			</ContainerX>
		</ThemeProvider>
	)

}

export default Home
