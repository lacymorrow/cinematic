import os from 'os';
import { app } from 'electron';
import path from 'path';

export const electronVersion = process.versions.electron || '0.0.0';

export const debugInfo = () =>
	`
  ${app.getName()} ${app.getVersion()}
  Electron ${electronVersion}
  ${process.platform} ${os.release()}
  Locale: ${app.getLocale()}
  `.trim();

const getDefaultPath = () => {
	try {
		return app.getPath('videos');
	} catch (_e) {
		try {
			return app.getPath('home');
		} catch (error) {
			console.error('Could not get app path: ', error);
		}
	}
	return path.join(__dirname, 'media');
};

export const DEFAULT_PATH = getDefaultPath();
