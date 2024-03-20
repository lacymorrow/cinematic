/* eslint-disable no-bitwise */
// Create a UUID that may?? be RFC4122 version 4 compliant (copilot)
// ex: 'a47c87c0-aaf2-4e0b-9936-386741b899ab'
export const getUUID = () => {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

// Create a simple UUID that is not RFC4122 compliant
// ex: 'a47c87c0'
export const simpleUUID = () => {
	return Math.random().toString(36).substring(7);
};
