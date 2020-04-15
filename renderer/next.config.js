module.exports = {
	reactStrictMode: true,
	webpack: config =>
		Object.assign( config, {
			target: 'electron-renderer'
		} )
}
