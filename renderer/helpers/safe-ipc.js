import { ipcRenderer } from 'electron'

const on = ( key, fn ) => {

	if ( ipcRenderer ) {

		ipcRenderer.on( key, fn )

	}

}

const removeAllListeners = key => {

	if ( ipcRenderer ) {

		ipcRenderer.removeAllListeners( key )

	}

}

const send = ( key, arg ) => {

	if ( ipcRenderer ) {

		ipcRenderer.send( key, arg )

	}

}

export const broadcast = str => {

	send( 'to-main', {
		command: 'log',
		data: `${process.pid}: ${str}`
	} )

}

/* Open file using system defaults */
export const openFile = filepath => send( 'for-worker', { command: 'file', data: filepath } )

/* Open External URL */
export const openUrl = url => send( 'for-worker', { command: 'url', data: url } )

export const randomizeMovies = () => send( 'for-worker', { command: 'randomize' } )

export const syncState = s => {

	s = s || {}
	send( 'for-worker', { command: 'sync', data: s } )

}

// Network status
export const updateOnlineStatus = () => {

	send( 'to-main', { command: 'online', data: navigator.onLine } )

}

export default { on, send, removeAllListeners }
