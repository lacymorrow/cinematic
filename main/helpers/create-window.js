import { screen, BrowserWindow } from 'electron'
import Store from 'electron-store'

export default function createWindow( windowName, options ) {

	const key = `window-state-${windowName}`
	const store = new Store( { name: key } )
	const defaultSize = {
		width: options.width,
		height: options.height
	}
	let state = {}

	const win = new BrowserWindow( {
		...options,
		...state,
		webPreferences: {
			nodeIntegration: true,
			...options.webPreferences
		}
	} )

	const restore = () => store.get( key, defaultSize )

	const getCurrentPosition = () => {

		const position = win.getPosition()
		const size = win.getSize()

		return {
			x: position[0],
			y: position[1],
			width: size[0],
			height: size[1]
		}

	}

	const windowWithinBounds = ( windowState, bounds ) => {

		return (
			windowState.x >= bounds.x &&
			windowState.y >= bounds.y &&
			windowState.x + windowState.width <= bounds.x + bounds.width &&
			windowState.y + windowState.height <= bounds.y + bounds.height
		)

	}

	const resetToDefaults = () => {

		const { bounds } = screen.getPrimaryDisplay()

		return { ...defaultSize, x: ( bounds.width - defaultSize.width ) / 2,
			y: ( bounds.height - defaultSize.height ) / 2 }

	}

	const ensureVisibleOnSomeDisplay = windowState => {

		const visible = screen.getAllDisplays().some( display => {

			return windowWithinBounds( windowState, display.bounds )

		} )
		if ( !visible ) {

			// Window is partially or fully not visible now.
			// Reset it to safe defaults.
			return resetToDefaults()

		}

		return windowState

	}

	const saveState = () => {

		if ( !win.isMinimized() && !win.isMaximized() ) {

			Object.assign( state, getCurrentPosition() )

		}

		store.set( key, state )

	}

	state = ensureVisibleOnSomeDisplay( restore() )

	win.on( 'close', saveState )

	return win

}
