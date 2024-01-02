/* eslint import/prefer-default-export: off */
import path from 'path';
import { URL } from 'url';
import { FILE_IGNORE_PATTERN } from '../config/config';

// Via electron-util: https://github.com/sindresorhus/electron-util/blob/main/source/is.js
export const is = {
	debug:
		process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true',
	prod: process.env.NODE_ENV === 'production',
	macos: process.platform === 'darwin',
	linux: process.platform === 'linux',
	windows: process.platform === 'win32',
	main: process.type === 'browser',
	renderer: process.type === 'renderer',
	development: process.env.NODE_ENV === 'development',
	macAppStore: process.mas === true,
	windowsStore: process.windowsStore === true,
};

export function resolveHtmlPath(htmlFileName: string) {
	if (process.env.NODE_ENV === 'development') {
		const port = process.env.PORT || 1212;
		const url = new URL(`http://localhost:${port}`);
		url.pathname = htmlFileName;
		return url.href;
	}
	return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export const fileNameRegex = /^(.*?)(?:\[? ([\d]{4})?\]?|\(?([\d]{4})?\)?)$/g;

export const isDigit = (str: string) => {
	const digit = /^\d+$/;
	return digit.test(str);
};

export const ignorePattern = (str: string) => {
	return FILE_IGNORE_PATTERN.includes(str.toLowerCase());
};
