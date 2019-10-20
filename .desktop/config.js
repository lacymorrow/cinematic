'use strict'
import Store from 'electron-store'

const defaults = {
	OMDB_KEY: 'e0341ca3',
	TMDB_KEY: '9d2bff12ed955c7f1f74b83187f188ae'
}

module.exports.defaults = defaults

module.exports.config = new Store({
	defaults
})
