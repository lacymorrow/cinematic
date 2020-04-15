import { app, dialog, ipcMain } from 'electron'
import { is } from 'electron-util'
import serve from 'electron-serve'
import logger from 'electron-timber'

import config from '../renderer/config'
import { createWindow } from './helpers'

// We want await, so we wrap in an async
( async () => {

	const isProd = process.env.NODE_ENV === 'production'

	if ( isProd ) {

		serve( { directory: 'app' } )

	} else {

		logger.log( 'Development mode: ', is.development )
		app.setPath( 'userData', `${app.getPath( 'userData' )} (development)` )

	}

	await app.whenReady()

	const workerWindow = createWindow( 'worker', {
		// Show: false,  // <--- Comment me out to debug the worker window
		webPreferences: { nodeIntegration: true }
	} )

	const mainWindow = createWindow( 'main', {
		width: 1200,
		height: 800
		// EnableLargerThanScreen: true, // Enable the window to be resized larger than screen. Only relevant for macOS.
		// frame: false,
		// transparent: true,
		// titleBarStyle: 'hidden'

	} )

	// Main thread can receive directly from windows
	ipcMain.on( 'to-main', ( event, arg ) => {

		const { command, data } = arg
		if ( command ) {

			switch ( command ) {

				case 'online':
					logger.log( `Online: ${data}` )
					break
				case 'log':
					logger.log( `Log - ${data}` )
					break
				default:
					logger.log( `Command ${command}: ${data}` )

			}

		} else {

			// Argument is not a command
			logger.log( `Invalid message: ${arg}` )

		}

	} )

	// Windows can talk to each other via main
	ipcMain.on( 'for-renderer', ( event, arg ) => {

		mainWindow.webContents.send( 'to-renderer', arg )

	} )

	ipcMain.on( 'for-worker', ( event, arg ) => {

		workerWindow.webContents.send( 'to-worker', arg )

	} )

	ipcMain.on( 'open-file-dialog', async () => {

		try {

			const event = await dialog.showOpenDialog( {
				filters: [
					{ name: 'Movies', extensions: config.VALID_FILETYPES },
					{ name: 'All Files', extensions: [ '*' ] }
				],
				title: 'Scan Movies',
				message: 'Choose movie directory:',
				properties: [ 'openDirectory', 'openFile' /* , 'multiSelections' */]
			} )

			if ( event ) {

				workerWindow.webContents.send( 'to-worker', { command: 'choose-directory', data: event } )

			} else {

				throw new Error( 'Error: No directory response from dialog' )

			}

		} catch ( error ) {

			logger.log( error )
			workerWindow.webContents.send( 'to-worker', { command: 'choose-directory', data: false } )

		}

	} )

	ipcMain.on( 'ready', () => logger.log( 'Worker ready' ) )

	mainWindow.on( 'closed', () => {

		// Call quit to exit, otherwise the background windows will keep the app running
		app.quit()

	} )

	app.on( 'window-all-closed', () => {

		app.quit()

	} )

	if ( isProd ) {

		await mainWindow.loadURL( 'app://./home.html' )
		await workerWindow.loadURL( 'app://./worker.html' )

	} else {

		const port = process.argv[2]
		await mainWindow.loadURL( `http://localhost:${port}/home` )
		await workerWindow.loadURL( `http://localhost:${port}/worker` )
		mainWindow.webContents.openDevTools()
		workerWindow.webContents.openDevTools()

	}

} )()

// Load
// Check cache
// -> Load movies from cache

// get previous state
// If no dir, get OS media dir
// Scan dir for existence
// search dir
// create movies
// check network
// get data
// cache
