/* Safe console.log which outputs in the called context - client/server */
export const broadcast = function (msg, err) {
	if (err === true) {
		// Log error
	}

	if (typeof console !== 'undefined') {
		console.log(msg)
	}
}

export const epoch = function () {
	const d = new Date()
	return d.getTime() / 1000
}

export const prettyName = function (name) {
	name = replaceAll(name, '_', ' ') // Replace underscores with spaces
	name = replaceAll(name, '-', ' ')
	return name
}

const replaceAll = function (str, find, replace) {
	return str.replace(new RegExp(find, 'g'), replace)
}
