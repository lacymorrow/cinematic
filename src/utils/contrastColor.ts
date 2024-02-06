/* eslint-disable no-param-reassign */

function padZero(str: string, len?: number) {
	len = len || 2;
	const zeros = new Array(len).join('0');
	return (zeros + str).slice(-len);
}

export const contrastColor = (hex: string, bw?: boolean) => {
	if (hex.indexOf('#') === 0) {
		hex = hex.slice(1);
	}
	// convert 3-digit hex to 6-digits.
	if (hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}
	if (hex.length !== 6) {
		throw new Error('Invalid HEX color.');
	}
	const rn = parseInt(hex.slice(0, 2), 16);
	const gn = parseInt(hex.slice(2, 4), 16);
	const bn = parseInt(hex.slice(4, 6), 16);

	if (bw) {
		// https://stackoverflow.com/a/3943023/112731
		return rn * 0.299 + gn * 0.587 + bn * 0.114 > 186 ? '#000000' : '#FFFFFF';
	}

	// invert color components
	const r = (255 - rn).toString(16);
	const g = (255 - gn).toString(16);
	const b = (255 - bn).toString(16);

	// pad each with zeros and return
	return `#${padZero(r)}${padZero(g)}${padZero(b)}`;
};
