export const getOS = () => {
	const adapter =
		process?.platform ||
		navigator?.platform ||
		// @ts-ignore
		navigator?.userAgentData?.platform;

	const os = adapter.toLowerCase();

	if (os.includes('darwin') || os.includes('mac')) {
		return 'mac';
	}

	if (os.includes('win')) {
		return 'windows';
	}

	return 'linux';
};
