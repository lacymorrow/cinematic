/* eslint import/prefer-default-export: off */
import { app } from 'electron';
import path from 'path';
import os from 'os';
import { URL } from 'url';

export const electronVersion = process.versions.electron;

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

export const debugInfo = () =>
	`
  ${app.getName()} ${app.getVersion()}
  Electron ${electronVersion}
  ${process.platform} ${os.release()}
  Locale: ${app.getLocale()}
  `.trim();
