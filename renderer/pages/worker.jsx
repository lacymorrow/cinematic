import React, { useEffect } from 'react'
import ipc from '../helpers/safe-ipc'

const Worker = () => {

	const updateOnlineStatus = () => {

		ipc.send( 'to-main', { command: 'online', data: navigator.onLine } )

	}

	// Kick off everything
	const startup = () => {

		const app = require( '../helpers/app' )

		updateOnlineStatus()

		// Let the main thread know this thread is ready to process something
		// ipc.send( 'ready' )

		app.start()

	}

	useEffect( () => {

		// ComponentDidMount()
		// Test for network connection
		window.addEventListener( 'online', updateOnlineStatus )
		window.addEventListener( 'offline', updateOnlineStatus )

		startup()

		// ComponentWillUnmount()
		return () => {

			// Unregister everything
			ipc.removeAllListeners( 'to-worker' )

			window.removeEventListener( 'online' )
			window.removeEventListener( 'offline' )

		}

	} ) // Passing an empty array prevents effect on componentDidUpdate()

	return ( <div/> )

}

export default Worker
