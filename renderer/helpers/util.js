import config from '../config'

// Current time in ms
export const epoch = () => {

	const d = new Date()

	return d.getTime()

}

export const getElByKeyValue = ( set, key, value ) => {

	for ( const item of set ) {

		if ( String( item[key] ) === String( value ) ) {

			console.log( item )

			return item

		}

	}

	return {}

}

export const getRandomColor = () => {

	// Pick a "red" from 0-255
	const r = Math.floor( Math.random() * 256 )

	// Pick a "green" from 0-255
	const g = Math.floor( Math.random() * 256 )

	// Pick a "blue" from 0-255
	const b = Math.floor( Math.random() * 256 )

	// HEX: return `#${(Math.random()*0xFFFFFF<<0).toString(16)}`;
	return `rgb(${r}, ${g}, ${b})`

}

// Insecure string hashing function for UUIDs
// credit: https://github.com/darkskyapp/string-hash
export const hash = str => {

	let hash = 5381
	let i = str.length

	while ( i ) {

		hash = ( hash * 33 ) ^ str.charCodeAt( --i )

	}

	/* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
	 * integers. Since we want the results to be always positive, convert the
	 * signed int to an unsigned by doing an unsigned bitshift. */
	return hash >>> 0

}

// String matches ignore list
export const ignorePattern = str => {

	return config.IGNORE_PATTERN.includes( str.toLowerCase() )

}

// Bool if a string is a digit
export const isDigit = str => {

	return !isNaN( parseFloat( str ) ) && isFinite( str )

}

// Returns a new object with the values at each key mapped using mapFn(value)
export const objectMap = ( object, mapFn ) => {

	return Object.keys( object ).reduce( ( result, key ) => {

		result[key] = mapFn( object[key] )

		return result

	}, {} )

}

export const isPageVsGenreId = page => {

	switch ( page ) {

		// Main (movies)
		case config.DEFAULT_STATE.currentPage:

			return true

		default:

			return false

	}

}

// Replace underscores and hypens with spaces replaceUglyChars is a better name
export const prettyName = name => {

	name = replaceAll( name, '_', ' ' )
	name = replaceAll( name, '-', ' ' )

	return name

}

// Replace every instance of a string with another
const replaceAll = ( str, find, replace ) => {

	return str.replace( new RegExp( find, 'g' ), replace )

}

