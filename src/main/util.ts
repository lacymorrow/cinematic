/* eslint import/prefer-default-export: off */
import path from 'path';
import { URL } from 'url';

export const is = {
	debug:
		process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true',
	prod: process.env.NODE_ENV === 'production',
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
