export const getOS = () => {
	const adapter =
		process?.platform || navigator?.userAgent?.platform || navigator?.platform;

	const os = adapter.toLowerCase();
	if (os.includes('win')) {
		return 'windows';
	}

	if (os.includes('darwin') || os.includes('mac')) {
		return 'macos';
	}

	return 'linux';
};
